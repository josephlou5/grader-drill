import React, { Component } from "react";
import { preventEnter } from "../shared.js";

class HighlightAnswerField extends Component {
    renderClearButton = () => {
        if (this.props.noChange) return null;
        const { question } = this.props;
        const { highlights } = question;
        if (!highlights || highlights.length === 0) return null;
        let buttonProps = {
            type: "button",
            className: "btn btn-danger",
        };
        const canClear =
            !this.props.preview &&
            (this.props.editMode || highlights.some((h) => h["byUser"]));
        if (canClear) {
            buttonProps["onClick"] = () =>
                this.props.onClearHighlights(question);
        } else {
            buttonProps["disabled"] = true;
        }
        return <button {...buttonProps}>Clear Highlights</button>;
    };

    renderHighlight = (question, highlight, index, text = "") => {
        const { preview, editMode, noChange } = this.props;

        const classes = "form-control textarea";

        let textClasses = classes;
        if (!preview && noChange) {
            textClasses = classes + " bg-transparent text-body";
        }
        let textProps = {
            className: textClasses,
            value: text,
        };
        if (preview || noChange) {
            textProps["disabled"] = true;
        } else {
            Object.assign(textProps, {
                onKeyDown: preventEnter,
                onChange: (event) =>
                    this.props.onAnswerChange(
                        question,
                        index,
                        event.target.value
                    ),
            });
        }

        let input;
        if (editMode && !preview) {
            // editing the existing comment
            input = (
                <textarea
                    className={classes}
                    onKeyDown={preventEnter}
                    onChange={(event) =>
                        this.props.onChangeHighlightText(
                            index,
                            event.target.value
                        )
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
        if ((editMode && !preview) || highlight.byUser) {
            let buttonProps = {
                type: "button",
                className: "btn-close btn-close-white",
            };
            if (noChange) {
                buttonProps["disabled"] = true;
            } else {
                buttonProps["onClick"] = () =>
                    this.props.onDeleteHighlight(question, index);
            }
            deleteButton = (
                <div className="input-group-text bg-danger">
                    <button {...buttonProps} />
                </div>
            );
        }

        const labelClasses =
            "input-group-text bg-" +
            (highlight.byUser ? "success" : "primary") +
            " text-light";

        return (
            <React.Fragment>
                <span className={labelClasses}>{index + 1}</span>
                {input}
                {deleteButton}
            </React.Fragment>
        );
    };

    renderField = () => {
        const { question, noChange } = this.props;
        const { highlights } = question;
        if (!highlights || highlights.length === 0) {
            return <p>No highlights</p>;
        }

        function classes(index) {
            if (noChange && index === 0) {
                return "input-group";
            } else {
                return "input-group mt-2";
            }
        }

        let answers;
        if (this.props.editMode) {
            answers = highlights.map(() => "");
        } else {
            answers = question.answers;
        }

        return highlights.map((highlight, index) => (
            <div key={index} className={classes(index)}>
                {this.renderHighlight(
                    question,
                    highlight,
                    index,
                    answers[index]
                )}
            </div>
        ));
    };

    render() {
        return (
            <React.Fragment>
                {this.renderClearButton()}
                {this.renderField()}
            </React.Fragment>
        );
    }
}

export default HighlightAnswerField;
