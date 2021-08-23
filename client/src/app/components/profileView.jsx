import React from "react";
import { Title, resetValid, resetValidId, setElementValid } from "../shared";
import { changeUserPassword } from "../api";

export default function ProfileView({ user }) {
    const { roles } = user;
    if (roles.length === 0) {
        roles.push("No roles");
    }
    return (
        <React.Fragment>
            <Title title="Profile" />
            <h1>Profile</h1>
            <p>Email: {user.email}</p>
            <p>Roles: {roles.join(", ")}</p>
            <ChangePassword />
        </React.Fragment>
    );
}

function ChangePassword() {
    function resetValidNew() {
        resetValidId("new-password");
        resetValidId("confirm");
    }

    function handleChangePassword() {
        const elements = {
            successful: document.getElementById("successful"),
            password: document.getElementById("password"),
            newPassword: document.getElementById("new-password"),
            newFeedback: document.getElementById("new-password-feedback"),
            confirm: document.getElementById("confirm"),
        };
        const password = elements.password.value;
        const newPassword = elements.newPassword.value;
        const confirm = elements.confirm.value;

        elements.successful.classList.remove("is-valid");

        // validate
        let formValid = true;
        if (password === "") {
            formValid = false;
            setElementValid("password", false);
        }
        if (newPassword === "") {
            formValid = false;
            elements.newFeedback.innerHTML = "Please enter a password.";
            setElementValid("new-password", false);
        } else if (newPassword === password) {
            formValid = false;
            elements.newFeedback.innerHTML =
                "New password should be different.";
            setElementValid("new-password", false);
        }
        if (confirm !== newPassword) {
            formValid = false;
            setElementValid("confirm", false);
        }
        if (!formValid) return;

        changeUserPassword(password, newPassword, (user) => {
            if (user.error) {
                if (user.passwordIncorrect) {
                    setElementValid("password", false);
                }
                if (user.samePassword) {
                    elements.newFeedback.innerHTML =
                        "New password should be different.";
                    setElementValid("new-password", false);
                }
                return;
            }
            // clear the inputs
            Object.values(elements).forEach((e) => {
                resetValid(e);
                e.value = "";
            });
            // show success message
            elements.successful.classList.add("is-valid");
        });
    }

    return (
        <React.Fragment>
            <h3>Change Password</h3>
            <div>
                <input type="hidden" id="successful" />
                <div className="valid-feedback">
                    Password change successful!
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
                        document
                            .getElementById("successful")
                            .classList.remove("is-valid");
                        resetValid(event.target);
                    }}
                    placeholder="Password"
                />
                <div className="invalid-feedback">Invalid password.</div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="password">
                    New Password
                </label>
                <input
                    type="password"
                    className="form-control"
                    id="new-password"
                    onChange={(event) => {
                        document
                            .getElementById("successful")
                            .classList.remove("is-valid");
                        resetValidNew();
                    }}
                    placeholder="Password"
                />
                <div
                    className="invalid-feedback"
                    id="new-password-feedback"
                ></div>
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
                        document
                            .getElementById("successful")
                            .classList.remove("is-valid");
                        resetValidNew();
                    }}
                    placeholder="Confirm Password"
                />
                <div className="invalid-feedback">
                    Confirmation does not match password.
                </div>
            </div>

            <button
                type="button"
                className="btn btn-success"
                onClick={handleChangePassword}
            >
                Change password
            </button>
        </React.Fragment>
    );
}
