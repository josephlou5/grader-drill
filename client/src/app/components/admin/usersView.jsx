import React, { useState, useEffect } from "react";
import { Title, setElementValid, resetValid } from "app/shared";
import { getAllUsers, addUser, updateUserRoles } from "app/api";

export default function UsersView(props) {
    return (
        <React.Fragment>
            <Title title="Users" />
            <h1>Users</h1>
            <div>
                This is the users view. You can add a user, who will receive a
                "Trainee" role as the default. You can view and edit anyone's
                roles. Note that role updates require the user to re-login to
                take effect. Currently, there is no way to delete a user.
            </div>
            <Users {...props} />
        </React.Fragment>
    );
}

function Users({ admin }) {
    const [needsUsers, setNeedsUsers] = useState(true);
    const [users, setUsers] = useState(null);

    useEffect(() => {
        if (!needsUsers) return;
        getAllUsers().then((u) => {
            setNeedsUsers(false);
            setUsers(u);
        });
    });

    if (!users) {
        return <p>Loading...</p>;
    }

    function handleRefresh() {
        setNeedsUsers(true);
    }

    return (
        <React.Fragment>
            <AddUserInput onAddUser={handleRefresh} />
            <UsersTable
                admin={admin}
                users={users}
                onUpdateRoles={handleRefresh}
            />
        </React.Fragment>
    );
}

function AddUserInput({ onAddUser }) {
    const [username, setUsername] = useState("");

    function handleUsernameChange(username) {
        setUsername(username);
    }

    function handleAddUser() {
        const feedback = document.getElementById("username-feedback");

        if (username === "") {
            feedback.innerHTML = "Please enter a username.";
            setElementValid("username", false);
            return;
        }
        setElementValid("username", true);

        addUser(username).then((user) => {
            if (user.error) {
                feedback.innerHTML = "User already exists.";
                setElementValid("username", false);
                return;
            }
            onAddUser();
            setUsername("");
        });
    }

    return (
        <div
            className="input-group has-validation mb-2"
            style={{ width: "400px" }}
        >
            <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(event) => {
                    resetValid(event.target);
                    handleUsernameChange(event.target.value);
                }}
            />
            <button
                type="button"
                className="btn btn-success"
                onClick={handleAddUser}
            >
                Add User
            </button>
            <div className="invalid-feedback" id="username-feedback"></div>
        </div>
    );
}

function UsersTable({ admin, users, onUpdateRoles }) {
    if (users.length === 0) {
        return <p>No users</p>;
    }

    const rows = users.map((user, index) => (
        <tr key={user.id}>
            <th>{index + 1}</th>
            <td>{user.username}</td>
            <td>
                <Roles
                    myself={admin.id === user.id}
                    user={user}
                    onUpdateRoles={onUpdateRoles}
                />
            </td>
        </tr>
    ));

    return (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Username</th>
                    <th>Roles</th>
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
        updateUserRoles({ ...user, roles }).then((res) => {
            if (res.error) {
                window.location.reload();
                return;
            }
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
