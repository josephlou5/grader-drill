import React from "react";
import { Title } from "app/shared";

export default function WrongRoleView({ role }) {
    return (
        <React.Fragment>
            <Title title="Access Denied" />
            <h1>Sorry! Access Denied</h1>
            <p>
                "{role}" role required to access this page. If an Admin has just
                given you this role, please log out and log in again for the
                change to take effect.
            </p>
        </React.Fragment>
    );
}
