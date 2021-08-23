import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { Title, setElementValid, resetValid, resetValidId } from "../shared";
import { signUpUser } from "../api";

export default function SignUpView({ onLogIn }) {
    const [redirect, setRedirect] = useState(false);

    function handleSignUp() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm").value;
        const roles = [];
        for (const element of document.getElementsByClassName("role")) {
            if (element.checked) {
                roles.push(element.id);
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
        if (roles.length === 0) {
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
            setRedirect(true);
        });
    }

    if (redirect) {
        return <Redirect to="/" />;
    }

    return (
        <React.Fragment>
            <Title title="Sign Up" />
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
                {["Assessor", "Trainee"].map((role) => (
                    <React.Fragment key={role}>
                        <input
                            type="checkbox"
                            className="btn-check role"
                            id={role}
                            autoComplete="off"
                            onChange={() => {
                                resetValidId("error");
                                resetValidId("roles");
                            }}
                        />
                        <label
                            className="btn btn-outline-success"
                            htmlFor={role}
                        >
                            {role}
                        </label>
                    </React.Fragment>
                ))}

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
