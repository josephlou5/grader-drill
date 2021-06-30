import React, { Component } from 'react';
import CodeField from './codeField';
import QuestionField from './questionField';
import AnswerField from './answerField';

class QuestionPage extends Component {
    // state = {
    //     hasQuestionField: true,
    //     hasCodeField: true,
    //     hasAnswerField: true,
    //     questionText: "What's wrong with this code?",
    //     code: "public class Question {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world\");\n    }\n}",
    //     highlights: [
    //         { 'startLine': 0, 'startChar': 14, 'endLine': 1, 'endChar': 5, 'byUser': true },
    //         { 'startLine': 1, 'startChar': 8, 'endLine': 1, 'endChar': 11, 'byUser': true },
    //     ],
    //     // if empty, free response answers
    //     answerChoices: [
    //     ],
    // };

    constructor(props) {
        super(props);

        this.state = props.question;
    }

    handleHighlight = (highlight) => {
        console.log("Highlight created:", highlight);
        let highlights = [...this.state.highlights];
        highlights.push(highlight);
        this.setState({ highlights: highlights });
    };

    handleClear = () => {
        console.log("Clearing all highlights");
        const highlights = this.state.highlights.filter(h => !h["byUser"]);
        this.setState({ highlights: highlights });
    }
    
    handleDelete = (highlightNum) => {
        console.log("Deleting highlight index " + highlightNum);
        let highlights = [...this.state.highlights];
        highlights.splice(highlightNum, 1);
        this.setState({ highlights: highlights });
    };

    render() { 
        return (
            <React.Fragment>
                <h1>Question</h1>
                { this.state.hasQuestionField && 
                    <QuestionField
                        question={this.state}
                    />
                }
                { this.state.hasCodeField &&
                    <CodeField
                        question={this.state}
                        onHighlight={this.handleHighlight}
                    />
                }
                { this.state.hasAnswerField &&
                    <AnswerField
                        question={this.state}
                        onClear={this.handleClear}
                        onDelete={this.handleDelete}
                    />
                }
            </React.Fragment>
        );
    }
}

export default QuestionPage;
