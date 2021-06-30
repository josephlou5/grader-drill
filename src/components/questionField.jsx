import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class QuestionField extends Component {
    render() { 
        return (
            <ReactMarkdown className="question-field" children={this.props.question.questionText} />
        );
    }
}
 
export default QuestionField;
