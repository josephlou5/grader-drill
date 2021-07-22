import React, { Component } from "react";
import CodeField from "./codeField";
import QuestionTextField from "./questionTextField";
import AnswerField from "./answerField";
import { ResizeTextareas } from "../shared";

class Question extends Component {
    renderComponents = () => {
        const { question, noChange } = this.props;
        if (!question) {
            return "Undefined question";
        }
        if (question.id == null) {
            return "Invalid question";
        }
        return (
            <React.Fragment>
                <h3>{question.questionType}</h3>
                <QuestionTextField question={question} />
                {question.hasCodeField && (
                    <CodeField
                        question={question}
                        noChange={noChange}
                        onAddHighlight={this.props.onAddHighlight}
                        onClearHighlights={this.props.onClearHighlights}
                    />
                )}
                {question.hasAnswerField && (
                    <AnswerField
                        question={question}
                        noChange={noChange}
                        onClearHighlights={this.props.onClearHighlights}
                        onDeleteHighlight={this.props.onDeleteHighlight}
                        onAnswerChange={this.props.onAnswerChange}
                        onMCSelect={this.props.onMCSelect}
                    />
                )}
            </React.Fragment>
        );
    };

    render() {
        return (
            <React.Fragment>
                <ResizeTextareas />
                <h1>Question</h1>
                {this.renderComponents()}
            </React.Fragment>
        );
    }
}

export default Question;
