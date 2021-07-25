import React from "react";
import ReactMarkdown from "react-markdown";
import { resetValid } from "../shared";

export default function QuestionTextField(props) {
    const { questionText } = props.question;

    let field = <ReactMarkdown>{questionText}</ReactMarkdown>;
    if (props.editMode) {
        field = (
            <div className="row">
                <div className="col-6">
                    <textarea
                        className="form-control textarea"
                        id="question-edit-text"
                        onChange={(event) => {
                            resetValid(event.target);
                            props.onTextChange(event.target.value);
                        }}
                        value={questionText}
                    />
                    <div className="invalid-feedback">
                        Must have question text.
                    </div>
                </div>
                <div className="col-6 text-break">{field}</div>
            </div>
        );
    }

    return <div className="question-text">{field}</div>;
}
