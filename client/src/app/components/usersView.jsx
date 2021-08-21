import React, { useState, useEffect } from "react";
import { Title } from "../shared";
import { getAllUsers, resetUserPassword } from "../api";

export default function UsersView() {
    return (
        <React.Fragment>
            <Title title="Users" />
            <h1>Users</h1>
            <UsersTable />
        </React.Fragment>
    );
}

function UsersTable() {
    const [users, setUsers] = useState(null);

    useEffect(() => {
        getAllUsers((u) => setUsers(u));
    }, []);

    if (!users) {
        return <p>Loading...</p>;
    }

    if (users.length === 0) {
        return <p>No users</p>;
    }

    const rows = users.map((user, index) => {
        return (
            <tr key={index}>
                <th>{index + 1}</th>
                <td>{user.email}</td>
                <td>{user.roles.join(", ")}</td>
                <td>
                    <NewPassword user={user} />
                </td>
            </tr>
        );
    });

    return (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Reset Password</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function NewPassword({ user }) {
    const [count, setCount] = useState(0);
    const [password, setPassword] = useState(null);

    function buttonPressed() {
        setCount(count + 1);
    }

    function generatePassword() {
        buttonPressed();
        resetUserPassword(user.id, (u) => {
            if (!u) {
                setPassword("Error");
            } else {
                setPassword(u.password);
            }
        });
    }

    if (count === 0) {
        return (
            <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={buttonPressed}
            >
                New Password
            </button>
        );
    } else if (count === 1) {
        return (
            <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={generatePassword}
            >
                Confirm
            </button>
        );
    } else {
        return password || "Generating password...";
    }
}
