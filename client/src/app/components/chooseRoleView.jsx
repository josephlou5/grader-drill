import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Title } from "../shared";

export default function ChooseRoleView({ user, onChooseRole }) {
    if (user.roles.length === 1) {
        return <Redirect to="/dashboard" />;
    }
    return (
        <React.Fragment>
            <Title title="Choose Role" />
            <h1>Choose Role</h1>
            <Link to="/dashboard">
                {user.roles.map((role) => (
                    <button
                        key={role}
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
