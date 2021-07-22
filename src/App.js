import React, { Component } from "react";
import { Switch, Route, Link, useParams } from "react-router-dom";
import GradingDashboard from "./components/dashboardView";
import GradingView from "./components/gradingView";
import QuestionsView from "./components/questionsView";
import QuestionEditView from "./components/questionEditView";
import "./App.css";

class App extends Component {
    state = {
        hideGraded: false,
        questionIdCounter: 3,
        questions: {
            1: {
                id: 1,
                hasCodeField: true,
                hasAnswerField: true,
                questionType: "Comment",
                questionText: "What's wrong with this code?",
                code: 'public class Question {\n    public static void main(String[] args) {\n        System.out.println("Hello world");\n    }\n}',
                highlights: [
                    // { startLine: 0, startChar: 14, endLine: 1, endChar: 5, byUser: false },
                    // { startLine: 1, startChar: 8, endLine: 1, endChar: 11, byUser: false },
                ],
                rubric: [
                    {
                        points: 1,
                        text: "Says that nothing is wrong with the code",
                    },
                ],
            },
            2: {
                id: 2,
                hasCodeField: false,
                hasAnswerField: true,
                questionType: "Multiple Choice",
                questionText:
                    "What would you say to a student who uses `Integer` where they should use `int`?",
                answerChoices: [
                    "You should use `int` because it's shorter to type.",
                    "`Integer` is a wrapper object and is not necessary for all cases.",
                    "Always use `Integer` because it's an object.",
                ],
                correct: 1,
            },
        },
        answered: [
            {
                id: 1,
                trainee: "trainee1",
                hasCodeField: true,
                hasAnswerField: true,
                questionType: "Comment",
                questionText: "What's wrong with this `code`?",
                code: 'public class Question {\n    public static void main(String[] args) {\n        System.out.println("Hello world");\n    }\n}\nmore lines\nmore\n\nlines\n!\n!\nthis is a really long line for testing purposes to see if the scroll bar will show up here properly or not',
                highlights: [
                    {
                        startLine: 0,
                        startChar: 14,
                        endLine: 1,
                        endChar: 5,
                        byUser: false,
                        text: "this is existing text",
                    },
                    {
                        startLine: 1,
                        startChar: 8,
                        endLine: 1,
                        endChar: 11,
                        byUser: true,
                    },
                ],
                answers: ["this is highlight 1", "this is another highlight"],
                rubric: [
                    {
                        points: 1,
                        text: "Says that nothing is wrong with the code",
                        checked: false,
                    },
                ],
                graded: false,
            },
            {
                id: 2,
                assessor: "Auto-graded",
                trainee: "trainee2",
                hasCodeField: false,
                hasAnswerField: true,
                questionType: "Multiple Choice",
                questionText:
                    "What would you say to a student who uses `Integer` where they should use `int`?",
                answerChoices: [
                    "You should use `int` because it's shorter to type.",
                    "`Integer` is a wrapper object and is not necessary for all cases.",
                    "Always use `Integer` because it's an object.",
                ],
                correct: 1,
                answer: 0,
                score: 0,
                graded: true,
            },
        ],
    };

    handleHideGraded = () => {
        this.setState({ hideGraded: !this.state.hideGraded });
    };

    handleAddQuestion = (question) => {
        const { questionIdCounter } = this.state;
        question["id"] = questionIdCounter;
        let questions = { ...this.state.questions };
        questions[questionIdCounter] = question;
        this.setState({
            questionIdCounter: questionIdCounter + 1,
            questions: questions,
        });
    };

    handleEditQuestion = (question) => {
        let questions = { ...this.state.questions };
        questions[question.id] = question;
        this.setState({ questions: questions });
    };

    handleDeleteQuestion = (questionId) => {
        let questions = { ...this.state.questions };
        delete questions[questionId];
        this.setState({ questions: questions });
    };

    updateQuestion = (question) => {
        let found = false;
        let answered = this.state.answered.map((q) => {
            if (q.trainee === question.trainee && q.id === question.id) {
                found = true;
                return question;
            }
            return q;
        });
        if (!found) {
            return;
        }
        this.setState({ answered: answered });
    };

    handleAddHighlight = (question, highlight) => {
        let highlights = [...question.highlights];
        highlights.push(highlight);
        let answers = [...question.answers];
        answers.push("");
        question["highlights"] = highlights;
        question["answers"] = answers;
        this.updateQuestion(question);
    };

