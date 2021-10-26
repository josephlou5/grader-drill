import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, DueDate } from "app/shared";
import { getAllDrills, importDrills, deleteDrill } from "app/api";
import { TagsView, ImportYAML } from "./shared";

export default function DrillsView() {
    const [{ needsDrills, drills }, setState] = useState({
        needsDrills: true,
    });

    useEffect(() => {
        if (!needsDrills) return;
        getAllDrills().then((drills) => {
            setState({ drills });
        });
    });

    function handleNeedDrills() {
        setState({ needsDrills: true, drills });
    }

    return (
        <React.Fragment>
            <Title title="Drills" />
            <h1>Drills</h1>
            <Link to="/drills/new">
                <button type="button" className="btn btn-success m-2">
                    New Drill
                </button>
            </Link>
            <ImportDrills drills={drills} onNeedDrills={handleNeedDrills} />
            <DrillsTable drills={drills} onNeedDrills={handleNeedDrills} />
        </React.Fragment>
    );
}

const DUE_DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
function ImportDrills({ drills, onNeedDrills }) {
    // `id` is optional (replace existing or new drill)
    // `code` cannot be set by input; either generate new or keep existing
    const fields = [
        ["name", "string"],
        ["numQuestions", "number"],
        ["dueDate", "string"],
    ];
    function extractFields(imported) {
        const drill = {};

        const missing = [];
        const wrongType = [];
        const invalid = [];

        for (const [field, fieldType] of fields) {
            if (imported[field] == null) {
                missing.push(field);
            } else if (typeof imported[field] !== fieldType) {
                wrongType.push(field);
            } else {
                drill[field] = imported[field];
            }
        }
        if (missing.length > 0) {
            const reason =
                "Missing fields " + missing.map((s) => `'${s}'`).join(", ");
            return [true, reason, null];
        }

        // check if `tags` exists and is an array of strings
        if (imported.tags != null) {
            if (!Array.isArray(imported.tags)) {
                wrongType.push("tags");
            } else if (!imported.tags.every((t) => typeof t === "string")) {
                wrongType.push("tags");
            } else {
                drill.tags = imported.tags;
            }
        } else {
            drill.tags = [];
        }
        if (wrongType.length > 0) {
            const reason =
                "Fields " +
                wrongType.map((s) => `'${s}'`).join(", ") +
                " have wrong type";
            return [true, reason, null];
        }

        // check if `numQuestions` is valid
        if (drill.numQuestions <= 0) {
            invalid.push("numQuestions");
        }
        // check if `dueDate` is valid
        if (!DUE_DATE_RE.test(drill.dueDate)) {
            invalid.push("dueDate");
        }
        if (invalid.length > 0) {
            const reason =
                "Invalid values for fields " +
                invalid.map((s) => `'${s}'`).join(", ");
            return [true, reason, null];
        }

        return [false, null, drill];
    }

    return (
        <ImportYAML
            name="Drill"
            extractFields={extractFields}
            existing={drills}
            apiImport={importDrills}
            onRefresh={onNeedDrills}
        />
    );
}

function DrillsTable({ drills, onNeedDrills }) {
    if (!drills) {
        return <p>Loading...</p>;
    }

    if (drills.length === 0) {
        return <p>No drills</p>;
    }

    function handleDeleteDrill(drillId) {
        deleteDrill(drillId).then(() => {
            onNeedDrills();
        });
    }

    const rows = drills.map((drill, index) => {
        const { id: drillId, name, code, numQuestions, tags } = drill;
        const viewLink = "/drills/" + drillId;
        const editLink = "/drills/edit/" + drillId;
        return (
            <tr key={drillId}>
                <th>{index + 1}</th>
                <td>{name}</td>
                <td>{code}</td>
                <td>{numQuestions}</td>
                <td>
                    <DueDate drill={drill} />
                </td>
                <td>
                    <TagsView tags={tags} />
                </td>
                <td>
                    <Link to={viewLink}>
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
                    <th></th>
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
