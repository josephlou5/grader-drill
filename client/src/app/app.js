import React, { useState, useEffect } from "react";
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
import AboutView from "./components/aboutView";
import LogInView from "./components/logInView";
import SignUpView from "./components/signUpView";
import ProfileView from "./components/profileView";

import AdminDashboard from "./components/adminDashboard";
import UsersView from "./components/usersView";
import QuestionsView from "./components/questionsView";
import EditQuestionView from "./components/editQuestionView";
import DrillsView from "./components/drillsView";
import DrillView from "./components/drillView";
import EditDrillView from "./components/editDrillView";

import TraineeDashboard from "./components/traineeDashboard";
import JoinDrillView from "./components/joinDrillView";
import TrainingView from "./components/trainingView";
import AnsweredView from "./components/answeredView";

import AssessorDashboard from "./components/assessorDashboard";
import GradingView from "./components/gradingView";

export default function App() {
    return (
        <div className="App">
            <AppView />
        </div>
    );
}

function PrivateRoute({ user, children, ...rest }) {
    const render = ({ location }) => {
        if (user) return children;
        const to = {
            pathname: "/login",
            state: { from: location },
        };
        return <Redirect to={to} />;
    };
    return <Route {...rest} render={render} />;
}

function AppView() {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRoleState] = useState();

    const history = useHistory();

    function setRole(role) {
        setRoleCookie(role);
        setRoleState(role);
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
        const { roles } = user;
        if (roles.length === 0) {
            return;
        } else if (roles.length === 1) {
            setRole(roles[0]);
        } else {
            setRole(user.role || null);
        }
    }

    function handleLogIn(user) {
        setLoggedIn(true);
        setUserRole(user);
        history.push("/");
    }

    function handleLogOut() {
        setLoggedIn(false);
        setUser(null);
        setRole(null);
        logOutUser(() => history.push("/"));
    }

    function handleChooseRole(role) {
        setRole(role);
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
                <div className="collapse navbar-collapse">
                    <div className="navbar-nav">
                        <Link to="/about" className="nav-link">
                            About
                        </Link>
                    </div>
                </div>
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
                <Route exact path="/about">
                    <AboutView />
                </Route>

                <Route exact path="/login">
                    <LogInView onLogIn={handleLogIn} />
                </Route>
                <Route exact path="/signup">
                    <SignUpView onLogIn={handleLogIn} />
                </Route>

                <Route path="*">
                    <PageNotFound />
                </Route>
            </Switch>
        </React.Fragment>
    );
}

function LoggedInView({ user, role, onChooseRole, onLogOut }) {
    let navbar = null;
    let other = <PageNotFound />;
    switch (role) {
        case "Admin":
            navbar = (
                <div className="collapse navbar-collapse">
                    <div className="navbar-nav">
                        <Link to="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <Link to="/users" className="nav-link">
                            Users
                        </Link>
                        <Link to="/questions" className="nav-link">
                            Questions
                        </Link>
                        <Link to="/drills" className="nav-link">
                            Drills
                        </Link>
                    </div>
                </div>
            );
            other = <AdminView admin={user} />;
            break;
        case "Trainee":
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
            break;
        case "Assessor":
            navbar = (
                <div className="collapse navbar-collapse">
                    <div className="navbar-nav">
                        <Link to="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <Link to="/grading" className="nav-link">
                            Grading
                        </Link>
                    </div>
                </div>
            );
            other = <AssessorView assessor={user} />;
            break;
        default:
            break;
    }

    const logOutButton = (
        <div className="d-flex">
            {user && role && (
                <Link to="/" className="nav-link text-secondary">
                    {role}
                </Link>
            )}
            {user && (
                <Link to="/profile" className="navbar-brand">
                    {user.email}
                </Link>
            )}
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

    return (
        <React.Fragment>
            {navbar}
            <Switch>
                <Route exact path="/">
                    <ChooseRole user={user} onChooseRole={onChooseRole} />
                </Route>
                <Route exact path="/profile">
                    <ProfileView user={user} />
                </Route>
                <Route path="*">{other}</Route>
            </Switch>
        </React.Fragment>
    );
}

function ChooseRole({ user, onChooseRole }) {
    if (!user) {
        return (
            <React.Fragment>
                <Title title="Invalid user" />
                <h1>Invalid user</h1>
            </React.Fragment>
        );
    }

    if (user.roles.length === 0) {
        return (
            <React.Fragment>
                <Title title="Invalid user" />
                <h1>Invalid user: has no roles</h1>
            </React.Fragment>
        );
    }

    if (user.roles.length === 1) {
        return <Redirect to="/dashboard" />;
    }

    return (
        <React.Fragment>
            <Title title="Choose Role" />
            <h1>Choose Role</h1>
            <Link to="/dashboard">
                {user.roles.map((role, index) => (
                    <button
                        key={index}
                        className="btn btn-success m-1"
                        onClick={() => onChooseRole(role)}
                    >
                        {role}
                    </button>
                ))}
            </Link>
        </React.Fragment>
    );
}

function AdminView({ admin }) {
    return (
        <React.Fragment>
            <Switch>
                {/* dashboard */}
                <Route exact path="/dashboard">
                    <AdminDashboard />
                </Route>

                {/* users */}
                <Route exact path="/users">
                    <UsersView admin={admin} />
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

                {/* drills */}
                <Route exact path="/drills">
                    <DrillsView />
                </Route>
                <Route exact path="/drills/new">
                    <EditDrillView newDrill={true} />
                </Route>
                <Route exact path="/drills/edit/:drillId">
                    <EditDrill />
                </Route>
                <Route exact path="/drills/:drillId">
                    <DrillView />
                </Route>

                {/* answered */}
                <Route exact path="/answered/:answeredId">
                    <AnsweredView admin={admin} />
                </Route>

                {/* catch-all for page not found */}
                <Route path="*">
                    <PageNotFound />
                </Route>
            </Switch>
        </React.Fragment>
    );
}

function EditDrill() {
    const { drillId } = useParams();
    return <EditDrillView drillId={drillId} />;
}

function EditQuestion() {
    const { questionId } = useParams();
    return <EditQuestionView questionId={questionId} />;
}

function TraineeView({ trainee }) {
    return (
        <React.Fragment>
            <Switch>
                {/* dashboard */}
                <Route exact path="/dashboard">
                    <TraineeDashboard />
                </Route>

                {/* join drill */}
                <Route exact path="/join/:drillCode">
                    <JoinDrillView />
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

                {/* catch-all for page not found */}
                <Route path="*">
                    <PageNotFound />
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
