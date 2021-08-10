import React from "react";
import HighlightAnswerField from "./highlightAnswerField";
import MCAnswerField from "./mcAnswerField";

export default function AnswerField(props) {
    const { questionType } = props.question;

    if (!["Comment", "Multiple Choice"].includes(questionType)) {
        return null;
    }

    function fieldByQuestionType(previewMode = false) {
        switch (questionType) {
            case "Comment":
                return (
                    <HighlightAnswerField
                        {...props}
                        previewMode={previewMode}
                    />
                );
            case "Multiple Choice":
                return <MCAnswerField {...props} previewMode={previewMode} />;
            default:
                return null;
        }
    }

    let field = fieldByQuestionType();
    if (props.editMode) {
        field = (
            <div className="row">
                <div className="col-6">{field}</div>
                <div className="col-6">{fieldByQuestionType(true)}</div>
            </div>
        );
    }

    return <div className="answer-field">{field}</div>;
}
