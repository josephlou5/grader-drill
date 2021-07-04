import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import AnswerInput from './answerInput';

class AnswerField extends Component {

    renderClearButton(multipleChoice) {
        const {highlights} = this.props.question;
        const canClear = !multipleChoice && highlights && highlights.some(h => h['byUser']);
        if (!canClear) return null;
        return (
            <button
                type="button"
                className="btn btn-danger m-2"
                onClick={() => this.props.onClear(this.props.question)}
            >
                Clear Highlights
            </button>
        );
    }

    renderAnswers(multipleChoice) {
        const {question} = this.props;
        if (multipleChoice) {
            // multiple choice
            return question.answerChoices.map((text, index) =>
                <div key={index} className="form-check">
                    <input className="form-check-input" type="radio" name="answer" id={"choice" + index}/>
                    <label className="form-check-label" htmlFor={"choice" + index}>
                        <ReactMarkdown children={text} />
                    </label>
                </div>
            );
        } else {
            // one free response answer per highlight
            const {highlights} = this.props.question;
            if (!highlights || highlights.length === 0) {
                return "No highlights";
            }
            return highlights.map((highlight, index) =>
                <AnswerInput
                    key={index}
                    index={index}
                    question={question}
                    highlight={highlight}
                    onDelete={this.props.onDelete}
                />
            );
        }
    }

    render() { 
        const {answerChoices} = this.props.question;
        const multipleChoice = answerChoices && answerChoices.length > 0;
        return (
            <div className="answer-field">
                { this.renderClearButton(multipleChoice) }
                { this.renderAnswers(multipleChoice) }
            </div>
        );
    }
}
 
export default AnswerField;