    handleClearHighlights = (question) => {
        let highlights = [];
        let answers = [];
        question.highlights.forEach((h, i) => {
            if (!h.byUser) {
                highlights.push(h);
                answers.push(question.answers[i]);
            }
        });
        question["highlights"] = highlights;
        question["answers"] = answers;
        this.updateQuestion(question);
    };

    handleDeleteHighlight = (question, highlightIndex) => {
        let highlights = [...question.highlights];
        highlights.splice(highlightIndex, 1);
        let answers = [...question.answers];
        answers.splice(highlightIndex, 1);
        question["highlights"] = highlights;
        question["answers"] = answers;
        this.updateQuestion(question);
    };

    handleAnswerChange = (question, answerIndex, value) => {
        let answers = [...question.answers];
        answers[answerIndex] = value;
        question["answers"] = answers;
        this.updateQuestion(question);
    };

    handleMCSelect = (question, answerIndex) => {
        question["answer"] = answerIndex;
        this.updateQuestion(question);
    };

    handleGraded = (question, rubric, assessor, score) => {
        if (rubric) {
            question["rubric"] = rubric;
        }
        Object.assign(question, {
            assessor: assessor,
            score: score,
            graded: true,
        });
        this.updateQuestion(question);
    };

    render() {
        const eventHandlers = {
            onAddHighlight: this.handleAddHighlight,
            onClearHighlights: this.handleClearHighlights,
            onAnswerChange: this.handleAnswerChange,
            onMCSelect: this.handleMCSelect,
            onDeleteHighlight: this.handleDeleteHighlight,
        };

        return (
            <div className="App">
                {/* navbar */}
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <Link to="/" className="navbar-brand">
                            Grader Drill
                        </Link>
                        <div className="collapse navbar-collapse">
                            <div className="navbar-nav">
                                <Link to="/" className="nav-link">
                                    Dashboard
                                </Link>
                                <Link to="/grading" className="nav-link">
                                    Grading
                                </Link>
                                <Link to="/questions" className="nav-link">
                                    Questions
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <Switch>
                    {/* dashboard (home) */}
                    <Route exact path="/">
                        <GradingDashboard
                            answered={this.state.answered}
                            hideGraded={this.state.hideGraded}
                            onHideGraded={this.handleHideGraded}
                        />
                    </Route>

                    {/* grading */}
                    <Route exact path="/grading">
                        <GradingView
                            answered={this.state.answered}
                            noChange={true}
                            onGraded={this.handleGraded}
                            eventHandlers={eventHandlers}
                        />
                    </Route>
                    <Route path="/grading/:trainee/:questionId">
                        <GradeQuestion
                            answered={this.state.answered}
                            noChange={true}
                            onGraded={this.handleGraded}
                            eventHandlers={eventHandlers}
                        />
                    </Route>

                    {/* questions */}
                    <Route exact path="/questions">
                        <QuestionsView
                            questions={this.state.questions}
                            onDeleteQuestion={this.handleDeleteQuestion}
                        />
                    </Route>
                    <Route exact path="/questions/new">
                        <QuestionEditView
                            newQuestion={true}
                            onAddQuestion={this.handleAddQuestion}
                            onEditQuestion={this.handleEditQuestion}
                        />
                    </Route>
                    <Route path="/questions/edit/:questionId">
                        <EditQuestion
                            questions={this.state.questions}
                            onAddQuestion={this.handleAddQuestion}
                            onEditQuestion={this.handleEditQuestion}
                        />
                    </Route>

                    {/* catch-all for page not found */}
                    <Route path="*">
                        <h1>Page not found</h1>
                    </Route>
                </Switch>
            </div>
        );
    }
}

function GradeQuestion({ answered, noChange, onGraded, eventHandlers }) {
    let { trainee, questionId } = useParams();
    // gets returned as a string, so make int
    questionId = parseInt(questionId);
    const question = answered.find(
        (q) => q.trainee === trainee && q.id === questionId
    );
    if (!question) {
        return <h1>Invalid question</h1>;
    }
    return (
        <GradingView
            question={question}
            noChange={noChange}
            onGraded={onGraded}
            eventHandlers={eventHandlers}
        />
    );
}

function EditQuestion({ questions, ...eventHandlers }) {
    const { questionId } = useParams();
    const question = questions[questionId];
    return (
        <QuestionEditView
            newQuestion={false}
            question={question}
            {...eventHandlers}
        />
    );
}

export default App;
