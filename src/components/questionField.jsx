import React, { Component } from 'react';

class QuestionField extends Component {
    render() { 
        return (
            <div className="question-field">
                { this.props.question.questionText }
            </div>
        );
    }
}
 
export default QuestionField;
