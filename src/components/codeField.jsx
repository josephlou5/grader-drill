import React, { Component } from 'react';

class CodeField extends Component {

    handleMouseUp = () => {

        const DEBUG = false;

        const selection = document.getSelection();
        if (!selection || selection.rangeCount !== 1) {
            return;
        }
        const range = selection.getRangeAt(0);
        if (!range || range.collapsed) {
            return;
        }
        if (DEBUG) console.log('Range object:', range);

        let {startContainer, endContainer} = range;
        let startChar = range.startOffset;
        let endChar = range.endOffset;
        if (DEBUG) {
            console.log("start:", startContainer);
            console.log("end:", endContainer);
            console.log("offsets:", startChar, endChar);
        }

        // shouldn't happen but just in case
        if (startContainer.nodeType !== Node.TEXT_NODE) {
            console.log("Error: start container is not text:", startContainer);
            return;
        }
        if (endContainer.nodeType !== Node.TEXT_NODE) {
            console.log("Error: end container is not text:", endContainer);
            return;
        }

        // get line child nodes
        const lines = this.props.question.code.split('\n');
        const children = lines.map((temp, index) => {
            const line = document.getElementById("line-" + (index + 1));
            return [...line.childNodes];
        })
        if (DEBUG) console.log("children:", children);
        const childrenFlat = children.flat();
        const childrenText = childrenFlat.map(child => {
            if (child.nodeType === Node.TEXT_NODE) return child;
            // should be the text of the span
            return child.firstChild;
        });
        if (DEBUG) console.log("flat:", childrenText.map(child => child.nodeValue));

        // fix containers
        // container is badge
        if (startContainer.parentNode.id.endsWith("-badge")) {
            // go up to highlight span
            startContainer = startContainer.parentNode;
        }
        if (endContainer.parentNode.id.endsWith("-badge")) {
            // go up to highlight span
            endContainer = endContainer.parentNode;
        }
        // container is line number
        if (endContainer.parentNode.id.startsWith("linenum-")) {
            // when this happens, endOffset = 2, so need to reset that too
            const lineNum = parseInt(endContainer.parentNode.id.split("-")[1]);
            if (lineNum === 1) {
                // already first line, so stay in this line instead
                endContainer = children[lineNum - 1][0];
                endChar = 0;
            } else {
                // go back to previous line
                const prevLine = children[lineNum - 2];
                endContainer = prevLine[prevLine.length - 1];
                if (endContainer.nodeType === Node.TEXT_NODE) {
                    endChar = endContainer.nodeValue.length;
                } else {
                    endChar = endContainer.firstChild.nodeValue.length;
                }
            }
        }

        let startIndex = childrenText.indexOf(startContainer);
        let endIndex = childrenText.indexOf(endContainer);
        // shouldn't happen but just in case
        if (startIndex === -1 || endIndex === -1) {
            console.log("start or end not found");
            return;
        }

        // start is at the very end of a container
        if (startChar === childrenText[startIndex].length) {
            // shouldn't happen but just in case
            if (startIndex === childrenFlat.length - 1) {
                console.log("start is at the very last character");
                return;
            }
            startIndex++;
            startChar = 0;
        }
        // end is at the very beginning of a container
        if (endChar === 0) {
            // shouldn't happen but just in case
            if (endIndex === 0) {
                console.log("end is at the very first character");
                return;
            }
            endIndex--;
            endChar = childrenText[endIndex].length;
        }

        if (DEBUG) {
            console.log("indices:", startIndex, endIndex);
            console.log("chars:", startChar, endChar);
        }

        // shrink to text nodes
        while (childrenFlat[startIndex].nodeType !== Node.TEXT_NODE) {
            startIndex++;
            startChar = 0;
        }
        while (childrenFlat[endIndex].nodeType !== Node.TEXT_NODE) {
            endIndex--;
            endChar = childrenText[endIndex].length;
        }

        if (DEBUG) console.log("Fixed indices:", startIndex, endIndex);

        // make sure there are no highlights in the middle
        for (let i = startIndex + 1; i < endIndex; i++) {
            if (childrenFlat[i].nodeType !== Node.TEXT_NODE) {
                console.log("Highlight at index " + i + "; invalid selection");
                return;
            }
        }

        // find bounds
        let i = 0;
        let startLine = -1, endLine = -1;
        for (let lineNum = 0; lineNum < children.length; lineNum++) {
            let lineOffset = 0;
            if (DEBUG) console.log("line " + (lineNum + 1));
            for (let j = 0; j < children[lineNum].length; j++) {
                if (DEBUG) console.log("i =", i);
                if (i === startIndex) {
                    if (DEBUG) console.log("found start index");
                    startLine = lineNum;
                    startChar += lineOffset;
                }
                if (i === endIndex) {
                    if (DEBUG) console.log("found end index");
                    endLine = lineNum;
                    endChar += lineOffset;
                }
                lineOffset += childrenText[i].length;
                i++;
            }
            if (i > endIndex) break;
        }
        // shouldn't happen but just in case
        if (startLine === -1 || endLine === -1) {
            console.log("Error: start/end line not found:", startLine, endLine);
            return;
        }

        const highlight = {
            startLine: startLine,
            startChar: startChar,
            endLine: endLine,
            endChar: endChar,
            byUser: true,
        }
        if (DEBUG) console.log(highlight);
        this.props.onHighlight(highlight);

        // if single click on a highlighted portion, adds another highlight
        // so collapse the range to avoid that
        range.collapse();
    };

