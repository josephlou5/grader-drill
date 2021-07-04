import React, { Component } from 'react';
import CodeField from './codeField';
import QuestionText from './questionText';
import AnswerField from './answerField';

class QuestionPage extends Component {
    
    renderComponents = () => {
        const {question} = this.props;
        if (question === null || question === undefined) {
            return "Undefined question";
        }
        if (question.id === null) {
            return "Invalid question";
        }
        return (
            <React.Fragment>
                <h3>{ question.questionType }</h3>
                { question.hasQuestionField && 
                    <QuestionText
                        question={question}
                    />
                }
                { question.hasCodeField &&
                    <CodeField
                        question={question}
                        onHighlight={this.props.onHighlight}
                    />
                }
                { question.hasAnswerField &&
                    <AnswerField
                        question={question}
                        onClear={this.props.onClear}
                        onDelete={this.props.onDelete}
                    />
                }
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <h1>Question</h1>
                { this.renderComponents() }
            </React.Fragment>
        );
    }
}

export default QuestionPage;
