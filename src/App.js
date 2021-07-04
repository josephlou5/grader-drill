import React, { Component } from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link,
} from "react-router-dom";
import QuestionPage from './components/questionPage';
import './App.css';

class App extends Component {
    state = {
        questions: {
            1: {
                id: 1,
                hasQuestionField: true,
                hasCodeField: true,
                hasAnswerField: true,
                questionType: "Comment",
                questionText: "What's wrong with this code?",
                code: "public class Question {\n    public static void main(String[] args) {\n        System.out.println(\"Hello world\");\n    }\n}",
                highlights: [
                    // { 'startLine': 0, 'startChar': 14, 'endLine': 1, 'endChar': 5, 'byUser': false },
                    // { 'startLine': 1, 'startChar': 8, 'endLine': 1, 'endChar': 11, 'byUser': false },
                ],
            },
            2: {
                id: 2,
                hasQuestionField: true,
                hasCodeField: false,
                hasAnswerField: true,
                questionType: "Multiple Choice",
                questionText: "What would you say to a student who uses `Integer` where they should use `int`?",
                answerChoices: [
                    "You should use `int` because it's shorter to type.",
                    "`Integer` is a wrapper object and is not necessary for all cases.",
                    "Always use `Integer` because it's an object.",
                ],
                answer: 1,
            },
        },
        answered: {
            jdlou: {},
        },
    };

    updateQuestion = (question, highlights) => {
        question["highlights"] = highlights;
        let questions = {...this.state.questions};
        questions[question.id] = question;
        this.setState({ questions: questions });
    };

    handleHighlight = (question, highlight) => {
        console.log("Highlight created:", highlight);
        let highlights = [...question.highlights];
        highlights.push(highlight);
        this.updateQuestion(question, highlights);
    };

    handleClear = (question) => {
        console.log("Clearing all highlights");
        const highlights = question.highlights.filter(h => !h["byUser"]);
        this.updateQuestion(question, highlights);
    }
    
    handleDelete = (question, highlightNum) => {
        console.log("Deleting highlight index " + highlightNum);
        let highlights = [...question.highlights];
        highlights.splice(highlightNum, 1);
        this.updateQuestion(question, highlights);
    };

    render() {
        let links = [];
        let routes = [];
        for (const [questionId, question] of Object.entries(this.state.questions)) {
            links.push(
                <Link key={"question-" + questionId + "-link"} to={"/" + questionId}>
                    <button className="btn btn-primary m-2">
                        {"Question " + questionId}
                    </button>
                </Link>
            );
            routes.push(
                <Route key={"question-" + questionId + "-route"} exact path={"/" + questionId}>
                    <QuestionPage
                        question={question}
                        onHighlight={this.handleHighlight}
                        onClear={this.handleClear}
                        onDelete={this.handleDelete}
                    />
                </Route>
            );
        }
        return (
            <BrowserRouter>
                <div className="App">
                    { links }
                    <Switch>{ routes }</Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
