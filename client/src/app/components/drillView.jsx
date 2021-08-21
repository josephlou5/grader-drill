import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title } from "../shared";
import { getDrill } from "../api";

export default function DrillView() {
    const [invalid, setInvalid] = useState(false);
    const [drill, setDrill] = useState(null);

    const { drillId } = useParams();

    useEffect(() => {
        getDrill(drillId, (d) => {
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

    const { name, code, numQuestions, dueDate } = drill;
    return (
        <React.Fragment>
            <Title title="Drill" />
            <h1>Drill</h1>
            <p>Name: {name}</p>
            <p>Code: {code}</p>
            <p>Number Questions: {numQuestions}</p>
            <p>Due Date: {dueDate}</p>
            <TraineeDrillsTable drill={drill} />
        </React.Fragment>
    );
}

function TraineeDrillsTable({ drill }) {
    const drills = drill.TraineeDrills;

    if (drills.length === 0) {
        return <p>No trainees in this drill</p>;
    }

    const rows = drills.map((traineeDrill, index) => {
        const answered = traineeDrill.Answereds;

        let questions;
        if (answered.length === 0) {
            questions = "No questions";
        } else {
            questions = answered.map((q, i) => {
                const link = "/answered/" + q.id;
                return (
                    <Link to={link} key={i}>
                        <button
                            type="button"
                            className="btn btn-success btn-sm me-1"
                        >
                            {i + 1}
                        </button>
                    </Link>
                );
            });
        }

        return (
            <tr key={index}>
                <th>{index + 1}</th>
                <td>{traineeDrill.Trainee.User.email}</td>
                <td>{traineeDrill.progress}</td>
                <td>{traineeDrill.completedDate}</td>
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
                    <th>Questions</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}