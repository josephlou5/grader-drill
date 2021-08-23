import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, DueDate } from "../shared";
import { deleteDrill, getAllDrills } from "../api";

export default function DrillsView() {
    return (
        <React.Fragment>
            <Title title="Drills" />
            <h1>Drills</h1>
            <Link to="/drills/new">
                <button type="button" className="btn btn-success m-2">
                    New Drill
                </button>
            </Link>
            <DrillsTable />
        </React.Fragment>
    );
}

function DrillsTable() {
    const [needsDrills, setNeedsDrills] = useState(true);
    const [drills, setDrills] = useState(null);

    useEffect(() => {
        if (!needsDrills) return;
        getAllDrills((data) => {
            setNeedsDrills(false);
            setDrills(data);
        });
    });

    if (!drills) {
        return <p>Loading...</p>;
    }

    if (drills.length === 0) {
        return <p>No drills</p>;
    }

    function handleDeleteDrill(drillId) {
        deleteDrill(drillId, () => {
            setNeedsDrills(true);
        });
    }

    const rows = drills.map((drill, index) => {
        const { id: drillId, name, code, numQuestions, tags } = drill;
        const link = "/drills/" + drillId;
        const editLink = "/drills/edit/" + drillId;
        return (
            <tr key={index}>
                <th>{drillId}</th>
                <td>{name}</td>
                <td>{code}</td>
                <td>{numQuestions}</td>
                <td>
                    <DueDate drill={drill} />
                </td>
                <td>{tags || "None"}</td>
                <td>
                    <Link to={link}>
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                        >
                            View
                        </button>
                    </Link>
                </td>
                <td>
                    <Link to={editLink}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm mx-2"
                        >
                            Edit
                        </button>
                    </Link>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteDrill(drillId)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        );
    });

    return (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Num Questions</th>
                    <th>Due Date</th>
                    <th>Tags</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}
