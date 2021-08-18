import React from "react";
import { Title, resetValid, resetValidId, setElementValid } from "../shared";
import { signUpUser } from "../api";

export default function SignUpView({ onLogIn }) {
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
