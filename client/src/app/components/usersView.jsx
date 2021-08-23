import React, { useState, useEffect } from "react";
import { Title, setElementValid } from "../shared";
import { getAllUsers, updateUserRoles, resetUserPassword } from "../api";

export default function UsersView(props) {
    return (
        <React.Fragment>
            <Title title="Users" />
            <h1>Users</h1>
            <div>
                Note: Role updates require a user re-login to take effect.
            </div>
            <UsersTable {...props} />
        </React.Fragment>
    );
}

function UsersTable({ admin }) {
    const [needsUsers, setNeedsUsers] = useState(true);
    const [users, setUsers] = useState(null);

    useEffect(() => {
        if (!needsUsers) return;
        getAllUsers((u) => {
            setNeedsUsers(false);
            setUsers(u);
        });
    });

    if (!users) {
        return <p>Loading...</p>;
    }

    if (users.length === 0) {
        return <p>No users</p>;
    }

    function handleUpdateRoles() {
        setNeedsUsers(true);
    }

    const rows = users.map((user, index) => (
        <tr key={user.id}>
            <th>{index + 1}</th>
            <td>{user.email}</td>
            <td>
                <Roles
                    myself={admin.id === user.id}
                    user={user}
                    onUpdateRoles={handleUpdateRoles}
                />
            </td>
            <td>
                <NewPassword user={user} />
            </td>
        </tr>
    ));

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

function Roles({ myself, user, onUpdateRoles }) {
    const [editing, setEditing] = useState(false);
    const [checked, setCheckedState] = useState(null);

    function setChecked(updates) {
        setCheckedState({ ...checked, ...updates });
    }

    const { roles } = user;

    function handleEdit() {
        const checked = { Admin: false, Assessor: false, Trainee: false };
        roles.forEach((role) => {
            checked[role] = true;
        });
        setCheckedState(checked);
        setEditing(true);
    }

    function handleToggleRole(role) {
        if (myself && role === "Admin") {
            setElementValid("remove-admin", false);
            return;
        }
        setElementValid("remove-admin", true);
        setChecked({ [role]: !checked[role] });
    }

    function handleUpdateRoles() {
        const roles = Object.entries(checked).flatMap(([role, val]) =>
            val ? [role] : []
        );
        if (roles.length === 0) {
            setElementValid("roles", false);
            return;
        }
        const u = { ...user, roles };
        updateUserRoles(u, () => {
            onUpdateRoles();
            setEditing(false);
        });
    }

    function handleCancel() {
        setEditing(false);
    }

    if (!editing) {
        return (
            <React.Fragment>
                {roles.join(", ")}
                <button
                    type="button"
                    className="btn btn-success btn-sm ms-2"
                    onClick={handleEdit}
                >
                    Edit
                </button>
            </React.Fragment>
        );
    } else {
        const rolesChecks = ["Admin", "Assessor", "Trainee"].map((role) => (
            <React.Fragment key={role}>
                <input
                    type="checkbox"
                    className="btn-check"
                    id={role}
                    autoComplete="off"
                    checked={checked[role]}
                    onChange={() => handleToggleRole(role)}
                />
                <label className="btn btn-outline-success" htmlFor={role}>
                    {role}
                </label>
            </React.Fragment>
        ));
        return (
            <React.Fragment>
                <div className="d-inline-block">
                    <div role="group" className="btn-group btn-group-sm">
                        {rolesChecks}
                    </div>
                    <button
                        type="button"
                        className="btn btn-success btn-sm ms-2"
                        onClick={handleUpdateRoles}
                    >
                        Update
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm ms-2"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
                <div>
                    <input type="hidden" id="roles" />
                    <div className="invalid-feedback">
                        Must have at least one role.
                    </div>
                </div>
                <div>
                    <input type="hidden" id="remove-admin" />
                    <div className="invalid-feedback">
                        Can't remove Admin role from yourself.
                    </div>
                </div>
            </React.Fragment>
        );
    }
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
        // after 3 seconds, go back to first button
        setTimeout(() => setCount(0), 3 * 1000);
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