    renderCodeLines = () => {
        const lines = this.props.question.code.split('\n');

        // create inHighlight array, which determines where highlights are
        let inHighlight = new Array(lines.length);
        for (let i = 0; i < lines.length; i++) {
            inHighlight[i] = new Array(lines[i].length).fill(0);
        }
        const {highlights} = this.props.question;
        for (let i = 0; i < highlights.length; i++) {
            const highlightNum = i + 1;
            const {startLine, startChar, endLine, endChar} = highlights[i];
            if (startLine === endLine) {
                for (let c = startChar; c < endChar; c++) {
                    inHighlight[startLine][c] = highlightNum;
                }
                continue;
            }
            for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
                for (let c = 0; c < lines[lineNum].length; c++) {
                    if (lineNum === startLine && c < startChar) continue;
                    if (lineNum === endLine && c >= endChar) break;
                    inHighlight[lineNum][c] = highlightNum;
                }
            }
        }

        function createHighlight(lineNum, text, highlightNum, badge) {
            // Creates a highlight with the appropriate line number, highlight number, and badge.
            const idText = "line-" + lineNum + "-highlight-" + highlightNum;
            const highlightClasses = [
                "highlight",
                "user-select-none",
                "position-relative",
            ];
            const badgeClasses = [
                "user-select-none",
                "position-absolute",
                "top-0",
                "start-100",
                "translate-middle",
                "badge",
                "rounded-pill",
                "bg-primary",
            ];
            return (
                <span className={highlightClasses.join(" ")} id={idText}>
                    {text}
                    {badge &&
                        <span className={badgeClasses.join(" ")} id={idText + "-badge"}>
                            {highlightNum}
                        </span>
                    }
                </span>
            )
        }

        let elements = [];
        let text = "";
        let prevHighlight = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineNum = i + 1;

            let line = [];
            for (let j = 0; j < lines[i].length; j++) {
                const currentHighlight = inHighlight[i][j];
                if (prevHighlight === currentHighlight) {
                    text += lines[i].charAt(j);
                    continue;
                }
                if (text.length > 0) {
                    if (prevHighlight === 0) {
                        line.push(text);
                    } else {
                        line.push(createHighlight(lineNum, text, prevHighlight, true));
                    }
                }
                text = lines[i].charAt(j);
                prevHighlight = currentHighlight;
            }
            if (text.length > 0) {
                if (prevHighlight === 0) {
                    line.push(text);
                } else {
                    // see if next proper line's first character is the same highlight
                    let nextLine = i + 1;
                    while (nextLine < lines.length && lines[nextLine].length === 0) {
                        nextLine++;
                    }
                    if (nextLine < lines.length && inHighlight[nextLine][0] === prevHighlight) {
                        // if yes, don't add a badge
                        line.push(createHighlight(lineNum, text, prevHighlight, false));
                    } else {
                        // otherwise, add the badge
                        line.push(createHighlight(lineNum, text, prevHighlight, true));
                        prevHighlight = 0;
                    }
                }
                text = "";
            }

            elements.push(
                <pre className="code-line">
                    <span className="user-select-none" id={"linenum-" + lineNum}>{lineNum + " "}</span>
                    <span id={"line-" + lineNum}>{ line }</span>
                </pre>
            );
        }

        return elements;
    };

    render() {
        const {answerChoices} = this.props.question;
        const multipleChoice = answerChoices && answerChoices.length > 0;
        return (
            <div className="code-field" onMouseUp={!multipleChoice && this.handleMouseUp}>
                { this.renderCodeLines() }
            </div>
        );
    }
}
 
export default CodeField;
