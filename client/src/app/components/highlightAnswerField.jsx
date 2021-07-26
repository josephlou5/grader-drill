import React from "react";
import { preventEnter } from "../shared.js";

export default function HighlightAnswerField(props) {
    const { question, previewMode, editMode, noChange } = props;
    const { highlights } = question;

    if (!highlights || highlights.length === 0) {
        return <p>No highlights</p>;
    }

    let clearButton = null;
    if (!noChange) {
        let buttonProps = {
            type: "button",
            className: "btn btn-danger",
        };

        const canClear =
            !props.previewMode &&
            (props.editMode || highlights.some((h) => h["byUser"]));
        if (canClear) {
            buttonProps["onClick"] = () => props.onClearHighlights(question);
        } else {
            buttonProps["disabled"] = true;
        }

        clearButton = <button {...buttonProps}>Clear Highlights</button>;
    }

    let answers;
    if (editMode) {
        answers = highlights.map(() => "");
    } else {
        answers = question.answers;
    }

    const classes = "form-control textarea";
    let textClasses = classes;
    if (!previewMode && noChange) {
        textClasses = classes + " bg-transparent text-body";
    }

    const field = highlights.map((highlight, index) => {
        let textProps = {
            className: textClasses,
            value: answers[index],
        };
        if (previewMode || noChange) {
            textProps["disabled"] = true;
        } else {
            Object.assign(textProps, {
                onKeyDown: preventEnter,
                onChange: (event) =>
                    props.onAnswerChange(question, index, event.target.value),
            });
        }

        let input;
        if (editMode && !previewMode) {
            // editing the existing comment
            input = (
                <textarea
                    className={classes}
                    onKeyDown={preventEnter}
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
                    {/*
                    // the div will annoyingly go to the next line when wrapping,
                    // so using a disabled textarea solves the problem very well.
                    // but it feels a bit janky so i don't really like it.
                    <div
                        className="row input-group-text text-start text-wrap flex-grow-1"
                        style={{borderBottom: "0px", borderRadius: "0 0.25rem 0 0"}}
                    >
                        {highlight.text}
                    </div>
                    */}
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
                        <textarea
                            {...textProps}
                            style={{ borderRadius: "0 0 0.25rem 0" }}
                        />
                    </div>
                </div>
            );
        } else {
            // no existing comment
            input = <textarea {...textProps} />;
        }

        let deleteButton = null;
        if ((editMode && !previewMode) || highlight.byUser) {
            let buttonProps = {
                type: "button",
                className: "btn-close btn-close-white",
            };
            if (noChange) {
                buttonProps["disabled"] = true;
            } else {
                buttonProps["onClick"] = () =>
                    props.onDeleteHighlight(question, index);
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
            <div key={index} className={"input-group" + marginTop}>
                <span className={labelClasses.join(" ")}>{index + 1}</span>
                {input}
                {deleteButton}
            </div>
        );
    });

    return (
        <React.Fragment>
            {clearButton}
            {field}
        </React.Fragment>
    );
}
