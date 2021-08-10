import React from "react";
import ReactMarkdown from "react-markdown";
import { resetValid } from "../shared";

export default function QuestionTextField({
    question,
    editMode,
    onTextChange,
}) {
    let field = <ReactMarkdown>{question.questionText}</ReactMarkdown>;
    if (editMode) {
        field = (
            <div className="row">
                <div className="col-6">
                    <textarea
                        className="form-control textarea"
                        id="question-edit-text"
                        onChange={(event) => {
                            resetValid(event.target);
                            onTextChange(event.target.value);
                        }}
                        value={question.questionText}
                    />
                    <div className="invalid-feedback">
                        Must have question text.
                    </div>
                </div>
                <div className="col-6 text-break pt-2">{field}</div>
            </div>
        );
    }
    return <div className="question-text">{field}</div>;
}
