import React, { Component } from 'react';

class CodeField extends Component {

    handleMouseUp = () => {

        // if multiple choice, no highlighting
        if (this.props.question.answerChoices && this.props.question.answerChoices.length > 0) {
            return;
        }

        const selection = document.getSelection();
        if (!selection || selection.rangeCount !== 1) {
            return;
        }
        const range = selection.getRangeAt(0);
        if (!range || range.collapsed) {
            return;
        }
        // for debugging
        console.log('Range object:', range);

        function getTextOnly(element) {
            // Gets only the text nodes of an element.
            if (element.nodeType === Node.TEXT_NODE)
                return [element.nodeValue];
            let texts = [];
            for (const child of element.childNodes) {
                if (child.classList && child.classList.contains("badge")) continue;
                if (child.nodeType === Node.TEXT_NODE) {
                    texts.push(child.nodeValue);
                } else {
                    texts = texts.concat(getTextOnly(child));
                }
            }
            return texts;
        }

        function getPrevTextLength(element) {
            // Iterates through previous sibling linked list to get all text lengths.
            let length = 0;
            for (
                let prevSibling = element.previousSibling;
                prevSibling !== null;
                prevSibling = prevSibling.previousSibling
            ) {
                const texts = getTextOnly(prevSibling);
                for (const text of texts) {
                    length += text.length;
                }
            }
            return length;
        }

        let parentContainer = range.commonAncestorContainer;
        const {startContainer, endContainer} = range;

        // containers should always be text, and `parentNode` will be the line span
        let startLine = parseInt(startContainer.parentNode.id.split("-")[1]);
        let endLine = parseInt(endContainer.parentNode.id.split("-")[1]);
        // check valid
        if (isNaN(startLine) || isNaN(endLine)) {
            console.log("NaN:", startLine, endLine);
            return;
        }

        let startChar = range.startOffset;
        let endChar = range.endOffset;

        // case 1: parent container is text, which means start and end are on the same line and valid
        if (parentContainer.nodeType === Node.TEXT_NODE) {
            console.log("Common ancestor is text; same line highlight");
            const offset = getPrevTextLength(startContainer);
            startChar += offset;
            endChar += offset;
        }
        // case 2: parent container is a line, which means start and end on the same line,
        // but completely encompass a highlight selection, which is invalid
        else if (parentContainer.id.startsWith("line-")) {
            console.log("Invalid same-line selection: overlaps another selection");
            return;
        }
        // case 3: parent container is code-field, which means start and end on different lines
        else if (parentContainer.className === "code-field") {
            startChar += getPrevTextLength(startContainer);
            let lineLengths = this.props.question.code.split('\n').map(line => line.length);

            // case 3a: highlight went onto previous line's last char
            if (startChar === lineLengths[startLine - 1]) {
                console.log("case 3a");
                startLine++;
                startChar = 0;
            }
            // case 3b: highlight went onto next line's line number
            if (endContainer.parentNode.id.startsWith("linenum-")) {
                console.log("case 3b");
                endLine--;
                endChar = lineLengths[endLine - 1];
                // subtract last node from line length if it's a highlight
                const line = document.getElementById("line-" + endLine);
                const {lastChild} = line;
                if (lastChild.nodeType !== Node.TEXT_NODE && lastChild.id.includes("-highlight-")) {
                    const texts = getTextOnly(lastChild);
                    for (const text of texts) {
                        endChar -= text.length;
                    }
                }
            }

            // start should be last node in start line
            if (startContainer.nextSibling !== null) {
                console.log("start container next is not null");
                // case 3c: start's next sibling is a badge
                if (startContainer.nextSibling.classList && startContainer.nextSibling.classList.contains("badge")) {
                    console.log("case 3c");
                    startLine++;
                    startChar = 0;
                } else {
                    console.log("Invalid multi-line selection: start overlaps another selection");
                    return;
                }
            }
            // end should be first node in end line
            if (endContainer.previousSibling !== null) {
                console.log("end container previous is not null");
                // case 3d: end's previous sibling is a highlight
                if (endContainer.previousSibling.id.includes("-highlight-")) {
                    console.log("case 3d");
                    endLine--;
                    endChar = lineLengths[endLine - 1];
                    // subtract last node from line length if it's a highlight
                    const line = document.getElementById("line-" + endLine);
                    const {lastChild} = line;
                    if (lastChild.nodeType !== Node.TEXT_NODE && lastChild.id.includes("-highlight-")) {
                        const texts = getTextOnly(lastChild);
                        for (const text of texts) {
                            endChar -= text.length;
                        }
                    }
                } else {
                    console.log("Invalid multi-line selection: end overlaps another selection");
                    return;
                }
            }
            // all middle lines should not have any selections
            for (let i = startLine + 1; i < endLine; i++) {
                const line = document.getElementById("line-" + i);
                if (line.childNodes.length > 1) {
                    console.log("Invalid multi-line selection: middle line overlaps another selection");
                    return;
                }
            }
        }
        else {
            console.log("Error: Unknown case");
            return;
        }

        // check valid
        if (isNaN(startChar) || isNaN(endChar)) {
            console.log("NaN:", startChar, endChar);
            return;
        }

        const highlight = {
            startLine: startLine - 1, // lines need to be 0 indexed like chars
            startChar: startChar,
            endLine: endLine - 1,
            endChar: endChar,
            byUser: true,
        };
        console.log(highlight);
        this.props.onHighlight(highlight);

        // if single click on a highlighted portion, adds another highlight
        // so collapse the range to avoid that
        range.collapse();
    };

    createCodeLines = () => {
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
            return (
                <span className="highlight user-select-none position-relative" id={"line-" + lineNum + "-highlight-" + highlightNum}>
                    {text}
                    {badge && <span className="user-select-none position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">{highlightNum}</span>}
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
                if (prevHighlight === 0)
                    line.push(text);
                else
                    line.push(createHighlight(lineNum, text, prevHighlight, true));
                text = lines[i].charAt(j);
                prevHighlight = currentHighlight;
            }
            if (text.length > 0) {
                if (prevHighlight === 0)
                    line.push(text);
                else {
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
        return (
            <div className="code-field" onMouseUp={this.handleMouseUp}>
                { this.createCodeLines() }
            </div>
        );
    }
}
 
export default CodeField;
