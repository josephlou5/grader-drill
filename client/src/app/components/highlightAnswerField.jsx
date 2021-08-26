import React from "react";
import { TextareaLine, resetValidId } from "../shared";

export default function HighlightAnswerField(props) {
    const { question, previewMode, editMode, noChange } = props;
    const { highlights } = question;

    if (!highlights || highlights.length === 0) {
        return <p>No highlights</p>;
    }

    let clearButton = null;
    if (!noChange) {
        const buttonProps = {
            type: "button",
            className: "btn btn-danger",
        };

        const canClear =
            !previewMode && (editMode || highlights.some((h) => h.byUser));
        if (canClear) {
            buttonProps.onClick = () => props.onClearHighlights(question);
        } else {
            buttonProps.disabled = true;
        }

        clearButton = <button {...buttonProps}>Clear Highlights</button>;
    }

    const classes = "form-control textarea";
    let textClasses = classes;
    if (!previewMode && noChange) {
        textClasses += " bg-transparent text-body";
    }

    const field = highlights.map((highlight, index) => {
        const textProps = {
            className: textClasses,
            placeholder: "Comment",
            value: highlight.answer || "",
        };
        let invalid = null;
        if (previewMode || noChange) {
            textProps.disabled = true;
        } else {
            textProps.onChange = (event) => {
                resetValidId(`highlight-${index}-comment`);
                props.onAnswerChange(index, event.target.value);
            };
            invalid = (
                <div>
                    <input type="hidden" id={`highlight-${index}-comment`} />
                    <div className="invalid-feedback">
                        Must write a comment.
                    </div>
                </div>
            );
        }

        let input;
        if (editMode && !previewMode) {
            // editing the existing comment
            input = (
                <TextareaLine
                    className={classes}
                    onChange={(event) =>
                        props.onChangeHighlightText(index, event.target.value)
                    }
                    placeholder="Existing comment"
                    value={highlight.text || ""}
                />
            );
        } else if (highlight.text) {
            // display the existing comment
            input = (
                <div className="flex-grow-1" style={{ padding: "0 0.75rem" }}>
                    <div className="row">
                        <textarea
                            className={classes}
                            style={{
                                borderBottom: "0px",
                                borderRadius: "0 0.25rem 0 0",
                            }}
                            value={highlight.text}
                            disabled={true}
                        />
                    </div>
                    <div className="row">
                        <TextareaLine
                            {...textProps}
                            style={{ borderRadius: "0 0 0.25rem 0" }}
                        />
                    </div>
                </div>
            );
        } else {
            // no existing comment
            input = <TextareaLine {...textProps} />;
        }

        let deleteButton = null;
        if ((editMode && !previewMode) || highlight.byUser) {
            const buttonProps = {
                type: "button",
                className: "btn-close btn-close-white",
            };
            if (noChange) {
                buttonProps.disabled = true;
            } else {
                buttonProps.onClick = () => props.onDeleteHighlight(index);
            }
            deleteButton = (
                <div className="input-group-text bg-danger">
                    <button {...buttonProps} />
                </div>
            );
        }

        const labelClasses = [
            "input-group-text",
            "bg-" + (highlight.byUser ? "success" : "primary"),
            "text-light",
        ];

        const marginTop = noChange && index === 0 ? "" : " mt-2";

        return (
            <React.Fragment key={index}>
                <div className={"input-group" + marginTop}>
                    <span className={labelClasses.join(" ")}>{index + 1}</span>
                    {input}
                    {deleteButton}
                </div>
                {invalid}
            </React.Fragment>
        );
    });

    return (
        <React.Fragment>
            {clearButton}
            {field}
        </React.Fragment>
    );
}
