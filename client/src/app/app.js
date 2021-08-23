import React, { useState, useEffect } from "react";
import {
    useHistory,
    useParams,
    Switch,
    Route,
    Link,
    Redirect,
} from "react-router-dom";
import "./app.css";
import { useMountEffect } from "./shared";
import { isLoggedIn, setRoleCookie, logOutUser } from "./api";

import PageNotFound from "./components/pageNotFound";
import WrongRoleView from "./components/wrongRoleView";

import HomeView from "./components/homeView";
import AboutView from "./components/aboutView";
import LogInView from "./components/logInView";
import SignUpView from "./components/signUpView";

import ProfileView from "./components/profileView";
import ChooseRoleView from "./components/chooseRoleView";
import AnsweredView from "./components/answeredView";

import AdminDashboard from "./components/adminDashboard";
import UsersView from "./components/usersView";
import QuestionsView from "./components/questionsView";
import EditQuestionView from "./components/editQuestionView";
import DrillsView from "./components/drillsView";
import EditDrillView from "./components/editDrillView";
import DrillView from "./components/drillView";

import AssessorDashboard from "./components/assessorDashboard";
import GradingView from "./components/gradingView";

import TraineeDashboard from "./components/traineeDashboard";
import JoinDrillView from "./components/joinDrillView";
import TrainingView from "./components/trainingView";

// protected route
function Protected({ user, setUser, role, children, ...rest }) {
    useEffect(() => {
        isLoggedIn((u) => setUser(u, role));
    });

    if (user) {
        if (role) {
            if (!user.roles.includes(role)) {
                return <WrongRoleView role={role} />;
            } else if (user.role !== role) {
                console.log(user);
                return "Changing roles...";
            }
        }
        return <Route {...rest}>{children}</Route>;
    }
    const renderFunc = ({ location }) => {
        const to = {
            pathname: "/login",
            state: { from: location },
        };
        return <Redirect to={to} />;
    };
    return <Route {...rest} render={renderFunc} />;
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUserState] = useState(null);

    const history = useHistory();

    function setUser(u, requiredRole = null) {
        if (!u) {
            // set to null
        } else if (!user || user.id !== u.id) {
            // replacing old user (no user or different user)
            if (u.roles.length === 1) {
                // only one role, which is already set by login
            } else if (requiredRole && u.roles.includes(requiredRole)) {
                // force user to take required role
                if (u.role !== requiredRole) {
                    setRoleCookie(requiredRole);
                    u.role = requiredRole;
                }
            }
        } else {
            // updating same user
            // role should already be set, so do nothing
            if (u.roles.length === 1) return;
            if (requiredRole) {
                // if user already has role, do nothing
                if (user.role === requiredRole) return;
                if (u.roles.includes(requiredRole)) {
                    // force user to take required role
                    if (u.role !== requiredRole) {
                        setRoleCookie(requiredRole);
                        u.role = requiredRole;
                    }
                }
            }
            // if user already has role, do nothing
            if (user.role === u.role) return;
        }
        setUserState(u);
    }

    function setRole(role) {
        if (!user) return;
        const currRole = user.role || null;
        if (!role && !currRole) return;
        if (role === currRole) return;
        setRoleCookie(role);
        setUserState({ ...user, role });
    }

    useMountEffect(() => {
        isLoggedIn((u) => {
            setUser(u);
            setLoading(false);
        });
    });

    if (loading) return "Loading...";

    function handleLogIn(user) {
        setUser(user);
    }

    function handleLogOut() {
        logOutUser(() => {
            setUser(null);
            history.push("/");
        });
    }

    function handleChooseRole(role) {
        setRole(role);
    }

    // props for private routes
    const props = { exact: true, user, setUser };
    const admin = { ...props, role: "Admin" };
    const assessor = { ...props, role: "Assessor" };
    const trainee = { ...props, role: "Trainee" };

    return (
        <div className="App">
            <Navbar user={user} onLogOut={handleLogOut} />
            <Switch>
                {!user && (
                    <Route exact path="/">
                        <HomeView />
                    </Route>
                )}
                <Route exact path="/about">
                    <AboutView />
                </Route>

                <Route exact path="/login">
                    <LogInView onLogIn={handleLogIn} />
                </Route>
                <Route exact path="/signup">
                    <SignUpView onLogIn={handleLogIn} />
                </Route>

                <Protected path="/" {...props}>
                    <ChooseRoleView
                        user={user}
                        onChooseRole={handleChooseRole}
                    />
                </Protected>
                <Protected path="/profile" {...props}>
                    <ProfileView user={user} />
                </Protected>

                <Protected path="/dashboard" {...props}>
                    <Dashboard user={user} />
                </Protected>
                <Protected path="/answered/:answeredId" {...props}>
                    <AnsweredView user={user} />
                </Protected>

                {/* ADMIN ROLE */}

                {/* users */}
                <Protected path="/users" {...admin}>
                    <UsersView admin={user} />
                </Protected>

                {/* questions */}
                <Protected path="/questions" {...admin}>
                    <QuestionsView />
                </Protected>
                <Protected path="/questions/new" {...admin}>
                    <EditQuestionView newQuestion={true} />
                </Protected>
                <Protected path="/questions/edit/:questionId" {...admin}>
                    <EditQuestion />
                </Protected>

                {/* drills */}
                <Protected path="/drills" {...admin}>
                    <DrillsView />
                </Protected>
                <Protected path="/drills/new" {...admin}>
                    <EditDrillView newDrill={true} />
                </Protected>
                <Protected path="/drills/edit/:drillId" {...admin}>
                    <EditDrill />
                </Protected>
                <Protected path="/drills/:drillId" {...admin}>
                    <DrillView />
                </Protected>

                {/* ASSESSOR ROLE */}

                {/* grading */}
                <Protected path="/grading" {...assessor}>
                    <GradingView assessor={user} />
                </Protected>
                <Protected path="/grading/:answeredId" {...assessor}>
                    <GradeQuestion assessor={user} />
                </Protected>

                {/* TRAINEE ROLE */}

                {/* join drill */}
                <Protected path="/join/:drillCode" {...trainee}>
                    <JoinDrillView />
                </Protected>

                {/* training */}
                <Protected path="/training" {...trainee}>
                    <TrainingView />
                </Protected>

                <Route path="*">
                    <PageNotFound />
                </Route>
            </Switch>
        </div>
    );
}

