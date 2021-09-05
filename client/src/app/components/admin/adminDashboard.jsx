import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, QuestionType } from "app/shared";
import { getAllAnswered, deleteAnswered } from "app/api";

export default function AdminDashboard() {
    return (
        <React.Fragment>
            <Title title="Admin Dashboard" />
            <h1>Admin Dashboard</h1>
            <AnsweredTable />
        </React.Fragment>
    );
}

function AnsweredTable() {
    const [{ needsAnswered, answered }, setState] = useState({
        needsAnswered: true,
    });

    useEffect(() => {
        if (!needsAnswered) return;
        getAllAnswered((answered) => {
            setState({ answered });
        });
    });

    if (!answered) {
        return <p>Getting answered...</p>;
    }

    if (answered.length === 0) {
        return (
            <React.Fragment>
                <h2>All Answered</h2>
                <p>No answered</p>
            </React.Fragment>
        );
    }

    function handleDeleteAnswered(answeredId) {
        deleteAnswered(answeredId, () => {
            setState({ needsAnswered: true, answered });
        });
    }

    const rows = answered.map((question, index) => {
        const answeredId = question.id;

        const traineeStr = question.Trainee.User.username;

        let assessorStr, score;
        if (question.graded) {
            if (question.autograded) {
                assessorStr = "Auto-graded";
            } else {
                assessorStr = question.Assessor.User.username;
            }
            // shouldn't be null because it's graded, but just in case
            score = question.score ?? "N/A";
        } else {
            assessorStr = "-";
            score = "-";
        }

        const link = "/answered/" + answeredId;
        return (
            <tr key={answeredId}>
                <th>{index + 1}</th>
                <td>{traineeStr}</td>
                <td>{question.TraineeDrill.Drill.name}</td>
                <td>{question.questionId}</td>
                <td>
                    <QuestionType
                        questionId={question.questionId}
                        version={question.version}
                    />
                </td>
                <td>{assessorStr}</td>
                <td>{score}</td>
                <td>
                    <Link to={link}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                        >
                            Question
                        </button>
                    </Link>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm ms-1"
                        onClick={() => handleDeleteAnswered(answeredId)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        );
    });

    return (
        <React.Fragment>
            <h2>All Answered</h2>
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>Trainee</th>
                        <th>Drill</th>
                        <th>Question Id</th>
                        <th>Question Type</th>
                        <th>Assessor</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </React.Fragment>
    );
}
