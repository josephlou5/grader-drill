import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, QuestionType } from "app/shared";
import { getAllAnswered, deleteAnswered } from "app/api";

export default function AdminDashboard() {
    return (
        <React.Fragment>
            <Title title="Admin Dashboard" />
            <h1>Admin Dashboard</h1>
            <div>
                This is the Admin dashboard. You can find all the answered
                questions, view them, and delete them. Each question displays
                its corresponding Trainee, drill, question, and Assessor and
                score if it has been graded.
            </div>
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
        getAllAnswered().then((answered) => {
            setState({ answered });
        });
    });

    if (!answered) {
        return (
            <React.Fragment>
                <h2>All Answered</h2>
                <p>Getting answered...</p>
            </React.Fragment>
        );
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
        deleteAnswered(answeredId).then(() => {
            setState({ needsAnswered: true, answered });
        });
    }

    const rows = answered.map((question, index) => {
        const answeredId = question.id;

        const traineeStr = question.Trainee.User.username;
        const drillName = question.TraineeDrill.Drill.name;

        let assessorStr, score;
        if (question.graded) {
            if (question.autograded) {
                assessorStr = "Auto-graded";
            } else {
                assessorStr = question.Assessor.User.username;
            }
            score = question.score;
        } else {
            assessorStr = "-";
            score = "-";
        }

        const link = "/answered/" + answeredId;
        return (
            <tr key={answeredId}>
                <th>{index + 1}</th>
                <td>{traineeStr}</td>
                <td>{drillName}</td>
                <td>{question.questionId}</td>
                <td>
                    <QuestionType
                        questionId={question.questionId}
                        version={question.version}
                    />
                </td>
                <td>{assessorStr}</td>
                <td>
                    {score} / {question.maxPoints}
                </td>
                <td>
                    <Link to={link}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                        >
                            View
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

    const table = (
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
    );

    return (
        <React.Fragment>
            <h2>All Answered</h2>
            {table}
        </React.Fragment>
    );
}
