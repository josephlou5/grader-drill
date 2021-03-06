import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, DueDate } from "app/shared";
import { getAllDrills, importDrills, deleteDrill } from "app/api";
import { TagsView, ImportYAML } from "./shared";

export default function DrillsView() {
    return (
        <React.Fragment>
            <Title title="Drills" />
            <h1>Drills</h1>
            <div>
                This is the drills view. You can create, view, import, export,
                and edit drills.
            </div>
            <Link to="/drills/new">
                <button type="button" className="btn btn-success my-2">
                    New Drill
                </button>
            </Link>
            <Drills />
        </React.Fragment>
    );
}

function Drills() {
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

    function sameDrill(drill1, drill2) {
        if (drill1.name !== drill2.name) return false;
        if (drill1.numQuestions !== drill2.numQuestions) return false;
        if (drill1.dueDate !== drill2.dueDate) return false;
        // tags
        const tags1 = drill1.tags || [];
        const tags2 = drill2.tags || [];
        if (new Set(tags1).size !== new Set(tags1.concat(tags2)).size)
            return false;
        return true;
    }

    function checkExists(imported, drill) {
        const nullId = imported.id == null;
        for (const d of drills) {
            // if imported matches existing
            if (sameDrill(d, drill)) {
                return [true, d.id];
            }
            if (nullId) continue;
            // if imported id exists, update
            if (d.id === imported.id) {
                return [true, null];
            }
        }
        return [false, null];
    }

    return (
        <React.Fragment>
            <h2>Import Drills</h2>
            <ImportYAML
                name="Drill"
                extractFields={extractFields}
                checkExists={checkExists}
                apiImport={importDrills}
                onRefresh={onNeedDrills}
            />
            <div>
                You can import drills with the above button. Only YAML files are
                accepted, and only files with valid fields will be imported.
                (Export a drill to see which fields are required.) If a file's
                contents are detected to be a duplicate of an existing drill, it
                will not be imported. If a valid drill id is given in a file, it
                will update that drill. If no drill id is provided or the drill
                id does not exist, then a new drill will be created.
            </div>
        </React.Fragment>
    );
}

function DrillsTable({ drills, onNeedDrills }) {
    if (!drills) {
        return (
            <React.Fragment>
                <h2>All Drills</h2>
                <p>Getting drills...</p>
            </React.Fragment>
        );
    }

    if (drills.length === 0) {
        return (
            <React.Fragment>
                <h2>All Drills</h2>
                <p>No drills</p>
            </React.Fragment>
        );
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

    const table = (
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

    return (
        <React.Fragment>
            <h2>All Drills</h2>
            {table}
        </React.Fragment>
    );
}
