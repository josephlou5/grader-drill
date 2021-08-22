import React from "react";
import { Title } from "../shared";

export default function WrongRoleView({ role }) {
    return (
        <React.Fragment>
            <Title title="Access Denied" />
            <h1>Sorry! Access Denied</h1>
            <p>"{role}" role required to access this page.</p>
        </React.Fragment>
    );
}
