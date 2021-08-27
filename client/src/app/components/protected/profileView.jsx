import React from "react";
import { Title } from "app/shared";

export default function ProfileView({ user }) {
    const { roles } = user;
    if (roles.length === 0) {
        roles.push("No roles");
    }
    return (
        <React.Fragment>
            <Title title="Profile" />
            <h1>Profile</h1>
            <p>Username: {user.username}</p>
            <p>Roles: {roles.join(", ")}</p>
        </React.Fragment>
    );
}