function Navbar({ user, onLogOut }) {
    let homeLink = "/";
    let buttons;
    const navbarLinks = [];
    if (!user) {
        buttons = (
            <React.Fragment>
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
            </React.Fragment>
        );
        navbarLinks.push(["/about", "About"]);
    } else {
        let roleLabel = null;
        if (user.role) {
            if (user.roles.length === 1) {
                homeLink = "/dashboard";
                roleLabel = <div className="navbar-text me-3">{user.role}</div>;
            } else {
                roleLabel = (
                    <Link to="/" className="nav-link text-secondary">
                        {user.role}
                    </Link>
                );
            }
            navbarLinks.push(["/dashboard", "Dashboard"]);
            if (user.role === "Admin") {
                navbarLinks.push(["/users", "Users"]);
                navbarLinks.push(["/questions", "Questions"]);
                navbarLinks.push(["/drills", "Drills"]);
            } else if (user.role === "Assessor") {
                navbarLinks.push(["/grading", "Grading"]);
            } else if (user.role === "Trainee") {
                navbarLinks.push(["/training", "Training"]);
            }
        }
        buttons = (
            <React.Fragment>
                {roleLabel}
                <Link to="/profile" className="navbar-brand">
                    {user.email}
                </Link>
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={onLogOut}
                >
                    Log Out
                </button>
            </React.Fragment>
        );
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link to={homeLink} className="navbar-brand">
                    Grader Drill
                </Link>
                <div className="collapse navbar-collapse">
                    <div className="navbar-nav">
                        {navbarLinks.map(([link, title], index) => (
                            <Link key={index} to={link} className="nav-link">
                                {title}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="d-flex">{buttons}</div>
            </div>
        </nav>
    );
}

function Dashboard({ user }) {
    if (!user.role) {
        return <Redirect to="/" />;
    }
    switch (user.role) {
        case "Admin":
            return <AdminDashboard />;
        case "Assessor":
            return <AssessorDashboard />;
        case "Trainee":
            return <TraineeDashboard />;
        default:
            return <h1>Unknown user role</h1>;
    }
}

function EditQuestion() {
    const { questionId } = useParams();
    return <EditQuestionView questionId={questionId} />;
}

function EditDrill() {
    const { drillId } = useParams();
    return <EditDrillView drillId={drillId} />;
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
