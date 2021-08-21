import React from "react";
import { Title, setElementValid, resetValid, resetValidId } from "../shared";
import { logInUser } from "../api";

export default function LogInView({ onLogIn }) {
    function handleLogIn() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        // const rememberMe = document.getElementById("remember-me").checked;

        // validate
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
            <Title title="Log In" />
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
                    onKeyDown={(event) => {
                        if (event.code === "Enter") {
                            document.getElementById("login-button").click();
                        }
                    }}
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

            {/* <div className="form-check mb-3">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember-me"
                />
                <label className="form-check-label" htmlFor="remember-me">
                    Remember me
                </label>
            </div> */}

            <button
                type="button"
                className="btn btn-lg btn-primary"
                id="login-button"
                onClick={handleLogIn}
            >
                Log In
            </button>
        </React.Fragment>
    );
}
