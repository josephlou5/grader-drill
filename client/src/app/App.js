import React, { useState, useEffect } from "react";
import { Switch, Route, Link, useParams } from "react-router-dom";
import GradingDashboard from "./components/dashboardView";
import GradingView from "./components/gradingView";
import QuestionsView from "./components/questionsView";
import QuestionEditView from "./components/questionEditView";
import Question from "./components/question";
import "./App.css";

/*
// saving this just in case i want to use this code for database stuff

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
*/

export default function App() {
    const [hideGraded, setHideGraded] = useState(false);

    function handleHideGraded() {
        setHideGraded(!hideGraded);
    }

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
                        hideGraded={hideGraded}
                        onHideGraded={handleHideGraded}
                    />
                </Route>

                {/* grading */}
                <Route exact path="/grading">
                    <GradingView />
                </Route>
                <Route path="/grading/:trainee/:questionId">
                    <GradingView />
                </Route>

                {/* questions */}
                <Route exact path="/questions">
                    <QuestionsView />
                </Route>
                <Route exact path="/questions/new">
                    <QuestionEditView newQuestion={true} />
                </Route>
                <Route path="/questions/edit/:questionId">
                    <EditQuestion />
                </Route>

                {/* for testing */}
                <Route path="/question">
                    <ShowQuestion />
                </Route>

                {/* catch-all for page not found */}
                <Route path="*">
                    <h1>Page not found</h1>
                </Route>
            </Switch>
        </div>
    );
}

const ShowQuestion = () => {
    const [question, setQuestion] = useState({ id: null });
    const questionId = 1;
    useEffect(() => {
        let isMounted = true;
        fetch(`/api/getQuestion/${questionId}`)
            .then((res) => res.json())
            .then((q) => {
                if (isMounted) {
                    console.log("got question");
                    setQuestion(q);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [questionId]);
    return <Question question={question} />;
};

function EditQuestion(eventHandlers) {
    const { questionId } = useParams();
    return (
        <QuestionEditView
            newQuestion={false}
            questionId={questionId}
            {...eventHandlers}
        />
    );
}
