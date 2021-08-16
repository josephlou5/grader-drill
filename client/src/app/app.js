import React, { useEffect, useState } from "react";
import { Switch, Route, Link, Redirect, useParams } from "react-router-dom";
import "./app.css";
import { resetValid, resetValidId, setElementValid } from "./shared";
import {
    isLoggedIn,
    logInUser,
    logOutUser,
    setRoleCookie,
    signUpUser,
} from "./api";

import TraineeDashboard from "./components/traineeDashboard";
import TrainingView from "./components/trainingView";
import AnsweredView from "./components/answeredView";

import AssessorDashboard from "./components/assessorDashboard";
import GradingView from "./components/gradingView";
import QuestionsView from "./components/questionsView";
import QuestionEditView from "./components/questionEditView";

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
    }

    function handleLogOut() {
        logOutUser(() => {
            setLoggedIn(false);
            setUser(null);
            setRole({});
        });
    }

    function handleChooseRole(role) {
        setRole({ role });
    }

    if (loading) {
        return "Loading...";
    }

    if (loggedIn && !user) {
        // go from login/signup page to new home
        return <Redirect to="/" />;
    } else if (loggedIn && user) {
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
                        onClick={handleLogOut}
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
            home = <ChooseRole user={user} onChooseRole={handleChooseRole} />;
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
                    <Home />
                </Route>

                <Route exact path="/login">
                    <LogInView onLogIn={handleLogIn} />
                </Route>
                <Route exact path="/signup">
                    <SignUpView onLogIn={handleLogIn} />
                </Route>

                <Route path="*">
                    <h1>Page not found</h1>
                </Route>
            </Switch>
        </React.Fragment>
    );
}

function Home() {
    return <h1>Welcome!</h1>;
}

function SignUpView({ onLogIn }) {
    function handleSignUp() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;
        const roles = {};
        let atLeastOneRole = false;
        for (const element of document.getElementsByClassName("role")) {
            roles[element.id] = element.checked;
            if (element.checked) {
                atLeastOneRole = true;
            }
        }

        // validate
        let formValid = true;
        const EMAIL_RE = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (email === "") {
            formValid = false;
            setElementValid("email", false);
        } else if (!EMAIL_RE.test(email)) {
            formValid = false;
            setElementValid("email-invalid", false);
        }
        if (password === "") {
            formValid = false;
            setElementValid("password", false);
        }
        if (confirm !== password) {
            formValid = false;
            setElementValid("confirm", false);
        }
        if (!atLeastOneRole) {
            formValid = false;
            setElementValid("roles", false);
        }
        if (!formValid) {
            setElementValid("error", false);
            return;
        }

        signUpUser(email, password, roles, (user) => {
            // validate
            if (user.error) {
                setElementValid("error", false);
                if (user.email_violation) {
                    setElementValid("email-invalid", false);
                } else if (user.unique_violation) {
                    setElementValid("email-taken", false);
                }
                if (user.role_violation) {
                    setElementValid("roles", false);
                }
                return;
            }
            onLogIn(user);
        });
    }

    return (
        <React.Fragment>
            <h1>Sign Up</h1>

            <div className="mb-2">
                <input type="hidden" id="error" />
                <div className="invalid-feedback">Error signing up.</div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="email">
                    Email address
                </label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    onChange={(event) => {
                        resetValidId("error");
                        resetValid(event.target);
                        resetValidId("email-invalid");
                        resetValidId("email-taken");
                    }}
                    placeholder="name@example.com"
                />
                <div className="invalid-feedback">
                    Please enter an email address.
                </div>
                <div>
                    <input type="hidden" id="email-invalid" />
                    <div className="invalid-feedback">
                        Invalid email address.
                    </div>
                </div>
                <div>
                    <input type="hidden" id="email-taken" />
                    <div className="invalid-feedback">
                        Email belongs to another account.
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="password">
                    Password
                </label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    onChange={(event) => {
                        resetValidId("error");
                        resetValid(event.target);
                        resetValidId("confirm");
                    }}
                    placeholder="Password"
                />
                <div className="invalid-feedback">Please enter a password.</div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="confirm">
                    Confirm Password
                </label>
                <input
                    type="password"
                    className="form-control"
                    id="confirm"
                    onChange={(event) => {
                        resetValidId("error");
                        resetValid(event.target);
                        resetValidId("password");
                    }}
                    placeholder="Confirm Password"
                />
                <div className="invalid-feedback">
                    Confirmation does not match password.
                </div>
            </div>

            <div>Roles</div>
            <div role="group" className="btn-group d-block mb-3">
                {["Trainee", "Assessor"].map((role, index) => {
                    const idFor = "is" + role;
                    return (
                        <React.Fragment key={index}>
                            <input
                                type="checkbox"
                                className="btn-check role"
                                id={idFor}
                                autoComplete="off"
                                onChange={() => {
                                    resetValidId("error");
                                    resetValidId("roles");
                                }}
                            />
                            <label
                                className="btn btn-outline-success"
                                htmlFor={idFor}
                            >
                                {role}
                            </label>
                        </React.Fragment>
                    );
                })}

                <div>
                    <input type="hidden" id="roles" />
                    <div className="invalid-feedback">
                        Must choose at least one role.
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="btn btn-lg btn-primary"
                onClick={handleSignUp}
            >
                Sign Up
            </button>
        </React.Fragment>
    );
}

function LogInView({ onLogIn }) {
    function handleLogIn() {
        // validate
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        // const rememberMe = document.getElementById("remember-me").checked;

        let formValid = true;
        if (email === "") {
            formValid = false;
            setElementValid("email", false);
        }
        if (password === "") {
            formValid = false;
            setElementValid("password", false);
        }
        if (!formValid) return;

        logInUser(email, password, (user) => {
            if (user.error) {
                setElementValid("login", false);
                return;
            }
            onLogIn(user);
        });
    }

    return (
        <React.Fragment>
            <h1>Log In</h1>

            <div className="mb-3">
                <label className="form-label" htmlFor="email">
                    Email address
                </label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    onChange={(event) => {
                        resetValid(event.target);
                        resetValidId("login");
                    }}
                    placeholder="name@example.com"
                />
                <div className="invalid-feedback">
                    Please enter an email address.
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="password">
                    Password
                </label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    onChange={(event) => {
                        resetValid(event.target);
                        resetValidId("login");
                    }}
                    placeholder="Password"
                />
                <div className="invalid-feedback">Please enter a password.</div>
            </div>

            <div className="mb-2">
                <input type="hidden" id="login" />
                <div className="invalid-feedback">
                    Invalid email or password.
                </div>
            </div>

            <div className="form-check mb-3">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember-me"
                />
                <label className="form-check-label" htmlFor="remember-me">
                    Remember me
                </label>
            </div>

            <button
                type="button"
                className="btn btn-lg btn-primary"
                onClick={handleLogIn}
            >
                Log In
            </button>
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
                    <h1>Page not found</h1>
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
    return <QuestionEditView newQuestion={false} questionId={questionId} />;
}
