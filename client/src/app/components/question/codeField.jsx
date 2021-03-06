import React from "react";
import { resetValid, resetValidId } from "app/shared";

// editable textarea: https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
// tab indent textarea: https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea

const ZERO_WIDTH_SPACE = "\u200B";

function handleIndent(event) {
    // Adapted from https://stackoverflow.com/a/45396754.
    const element = event.target;
    // tab
    if (event.keyCode === 9) {
        event.preventDefault();
        const TAB = " ".repeat(4);
        document.execCommand("insertText", false, TAB);
    }
    // enter
    else if (event.keyCode === 13) {
        if (element.selectionStart === element.selectionEnd) {
            const text = element.value;
            // start of the current line
            let lineStart = element.selectionStart;
            while (lineStart > 0 && text[lineStart - 1] !== "\n") {
                lineStart--;
            }

            // first character of the current line
            let lineFirstChar = lineStart;
            while (text[lineFirstChar] === " ") {
                lineFirstChar++;
            }

            // copy indent of current line to new line
            if (lineFirstChar > lineStart) {
                event.preventDefault();
                document.execCommand(
                    "insertText",
                    false,
                    "\n" + text.substring(lineStart, lineFirstChar)
                );
            }
        }
    }
}

function handleHighlight(lines) {
    const DEBUG = false;

    const selection = document.getSelection();
    if (!selection || selection.rangeCount !== 1) {
        return;
    }
    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) {
        return;
    }
    if (DEBUG) console.log("Range object:", range);

    let { startContainer, endContainer } = range;
    let startChar = range.startOffset;
    let endChar = range.endOffset;
    if (DEBUG) {
        console.log("start:", startContainer);
        console.log("end:", endContainer);
        console.log("offsets:", startChar, endChar);
    }

    if (startContainer.nodeType !== Node.TEXT_NODE) {
        console.log("Error: start container is not text:", startContainer);
        return;
    }
    if (endContainer.nodeType !== Node.TEXT_NODE) {
        endContainer = endContainer.firstChild;
        if (endContainer.nodeType !== Node.TEXT_NODE) {
            console.log("Error: end container is not text:", endContainer);
            return;
        }
    }

    // get line child nodes
    const children = lines.map((line, index) => {
        const element = document.getElementById("line-" + (index + 1));
        return [...element.childNodes];
    });
    if (DEBUG) console.log("children:", children);
    const childrenFlat = children.flat();
    const childrenText = childrenFlat.map((child) => {
        if (child.nodeType === Node.TEXT_NODE) return child;
        // should be the text of the span
        return child.firstChild;
    });
    if (DEBUG)
        console.log(
            "flat:",
            childrenText.map((child) => child.nodeValue)
        );

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
        endChar = childrenText[endIndex].nodeValue.length;
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
        endChar = childrenText[endIndex].nodeValue.length;
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
    let startLine = -1,
        endLine = -1;
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
            lineOffset += childrenText[i].nodeValue.length;
            i++;
        }
        if (i > endIndex) break;
    }
    // shouldn't happen but just in case
    if (startLine === -1 || endLine === -1) {
        console.log("Error: start/end line not found:", startLine, endLine);
        return;
    }

    const highlight = { startLine, startChar, endLine, endChar };
    if (DEBUG) console.log(highlight);

    // if single click on a highlighted portion, adds another highlight
    // so collapse the range to avoid that
    range.collapse();

    resetValidId("question-code");

    return highlight;
}

export default function CodeField(props) {
    const {
        question: { code, highlights },
        noChange,
        editMode,
    } = props;
    const lines = code.split("\n");

    let onMouseUp = undefined;
    if (!noChange) {
        onMouseUp = () => {
            const highlight = handleHighlight(lines);
            if (!highlight) return;
            highlight.byUser = !editMode;
            props.onAddHighlight(highlight);
        };
    }

    const codeLines = (
        <CodeLines
            lines={lines}
            highlights={highlights}
            noChange={noChange}
            editMode={editMode}
            onDeleteHighlight={props.onDeleteHighlight}
        />
    );

    if (!editMode) {
        return (
            <div className="code-field">
                <div onMouseUp={onMouseUp}>
                    {codeLines}
                    <div className="invalid-feedback">
                        Must have a highlight.
                    </div>
                </div>
            </div>
        );
    }

    let clearButton = null;
    if (highlights && highlights.length > 0) {
        clearButton = (
            <div className="row mt-2">
                <div className="col-6"></div>
                <div className="col-6">
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => props.onClearHighlights()}
                    >
                        Clear Highlights
                    </button>
                </div>
            </div>
        );
    }

    const editCodeField = (
        <div className="row">
            <div className="col-auto ps-2 pe-0" style={{ paddingTop: "6px" }}>
                {lines.map((line, index) => (
                    <pre key={index} className="code-text text-end">
                        {index + 1}
                    </pre>
                ))}
            </div>
            <div className="col">
                <textarea
                    className="code-text form-control textarea code-textarea"
                    id="question-edit-code"
                    spellCheck={false}
                    onKeyDown={handleIndent}
                    onChange={(event) => {
                        resetValid(event.target);
                        props.onCodeChange(event.target.value);
                    }}
                    value={code}
                />
                <div className="invalid-feedback">Must have code.</div>
            </div>
        </div>
    );

    return (
        <div className="code-field">
            <div className="row">
                <div className="col-6"></div>
                <div className="col-6">
                    You can add default highlights to the code. Note that
                    highlights will not change with the code.
                </div>
            </div>
            <div className="row">
                <div className="col-6">{editCodeField}</div>
                <div className="col-6 pt-1" onMouseUp={onMouseUp}>
                    {codeLines}
                </div>
            </div>
            {clearButton}
        </div>
    );
}

