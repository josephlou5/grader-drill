import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import { preventEnter, resetValidId } from "../shared";

class MCAnswerField extends Component {
    renderMultipleChoice = () => {
        const { question } = this.props;
        const { correct, answer } = question;

        if (this.props.editMode) {
            if (this.props.preview) {
                return question.answerChoices.map((text, index) => (
                    <div key={index} className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            disabled={true}
                        />
                        <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                ));
            } else {
                return (
                    <React.Fragment>
                        {question.answerChoices.map((text, index) => (
                            <div
                                key={index}
                                className="input-group mb-2 has-validation"
                            >
                                <div className="input-group-text">
                                    <input
                                        type="radio"
                                        className="form-check-input mt-0"
                                        name="correct-answer-choice"
                                        checked={
                                            correct !== null &&
                                            index === correct
                                        }
                                        onChange={() => {
                                            resetValidId(
                                                "question-edit-mc-correct"
                                            );
                                            this.props.onSetCorrectAnswerChoice(
                                                index
                                            );
                                        }}
                                    />
                                </div>
                                <textarea
                                    className="form-control textarea"
                                    id={"question-edit-mc-" + index}
                                    value={text}
                                    placeholder="Answer Choice"
                                    onKeyDown={preventEnter}
                                    onChange={(event) =>
                                        this.props.onChangeAnswerChoice(
                                            index,
                                            event.target.value
                                        )
                                    }
                                />
                                <div className="input-group-text bg-danger">
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() =>
                                            this.props.onDeleteAnswerChoice(
                                                index
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                        <div>
                            <input
                                type="hidden"
                                id="question-edit-mc-correct"
                            />
                            <div className="invalid-feedback">
                                Must set a correct answer choice.
                            </div>
                        </div>
                        <div>
                            <input type="hidden" id="question-edit-mc" />
                            <div className="invalid-feedback">
                                Must have at least one answer choice.
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => {
                                resetValidId("question-edit-mc");
                                this.props.onAddAnswerChoice();
                            }}
                        >
                            Add Answer Choice
                        </button>
                    </React.Fragment>
                );
            }
        } else if (this.props.noChange) {
            // grading view, so show correct and incorrect
            // todo: use font awesome for icons?
            // https://fontawesome.com/v5.15/how-to-use/on-the-web/using-with/react
            // todo: the text changes color which is nice, but need a better indicator of the different choices
            return question.answerChoices.map((text, index) => {
                let components;
                if (index === correct) {
                    components = {
                        p: ({ node, ...props }) => (
                            <p style={{ color: "green" }} {...props} />
                        ),
                    };
                } else if (index === answer) {
                    components = {
                        p: ({ node, ...props }) => (
                            <p style={{ color: "red" }} {...props} />
                        ),
                    };
                }
                return (
                    <ReactMarkdown key={index} components={components}>
                        {text}
                    </ReactMarkdown>
                );
            });
        } else {
            return question.answerChoices.map((text, index) => (
                <div key={index} className="form-check">
                    <input
                        type="radio"
                        className="form-check-input"
                        name="answer"
                        id={"choice" + index}
                        checked={index === answer}
                        onChange={() => this.props.onMCSelect(question, index)}
                    />
                    <label
                        className="form-check-label"
                        htmlFor={"choice" + index}
                    >
                        <ReactMarkdown>{text}</ReactMarkdown>
                    </label>
                </div>
            ));
        }
    };

    render() {
        return this.renderMultipleChoice();
    }
}

export default MCAnswerField;
