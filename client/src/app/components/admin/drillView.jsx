import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title, DueDate } from "app/shared";
import { getDrill } from "app/api";
import { ExportYAML } from "./shared";

// milliseconds in one day
const MS_ONE_DAY = 24 * 60 * 60 * 1000;

export default function DrillView() {
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
                <Title title="Drill" />
                <h1>Drill</h1>
                <p>Getting drill...</p>
            </React.Fragment>
        );
    }

    const { name, code, numQuestions, tags } = drill;
    const link = "/drills/edit/" + drillId;
    return (
        <React.Fragment>
            <Title title="Drill" />
            <h1>Drill</h1>
            <div>Name: {name}</div>
            <div>Code: {code}</div>
            <div>Number Questions: {numQuestions}</div>
            <div>
                Due Date: <DueDate drill={drill} />
            </div>
            <div>Tags: {tags.join(", ") || "None"}</div>
            <Link to={link}>
                <button type="button" className="btn btn-success">
                    Edit Drill
                </button>
            </Link>
            <ExportDrill drill={drill} />
            <TraineeDrillsTable drill={drill} />
            {drill.TraineeDrills.length > 0 && (
                <div>
                    Questions with buttons in red were answered after the due
                    date.
                </div>
            )}
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
        return <p>No trainees in this drill</p>;
    }

    const rows = drills.map((traineeDrill, index) => {
        const answered = traineeDrill.Answereds;

        let drillScore = 0;
        let maxScore = 0;

        let questions;
        if (answered.length === 0) {
            questions = "No questions";
        } else {
            questions = answered.map((question, i) => {
                if (question.graded) {
                    drillScore += question.score;
                    maxScore += question.maxPoints;
                }

                const answeredId = question.id;
                const classes = ["btn"];
                if (
                    Date.parse(question.createdAt) <
                    Date.parse(drill.dueDate) + MS_ONE_DAY
                ) {
                    // if question was answered after due date, use red button
                    classes.push("btn-success");
                } else {
                    classes.push("btn-danger");
                }
                classes.push("btn-sm", "me-1");
                const link = "/answered/" + answeredId;
                return (
                    <Link to={link} key={answeredId}>
                        <button type="button" className={classes.join(" ")}>
                            {i + 1}
                        </button>
                    </Link>
                );
            });
        }

        return (
            <tr key={traineeDrill.id}>
                <th>{index + 1}</th>
                <td>{traineeDrill.Trainee.User.username}</td>
                <td>{traineeDrill.progress}</td>
                <td>{traineeDrill.completedDate}</td>
                <td>
                    {drillScore} / {maxScore}
                </td>
                <td>{questions}</td>
            </tr>
        );
    });

    return (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Trainee</th>
                    <th>Progress</th>
                    <th>Completed</th>
                    <th>Score</th>
                    <th>Questions</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}
