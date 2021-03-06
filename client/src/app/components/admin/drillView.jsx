import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title, DueDate } from "app/shared";
import { getDrill } from "app/api";
import { ExportYAML } from "./shared";
import {
    ExpandCollapseAnswered,
    createDrillAnsweredTable,
} from "../protected/DrillAnsweredTable";

export default function DrillView() {
    return (
        <React.Fragment>
            <Title title="Drill" />
            <Drill />
        </React.Fragment>
    );
}

function Drill() {
    const [invalid, setInvalid] = useState(false);
    const [drill, setDrill] = useState(null);

    const { drillId } = useParams();

    useEffect(() => {
        getDrill(drillId).then((d) => {
            if (!d) {
                setInvalid(true);
                return;
            }
            setDrill(d);
        });
    }, [drillId]);

    if (invalid) {
        return (
            <React.Fragment>
                <Title title="Invalid Drill" />
                <h1>Invalid Drill</h1>
            </React.Fragment>
        );
    }

    if (!drill) {
        return (
            <React.Fragment>
                <h1>Drill</h1>
                <p>Getting drill...</p>
            </React.Fragment>
        );
    }

    const { name, code, numQuestions, tags } = drill;
    const link = "/drills/edit/" + drillId;

    return (
        <React.Fragment>
            <h1>Drill</h1>
            <Link to={link}>
                <button type="button" className="btn btn-success">
                    Edit Drill
                </button>
            </Link>
            <ExportDrill drill={drill} />
            <div>Name: {name}</div>
            <div>Code: {code}</div>
            <div>Number Questions: {numQuestions}</div>
            <div>
                Due Date: <DueDate drill={drill} />
            </div>
            <div>Tags: {tags.join(", ") || "None"}</div>
            <TraineeDrillsTable drill={drill} />
        </React.Fragment>
    );
}

function ExportDrill({ drill }) {
    const fields = ["id", "name", "code", "numQuestions", "dueDate", "tags"];
    const filename = `drill${drill.id}.yaml`;
    return <ExportYAML obj={drill} fields={fields} filename={filename} />;
}

function TraineeDrillsTable({ drill }) {
    const drills = drill.TraineeDrills;

    if (drills.length === 0) {
        return (
            <React.Fragment>
                <h2>Trainees in Drill</h2>
                <p>No trainees in this drill</p>
            </React.Fragment>
        );
    }

    const { dueDate } = drill;

    const rows = drills.map((traineeDrill, index) => {
        const {
            id: traineeDrillId,
            completedDate,
            progress,
            Answereds: answered,
        } = traineeDrill;
        const traineeStr = traineeDrill.Trainee.User.username;

        const [drillScore, maxScore, toggleAnsweredButton, answeredTable] =
            createDrillAnsweredTable(traineeDrill, 5, answered, {
                overdueColor: true,
                dueDate,
            });

        return (
            <React.Fragment key={traineeDrillId}>
                <tr>
                    <th>{index + 1}</th>
                    <td>{traineeStr}</td>
                    <td>{progress}</td>
                    <td>{completedDate}</td>
                    <td>
                        {drillScore} / {maxScore}
                    </td>
                    <td>{toggleAnsweredButton}</td>
                </tr>
                {answeredTable}
            </React.Fragment>
        );
    });

    return (
        <React.Fragment>
            <h2>Trainees in Drill</h2>
            <ExpandCollapseAnswered />
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>Trainee</th>
                        <th>Progress</th>
                        <th>Completed</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <div>
                Questions with "View" buttons in red were answered after the due
                date.
            </div>
        </React.Fragment>
    );
}
