import React, { useEffect, useState } from "react";
import {
    Switch,
    Route,
    Link,
    Redirect,
    useParams,
    useHistory,
} from "react-router-dom";
import "./app.css";
import { Title } from "./shared";
import { isLoggedIn, logOutUser, setRoleCookie } from "./api";

import PageNotFound from "./components/pageNotFound";

import HomeView from "./components/homeView";
import LogInView from "./components/logInView";
import SignUpView from "./components/signUpView";

import TraineeDashboard from "./components/traineeDashboard";
import TrainingView from "./components/trainingView";
import AnsweredView from "./components/answeredView";

import AssessorDashboard from "./components/assessorDashboard";
import GradingView from "./components/gradingView";
import QuestionsView from "./components/questionsView";
import EditQuestionView from "./components/editQuestionView";

export default function App() {
    return (
        <div className="App">
            <AppView />
        </div>
    );
}

function AppView() {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRoleState] = useState({});

    const history = useHistory();

    function setRole(update) {
        if (update.role) {
            setRoleCookie(update.role);
        } else {
            setRoleCookie(null);
        }
        setRoleState(update);
    }

    // in the first render, check if the user is logged in through cookies
    useEffect(() => {
        if (!loading) return;
        isLoggedIn((user) => {
            setLoading(false);
            if (user && !user.error) {
                console.log("user is already logged in:", user);
                setUserRole(user);
                setLoggedIn(true);
            } else {
                console.log("no one is logged in");
            }
        });
    });

    function setUserRole(user) {
        setUser(user);

        // check role
        const roles = Object.entries(user).flatMap(([key, val]) => {
            if (["id", "email"].includes(key)) return [];
            if (typeof val !== "boolean") return [];
            if (!val) return [];
            // remove the "is" from the key
            const role = key.substring(2);
            return [role];
        });
        if (roles.length === 0) {
            return;
        } else if (roles.length === 1) {
            setRole({ oneRole: true, role: roles[0] });
        } else {
            if (user.role) {
                setRole({ role: user.role });
            } else {
                setRole({});
            }
        }
    }

    function handleLogIn(user) {
        setLoggedIn(true);
        setUserRole(user);
        history.push("/");
    }

    function handleLogOut() {
        logOutUser(() => {
            setLoggedIn(false);
            setUser(null);
            setRole({});
            history.push("/");
        });
    }

    function handleChooseRole(role) {
        setRole({ role });
    }

    if (loading) {
        return "Loading...";
    }

    if (loggedIn) {
        if (!user) {
            return "Loading...";
        }
        return (
            <LoggedInView
                user={user}
                role={role}
                onChooseRole={handleChooseRole}
                onLogOut={handleLogOut}
            />
        );
    }

    const logInButtons = (
        <div className="d-flex">
            <Link to="/login">
                <button type="button" className="btn btn-success me-2">
                    Log In
                </button>
            </Link>
            <Link to="/signup">
                <button type="button" className="btn btn-success">
                    Sign Up
                </button>
            </Link>
        </div>
    );

    const navbar = (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    Grader Drill
                </Link>
                {logInButtons}
            </div>
        </nav>
    );

    return (
        <React.Fragment>
            {navbar}
            <Switch>
                <Route exact path="/">
                    <HomeView />
                </Route>

                <Route exact path="/login">
                    <LogInView onLogIn={handleLogIn} />
                </Route>
                <Route exact path="/signup">
                    <SignUpView onLogIn={handleLogIn} />
                </Route>

                <Route path="*">
                    <Title title="Page not found" />
                    <h1>Page not found</h1>
                </Route>
            </Switch>
        </React.Fragment>
    );
}

function LoggedInView({ user, role, onChooseRole, onLogOut }) {
    let navbar = null;
    let other = <h1>Page not found</h1>;
    if (role.role === "Trainee") {
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
        other = <TraineeView trainee={user} />;
    } else if (role.role === "Assessor") {
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
        other = <AssessorView assessor={user} />;
    }

    const logOutButton = (
        <div className="d-flex">
            {user && role.role && (
                <span className="navbar-text me-2">{role.role}</span>
            )}
            {user && <div className="navbar-brand">{user.email}</div>}
            <Link to="/">
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={onLogOut}
                >
                    Log Out
                </button>
            </Link>
        </div>
    );

    navbar = (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    Grader Drill
                </Link>
                {navbar}
                {logOutButton}
            </div>
        </nav>
    );

    let home;
    if (role.oneRole) {
        home = <Redirect to="/dashboard" />;
    } else {
        home = <ChooseRole user={user} onChooseRole={onChooseRole} />;
    }

    return (
        <React.Fragment>
            {navbar}
            <Switch>
                <Route exact path="/">
                    {home}
                </Route>
                <Route path="*">{other}</Route>
            </Switch>
        </React.Fragment>
    );
}

function ChooseRole({ user, onChooseRole }) {
    if (!user) {
        return <h1>Invalid user</h1>;
    }

    const roles = Object.entries(user).flatMap(([key, val]) => {
        if (["id", "email"].includes(key)) return [];
        if (typeof val !== "boolean") return [];
        if (!val) return [];
        // remove the "is" from the key
        const role = key.substring(2);
        return [role];
    });

    if (roles.length === 0) {
        return <h1>Invalid user: has no roles</h1>;
    }

    return (
        <React.Fragment>
            <Title title="Choose Role" />
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

function TraineeView({ trainee }) {
    return (
        <React.Fragment>
            <Switch>
                {/* dashboard */}
                <Route exact path="/dashboard">
                    <TraineeDashboard trainee={trainee} />
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
                    <PageNotFound />
                </Route>
            </Switch>
        </React.Fragment>
    );
}

function AssessorView({ assessor }) {
    return (
        <React.Fragment>
            <Switch>
                {/* dashboard */}
                <Route exact path="/dashboard">
                    <AssessorDashboard assessor={assessor} />
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
                    <EditQuestionView newQuestion={true} />
                </Route>
                <Route exact path="/questions/edit/:questionId">
                    <EditQuestion />
                </Route>

                {/* catch-all for page not found */}
                <Route path="*">
                    <h1>Page not found</h1>
                </Route>
            </Switch>
        </React.Fragment>
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
    return <EditQuestionView questionId={questionId} />;
}