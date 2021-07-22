import React, { Component } from "react";
import HighlightAnswerField from "./highlightAnswerField";
import MCAnswerField from "./mcAnswerField";

class AnswerField extends Component {
    renderAnswerField = (preview = false) => {
        switch (this.props.question.questionType) {
            case "Comment":
                return (
                    <HighlightAnswerField {...this.props} preview={preview} />
                );
            case "Highlight":
                return <p>No question field here</p>;
            case "Multiple Choice":
                return <MCAnswerField {...this.props} preview={preview} />;
            default:
                return <p>Unknown question type</p>;
        }
    };

    renderField = () => {
        if (!this.props.editMode) {
            return this.renderAnswerField();
        }
        return (
            <div className="row">
                <div className="col-6">{this.renderAnswerField()}</div>
                <div className="col-6">{this.renderAnswerField(true)}</div>
            </div>
        );
    };

    render() {
        return <div className="answer-field">{this.renderField()}</div>;
    }
}

export default AnswerField;
