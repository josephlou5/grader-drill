import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { Title } from "app/shared";

export default function ChooseRoleView({ user, onChooseRole }) {
    const [chose, setChose] = useState(false);
    if (chose || user.roles.length === 1) {
        return <Redirect to="/dashboard" />;
    }
    return (
        <React.Fragment>
            <Title title="Choose Role" />
            <h1>Choose Role</h1>
            {user.roles.map((role) => (
                <button
                    key={role}
                    className="btn btn-success m-1"
                    onClick={() => {
                        onChooseRole(role);
                        setChose(true);
                    }}
                >
                    {role}
                </button>
            ))}
        </React.Fragment>
    );
}
