import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMountEffect, Title, QuestionType } from "app/shared";
import { getAssessorGraded } from "app/api";

export default function AssessorDashboard(props) {
    return (
        <React.Fragment>
            <Title title="Assessor Dashboard" />
            <h1>Assessor Dashboard</h1>
            <div>
                This is the Assessor dashboard. You can view the questions that
                you have graded, and potentially regrade any if you need to.
            </div>
            <GradedTable />
        </React.Fragment>
    );
}

function GradedTable() {
    const [anonymous, setAnonymous] = useState(true);
    const [graded, setGraded] = useState(null);

    function handleToggleAnonymous() {
        setAnonymous(!anonymous);
    }

    useMountEffect(() => {
        getAssessorGraded().then((graded) => {
            setGraded(graded);
        });
    });

    if (!graded) {
        return (
            <React.Fragment>
                <h2>My Graded</h2>
                <p>Getting graded...</p>
            </React.Fragment>
        );
    }

    if (graded.length === 0) {
        return (
            <React.Fragment>
                <h2>My Graded</h2>
                <p>No graded</p>
            </React.Fragment>
        );
    }

    // could turn this into a toggle button instead of a checkbox
    const anonymousToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="anonymousCheckbox"
                checked={anonymous}
                onChange={handleToggleAnonymous}
            />
            <label className="form-check-label" htmlFor="anonymousCheckbox">
                Anonymous
            </label>
        </div>
    );

    const rows = graded.map((question, index) => {
        const answeredId = question.id;

        let traineeStr;
        if (anonymous) {
            traineeStr = "Anonymous";
        } else {
            traineeStr = question.Trainee.User.username;
        }

        const drillName = question.TraineeDrill.Drill.name;

        const regradeLink = "/grading/" + answeredId;
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
                <td>
                    {question.score} / {question.maxPoints}
                </td>
                <td>
                    <Link to={regradeLink}>
                        <button
                            type="button"
                            className="btn btn-success btn-sm me-2"
                        >
                            Regrade
                        </button>
                    </Link>
                    <Link to={link}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                        >
                            View
                        </button>
                    </Link>
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
                    <th>Score</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );

    return (
        <React.Fragment>
            <h2>My Graded</h2>
            <div>{anonymousToggle}</div>
            {table}
        </React.Fragment>
    );
}
