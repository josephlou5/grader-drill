import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { resetValid } from '../shared';

class QuestionTextField extends Component {

    renderField = () => {
        const {questionText} = this.props.question;
        if (!this.props.editMode) {
            return <ReactMarkdown>{questionText}</ReactMarkdown>;
        }
        return (
            <div className="row">
                <div className="col-6">
                    <textarea
                        className="form-control textarea"
                        id="question-edit-text"
                        onChange={(event) => {
                            resetValid(event.target);
                            this.props.onTextChange(event.target.value);
                        }}
                        value={questionText}
                    />
                    <div className="invalid-feedback">Must have question text.</div>
                </div>
                <div className="col-6 text-break">
                    <ReactMarkdown>{questionText}</ReactMarkdown>
                </div>
            </div>
        );
    };

    render() {
        return (
            <div className="question-text">
                {this.renderField()}
            </div>
        );
    }
}
 
export default QuestionTextField;
