import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, QuestionType } from "../shared";
import { getTraineeAnswered } from "../api";

export default function TraineeDashboard({ trainee }) {
    const [answered, setAnswered] = useState(null);

    useEffect(() => {
        getTraineeAnswered(trainee.id, (answered) => {
            setAnswered(answered);
        });
    }, [trainee.id]);

    let table = <p>Loading...</p>;
    if (answered) {
        table = <AnsweredTable answered={answered} />;
    }

    return (
        <React.Fragment>
            <Title title="Trainee Dashboard" />
            <h1>Trainee Dashboard</h1>
            <Link to="/training">
                <button type="button" className="btn btn-success m-2">
                    Training
                </button>
            </Link>
            {table}
        </React.Fragment>
    );
}

function AnsweredTable({ answered }) {
    const [hideUngraded, setHideUngraded] = useState(false);

    function handleToggleHideUngraded() {
        setHideUngraded(!hideUngraded);
    }

    let rowsShowing = 0;
    const rows = answered.map((question, index) => {
        let classes = undefined;
        if (!question.graded && hideUngraded) {
            classes = "d-none";
        } else {
            rowsShowing++;
        }

        let isGraded = "-";
        if (question.autograded) {
            isGraded = "Auto-graded";
        } else if (question.graded) {
            isGraded = "Graded";
        }

        let score = "-";
        if (question.score != null) {
            score = question.score;
        }

        const link = "/answered/" + question.id;
        return (
            <tr key={index} className={classes}>
                <th>{index + 1}</th>
                <td>{isGraded}</td>
                <td>{question.questionId}</td>
                <td>
                    <QuestionType
                        questionId={question.questionId}
                        version={question.version}
                    />
                </td>
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
                </td>
            </tr>
        );
    });

    let table = (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Graded</th>
                    <th>Question Id</th>
                    <th>Question Type</th>
                    <th>Score</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
    if (rowsShowing === 0) {
        table = (
            <React.Fragment>
                {table}
                <p>No answered</p>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <h2>My Answered</h2>

            {/* could turn this into a toggle button instead of a checkbox */}
            <div className="form-check form-check-inline">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="hideUngradedCheckbox"
                    defaultChecked={hideUngraded}
                    onChange={handleToggleHideUngraded}
                />
                <label
                    className="form-check-label"
                    htmlFor="hideUngradedCheckbox"
                >
                    Hide Ungraded
                </label>
            </div>

            {table}
        </React.Fragment>
    );
}
