import React from "react";
import ReactMarkdown from "react-markdown";
import { TextareaLine, resetValid, resetValidId } from "../shared";

export default function MCAnswerField(props) {
    const { question, previewMode, editMode, noChange } = props;
    const { correct, answer } = question;

    if (previewMode) {
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
    } else if (editMode) {
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
                                checked={index === correct}
                                onChange={() => {
                                    resetValidId("question-edit-mc-correct");
                                    props.onSetCorrectAnswerChoice(index);
                                }}
                            />
                        </div>
                        <TextareaLine
                            className="form-control textarea"
                            id={"question-edit-mc-" + index}
                            value={text}
                            placeholder="Answer Choice"
                            onChange={(event) => {
                                resetValid(event.target);
                                props.onChangeAnswerChoice(
                                    index,
                                    event.target.value
                                );
                            }}
                        />
                        <div className="input-group-text bg-danger">
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={() =>
                                    props.onDeleteAnswerChoice(index)
                                }
                            />
                        </div>
                    </div>
                ))}
                <div>
                    <input type="hidden" id="question-edit-mc-correct" />
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
                        props.onAddAnswerChoice();
                    }}
                >
                    Add Answer Choice
                </button>
            </React.Fragment>
        );
    } else if (noChange) {
        // grading view, so show correct and incorrect
        // todo: use font awesome for correct/incorrect icons?
        // https://fontawesome.com/v5.15/how-to-use/on-the-web/using-with/react
        return question.answerChoices.map((text, index) => {
            const classes = ["form-check-input", "pe-none"];
            if (index === correct) {
                classes.push("bg-success");
            } else if (index === answer) {
                classes.push("bg-danger");
            }
            // // can use this to change the color of the markdown text
            // let components = undefined;
            // if (index === correct) {
            //     components = {
            //         p: ({ node, ...props }) => (
            //             <p style={{ color: "green" }} {...props} />
            //         ),
            //     };
            // } else if (index === answer) {
            //     components = {
            //         p: ({ node, ...props }) => (
            //             <p style={{ color: "red" }} {...props} />
            //         ),
            //     };
            // }
            return (
                <div key={index} className="form-check">
                    <input
                        type="radio"
                        className={classes.join(" ")}
                        tabIndex={-1}
                        // defaultChecked={index === answer}
                        onClick={(event) => event.preventDefault()}
                        // disabled={true}
                    />
                    <ReactMarkdown>{text}</ReactMarkdown>
                </div>
            );
        });
    } else {
        return (
            <React.Fragment>
                {question.answerChoices.map((text, index) => (
                    <div key={index} className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="answer"
                            id={"choice" + index}
                            checked={index === answer}
                            onChange={() => {
                                resetValidId("question-mc-choice");
                                props.onMCSelect(index);
                            }}
                        />
                        <label
                            className="form-check-label"
                            htmlFor={"choice" + index}
                        >
                            <ReactMarkdown>{text}</ReactMarkdown>
                        </label>
                    </div>
                ))}
                <div>
                    <input type="hidden" id="question-mc-choice" />
                    <div className="invalid-feedback">
                        Must select an answer choice.
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
