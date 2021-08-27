import React, { useState, useEffect } from "react";
import {
    useLocation,
    useParams,
    Switch,
    Route,
    Link,
    Redirect,
} from "react-router-dom";
import "./app.css";
import { useMountEffect } from "./shared";
import { isLoggedIn, setRoleCookie, logOutUser } from "./api";

import { PageNotFound, WrongRoleView } from "./components";
import { HomeView, AboutView, HelpView } from "./components/public";
import {
    ProfileView,
    ChooseRoleView,
    AnsweredView,
} from "./components/protected";
import {
    AdminDashboard,
    UsersView,
    QuestionsView,
    EditQuestionView,
    DrillsView,
    EditDrillView,
    DrillView,
} from "./components/admin";
import { AssessorDashboard, GradingView } from "./components/assessor";
import {
    TraineeDashboard,
    JoinDrillView,
    TrainingView,
} from "./components/trainee";

// protected route
let count = 0;
function Protected({ user, setUser, role, children, ...rest }) {
    const [loading, setLoading] = useState(true);

    console.log(rest.path, loading, count++);

    useEffect(() => {
        isLoggedIn((user) => {
            setUser(user, role);
            if (loading) setLoading(false);
        });
    });

    if (loading) {
        return null;
    }
    if (user) {
        if (role) {
            if (!user.roles.includes(role)) {
                return <WrongRoleView role={role} />;
            } else if (user.role !== role) {
                return "Changing roles...";
            }
        }
        return <Route {...rest}>{children}</Route>;
    }
    const renderFunc = ({ location }) => {
        const to = "/login?redirect=" + location.pathname;
        window.location.assign(to);
        return <Redirect to={to} />;
    };
    return <Route {...rest} render={renderFunc} />;
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUserState] = useState(null);

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
            if (u.roles.length === 1) return u;
            if (requiredRole) {
                // if user already has role, do nothing
                if (user.role === requiredRole) return u;
                if (u.roles.includes(requiredRole)) {
                    // force user to take required role
                    if (u.role !== requiredRole) {
                        setRoleCookie(requiredRole);
                        u.role = requiredRole;
                    }
                }
            }
            // if user already has role, do nothing
            if (user.role === u.role) return u;
        }
        setUserState(u);
        return u;
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

    function handleLogOut() {
        logOutUser(() => setUser(null));
    }

    function handleChooseRole(role) {
        setRole(role);
    }

    // props for private routes
    // use key to refresh state
    let count = 0;
    function props(role = null) {
        return {
            key: count++,
            exact: true,
            user,
            setUser,
            role: role || undefined,
        };
    }

    return (
        <div className="App">
            <Navbar user={user} onLogOut={handleLogOut} />
            <Switch>
                {/* PUBLIC */}

                <Route exact path="/">
                    <HomeView />
                </Route>
                <Route exact path="/about">
                    <AboutView />
                </Route>
                <Route exact path="/help">
                    <HelpView />
                </Route>

                <Route exact path="/login">
                    <LogInView />
                </Route>

                {/* PROTECTED */}

                <Protected path="/role" {...props()}>
                    <ChooseRoleView
                        user={user}
                        onChooseRole={handleChooseRole}
                    />
                </Protected>
                <Protected path="/profile" {...props()}>
                    <ProfileView user={user} />
                </Protected>

                <Protected path="/dashboard" {...props()}>
                    <Dashboard user={user} />
                </Protected>
                <Protected path="/answered/:answeredId" {...props()}>
                    <AnsweredView user={user} />
                </Protected>

                {/* ADMIN ROLE */}

                {/* users */}
                <Protected path="/users" {...props("Admin")}>
                    <UsersView admin={user} />
                </Protected>

                {/* questions */}
                <Protected path="/questions" {...props("Admin")}>
                    <QuestionsView />
                </Protected>
                <Protected path="/questions/new" {...props("Admin")}>
                    <EditQuestionView newQuestion={true} />
                </Protected>
                <Protected
                    path="/questions/edit/:questionId"
                    {...props("Admin")}
                >
                    <EditQuestion />
                </Protected>

                {/* drills */}
                <Protected path="/drills" {...props("Admin")}>
                    <DrillsView />
                </Protected>
                <Protected path="/drills/new" {...props("Admin")}>
                    <EditDrillView newDrill={true} />
                </Protected>
                <Protected path="/drills/edit/:drillId" {...props("Admin")}>
                    <EditDrill />
                </Protected>
                <Protected path="/drills/:drillId" {...props("Admin")}>
                    <DrillView />
                </Protected>

                {/* ASSESSOR ROLE */}

                {/* grading */}
                <Protected path="/grading" {...props("Assessor")}>
                    <GradingView assessor={user} />
                </Protected>
                <Protected path="/grading/:answeredId" {...props("Assessor")}>
                    <GradeQuestion assessor={user} />
                </Protected>

                {/* TRAINEE ROLE */}

                {/* join drill */}
                <Protected path="/join/:drillCode" {...props("Trainee")}>
                    <JoinDrillView />
                </Protected>

                {/* training */}
                <Protected path="/training" {...props("Trainee")}>
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
    const { search: query } = useLocation();
    let buttons;
    const navbarLinks = [];
    if (!user) {
        buttons = (
            <a href={"/login" + query} className="btn btn-success">
                Log In
            </a>
        );
        navbarLinks.push(["/about", "About"]);
        navbarLinks.push(["/help", "Help"]);
    } else {
        let roleLabel = null;
        if (!user.role) {
            navbarLinks.push(["/role", "Choose Role"]);
        } else {
            if (user.roles.length === 1) {
                roleLabel = <div className="navbar-text me-3">{user.role}</div>;
            } else {
                roleLabel = (
                    <Link to="/role" className="nav-link text-secondary">
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
                    {user.username}
                </Link>
                <Link to="/">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={onLogOut}
                    >
                        Log Out
                    </button>
                </Link>
            </React.Fragment>
        );
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    Grader Drill
                </Link>
                <div className="collapse navbar-collapse">
                    <div className="navbar-nav">
                        {navbarLinks.map(([link, title]) => (
                            <Link key={link} to={link} className="nav-link">
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

function LogInView() {
    const [loading, setLoading] = useState(true);

    const { search } = useLocation();

    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        // in development, mock log in
        if (!loading) return;
        fetch("/dev/login").then(() => setLoading(false));
    });

    if (loading) {
        return "Logging in...";
    }

    // find redirect path
    const redirect = search ? search.substring("?redirect=".length) : "/role";
    window.location.assign(redirect);
    return "Logged in";
}

function Dashboard({ user }) {
    if (!user.role) {
        return <Redirect to="/role" />;
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