function CodeLines({
    lines,
    highlights,
    noChange,
    editMode,
    onDeleteHighlight,
}) {
    const numLines = lines.length;

    // create inHighlight array, which determines where highlights are
    const inHighlight = new Array(numLines);
    for (let i = 0; i < numLines; i++) {
        inHighlight[i] = new Array(lines[i].length).fill(0);
    }
    if (highlights) {
        for (let i = 0; i < highlights.length; i++) {
            const highlightNum = i + 1;
            const { startLine, startChar, endLine, endChar } = highlights[i];
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
    }

    const elements = [];
    let prevHighlight = 0;
    let key = 0;
    for (let i = 0; i < numLines; i++) {
        const lineNum = i + 1;

        let lineKey = 0;
        let text = "";
        const line = [];
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
                    const { byUser } = highlights[prevHighlight - 1];
                    line.push(
                        <Highlight
                            key={lineKey++}
                            lineNum={lineNum}
                            text={text}
                            highlightNum={prevHighlight}
                            badge={true}
                            noChange={noChange}
                            editMode={editMode}
                            byUser={byUser}
                            onDeleteHighlight={onDeleteHighlight}
                        />
                    );
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
                while (nextLine < numLines && lines[nextLine].length === 0) {
                    nextLine++;
                }
                if (
                    nextLine < numLines &&
                    inHighlight[nextLine][0] === prevHighlight
                ) {
                    // if yes, don't add a badge
                    line.push(
                        <Highlight
                            key={lineKey++}
                            lineNum={lineNum}
                            text={text}
                            highlightNum={prevHighlight}
                        />
                    );
                } else {
                    // otherwise, add the badge
                    const { byUser } = highlights[prevHighlight - 1];
                    line.push(
                        <Highlight
                            key={lineKey++}
                            highlights={highlights}
                            lineNum={lineNum}
                            text={text}
                            highlightNum={prevHighlight}
                            badge={true}
                            noChange={noChange}
                            editMode={editMode}
                            byUser={byUser}
                            onDeleteHighlight={onDeleteHighlight}
                        />
                    );
                    prevHighlight = 0;
                }
            }
        }

        elements.push(
            <p key={key++} className="code-text" id={"line-" + lineNum}>
                {line.length > 0 ? line : ZERO_WIDTH_SPACE}
            </p>
        );
    }

    return (
        <div className="row h-100" id="question-code">
            <div className="col-auto pe-2 user-select-none">
                {lines.map((line, index) => (
                    <pre key={index} className="code-text text-end">
                        {index + 1}
                    </pre>
                ))}
            </div>
            <div className="col ps-0 me-2" style={{ overflowX: "scroll" }}>
                {elements}
            </div>
        </div>
    );
}

function Highlight({
    lineNum,
    text,
    highlightNum,
    badge,
    noChange,
    editMode,
    byUser,
    onDeleteHighlight,
}) {
    const idText = `line-${lineNum}-highlight-${highlightNum}`;

    const highlightClasses = [
        "highlight",
        "user-select-none",
        "position-relative",
    ];

    let highlightBadge = null;
    if (badge) {
        const bgColor = byUser ? "bg-success" : "bg-primary";
        const badgeClasses = [
            "user-select-none",
            "position-absolute",
            "top-0",
            "start-100",
            "translate-middle",
            "badge",
            "rounded-pill",
            bgColor,
        ];
        let deletable = {};
        if (!noChange && (editMode || byUser)) {
            deletable = {
                onMouseEnter: (event) => {
                    const element = event.target;
                    element.innerHTML = "X";
                    element.classList.add("bg-danger");
                    element.classList.remove(bgColor);
                },
                onMouseLeave: (event) => {
                    const element = event.target;
                    element.innerHTML = highlightNum;
                    element.classList.add(bgColor);
                    element.classList.remove("bg-danger");
                },
                onClick: () => onDeleteHighlight(highlightNum - 1),
            };
        }

        highlightBadge = (
            <span
                className={badgeClasses.join(" ")}
                id={idText + "-badge"}
                {...deletable}
            >
                {highlightNum}
            </span>
        );
    }

    return (
        <span className={highlightClasses.join(" ")} id={idText}>
            {text}
            {highlightBadge}
        </span>
    );
}
