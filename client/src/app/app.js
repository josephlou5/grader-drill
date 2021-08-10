import React, { useEffect, useState } from "react";
import { Switch, Route, Link, Redirect, useParams } from "react-router-dom";
import "./app.css";
import { getAllUsers, getUser } from "./api";

import TraineeDashboard from "./components/traineeDashboard";
import TrainingView from "./components/trainingView";
import AnsweredView from "./components/answeredView";

import AssessorDashboard from "./components/assessorDashboard";
import GradingView from "./components/gradingView";
import QuestionsView from "./components/questionsView";
import QuestionEditView from "./components/questionEditView";

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    const [hideUngraded, setHideUngraded] = useState(false);
    const [hideGraded, setHideGraded] = useState(false);

    function handleHideUngraded() {
        setHideUngraded(!hideUngraded);
    }

    function handleHideGraded() {
        setHideGraded(!hideGraded);
    }

    function handleLogIn(userId) {
        getUser(userId, (user) => {
            setUser(user);
            setLoggedIn(true);
        });
    }

    function handleLogOut() {
        setLoggedIn(false);
        setUser(null);
        setRole(null);
        setHideUngraded(false);
        setHideGraded(false);
    }

    function handleChooseRole(role) {
        setRole(role);
    }

    const logOutButton = (
        <div className="d-flex">
            {user && role && <span className="navbar-text me-2">{role}</span>}
            {user && <div className="navbar-brand">{user.email}</div>}
            <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleLogOut}
            >
                Log Out
            </button>
        </div>
    );

    let navbar = null;
    if (role === "Trainee") {
        navbar = (
            <div className="collapse navbar-collapse">
                <div className="navbar-nav">
                    <Link to="/dashboard" className="nav-link">
                        Dashboard
                    </Link>
                    <Link to="/training" className="nav-link">
                        Training
                    </Link>
                </div>
            </div>
        );
    } else if (role === "Assessor") {
        navbar = (
            <div className="collapse navbar-collapse">
                <div className="navbar-nav">
                    <Link to="/dashboard" className="nav-link">
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
        );
    }
    navbar = (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    Grader Drill
                </Link>
                {navbar}
                {user && logOutButton}
            </div>
        </nav>
    );

    let home;
    if (!loggedIn) {
        home = <LogInView onLogIn={handleLogIn} />;
    } else if (user.isTrainee && user.isAssessor) {
        home = <ChooseRole user={user} onChooseRole={handleChooseRole} />;
    } else {
        // only one role, so skip choosing
        const onlyRole = user.isTrainee ? "Trainee" : "Assessor";
        if (onlyRole !== role) {
            setRole(onlyRole);
        }
        home = <Redirect to="/dashboard" />;
    }

    let other = <Redirect to="/" />;
    if (loggedIn && role) {
        if (role === "Trainee") {
            other = (
                <TraineeView
                    trainee={user}
                    hideUngraded={hideUngraded}
                    onHideUngraded={handleHideUngraded}
                />
            );
        } else if (role === "Assessor") {
            other = (
                <AssessorView
                    assessor={user}
                    hideGraded={hideGraded}
                    onHideGraded={handleHideGraded}
                />
            );
        }
    }

    return (
        <div className="App">
            {navbar}
            <Switch>
                <Route exact path="/">
                    {home}
                </Route>
                <Route path="*">{other}</Route>
            </Switch>
        </div>
    );
}

function LogInView({ onLogIn }) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState(null);

    useEffect(() => {
        getAllUsers((users) => {
            setUsers(users);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return "Loading users...";
    }

    if (users.length === 0) {
        return "No users";
    }

    const btns = users.map((user, i) => (
        <div key={i}>
            <button
                className="btn btn-primary m-1"
                onClick={() => onLogIn(user.id)}
            >
                {user.email}
            </button>
        </div>
    ));

    return (
        <React.Fragment>
            <h1>Log In</h1>
            {btns}
        </React.Fragment>
    );
}

function ChooseRole({ user, onChooseRole }) {
    if (!user) {
        return "Invalid user";
    }
    const roles = [];
    if (user.isTrainee) {
        roles.push("Trainee");
    }
    if (user.isAssessor) {
        roles.push("Assessor");
    }
    return (
        <React.Fragment>
            <h1>Choose Role</h1>
            <Link to="/dashboard">
                {roles.map((role, index) => (
                    <button
                        key={index}
                        className="btn btn-primary m-1"
                        onClick={() => onChooseRole(role)}
                    >
                        {role}
                    </button>
                ))}
            </Link>
        </React.Fragment>
    );
}

function TraineeView({ trainee, hideUngraded, onHideUngraded }) {
    return (
        <Switch>
            {/* dashboard */}
            <Route exact path="/dashboard">
                <TraineeDashboard
                    trainee={trainee}
                    hideUngraded={hideUngraded}
                    onHideUngraded={onHideUngraded}
                />
            </Route>

            {/* training */}
            <Route exact path="/training">
                <TrainingView trainee={trainee} />
            </Route>

            {/* view answered */}
            <Route exact path="/answered/:answeredId">
                <AnsweredView trainee={trainee} hideRubric={true} />
            </Route>

            {/* catch-all for page not found */}
            <Route path="*">
                <h1>Page not found</h1>
            </Route>
        </Switch>
    );
}

function AssessorView({ assessor, hideGraded, onHideGraded }) {
    return (
        <Switch>
            {/* dashboard */}
            <Route exact path="/dashboard">
                <AssessorDashboard
                    assessor={assessor}
                    hideGraded={hideGraded}
                    onHideGraded={onHideGraded}
                />
            </Route>

            {/* grading */}
            <Route exact path="/grading">
                <GradingView assessor={assessor} />
            </Route>
            <Route exact path="/grading/:answeredId">
                <GradeQuestion assessor={assessor} />
            </Route>

            {/* view answered */}
            <Route exact path="/answered/:answeredId">
                <AnsweredView assessor={assessor} />
            </Route>

            {/* questions */}
            <Route exact path="/questions">
                <QuestionsView />
            </Route>
            <Route exact path="/questions/new">
                <QuestionEditView newQuestion={true} />
            </Route>
            <Route exact path="/questions/edit/:questionId">
                <EditQuestion />
            </Route>

            {/* catch-all for page not found */}
            <Route path="*">
                <h1>Page not found</h1>
            </Route>
        </Switch>
    );
}

function GradeQuestion({ assessor }) {
    const { answeredId } = useParams();
    return (
        <GradingView
            assessor={assessor}
            specificQuestion={true}
            answeredId={answeredId}
        />
    );
}

function EditQuestion() {
    const { questionId } = useParams();
    return <QuestionEditView newQuestion={false} questionId={questionId} />;
}
