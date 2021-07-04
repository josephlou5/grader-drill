import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class QuestionText extends Component {
    render() { 
        return (
            <ReactMarkdown
                className="question-text"
                children={this.props.question.questionText}
            />
        );
    }
}
 
export default QuestionText;
