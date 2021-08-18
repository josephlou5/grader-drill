import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, QuestionType, UserEmail } from "../shared";
import { getAllAnswered } from "../api";

export default function AssessorDashboard(props) {
    return (
        <React.Fragment>
            <Title title="Assessor Dashboard" />
            <h1>Assessor Dashboard</h1>
            <Dashboard {...props} />
        </React.Fragment>
    );
}

function Dashboard({ assessor }) {
    const [answered, setAnswered] = useState(null);

    useEffect(() => {
        getAllAnswered((answered) => {
            setAnswered(answered);
        });
    }, []);

    if (!answered) {
        return <p>Getting answered...</p>;
    }

    return (
        <React.Fragment>
            <Link to="/grading">
                <button type="button" className="btn btn-success m-2">
                    Grading
                </button>
            </Link>
            {/* <button type="button" className="btn btn-light m-2">
                Export
            </button> */}

            <GradedTable assessor={assessor} answered={answered} />
            <AnsweredTable assessor={assessor} answered={answered} />
        </React.Fragment>
    );
}

function GradedTable({ assessor, answered }) {
    let index = 0;
    const rows = answered.flatMap((question) => {
        if (!question.graded) return [];
        if (question.assessorId !== assessor.id) return [];

        index++;
        const link = "/answered/" + question.id;
        return [
            <tr key={index}>
                <th>{index}</th>
                <td>
                    <UserEmail userId={question.traineeId} />
                </td>
                <td>{question.questionId}</td>
                <td>
                    <QuestionType
                        questionId={question.questionId}
                        version={question.version}
                    />
                </td>
                <td>{question.score}</td>
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
            </tr>,
        ];
    });

    if (rows.length === 0) {
        return (
            <React.Fragment>
                <h2>My Graded</h2>
                <p>None graded</p>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <h2>My Graded</h2>
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>Trainee</th>
                        <th>Question Id</th>
                        <th>Question Type</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </React.Fragment>
    );
}

function AnsweredTable({ assessor, answered }) {
    const [hideGraded, setHideGraded] = useState(false);

    function handleToggleHideGraded() {
        setHideGraded(!hideGraded);
    }

    let rowsShowing = 0;
    const rows = answered.map((question, index) => {
        let classes = undefined;
        if (question.graded && hideGraded) {
            classes = "d-none";
        } else {
            rowsShowing++;
        }

        let assessorStr;
        if (!question.graded) {
            assessorStr = "-";
        } else if (question.autograded) {
            assessorStr = "Auto-graded";
        } else if (assessor.id === question.assessorId) {
            assessorStr = assessor.email;
        } else {
            assessorStr = <UserEmail userId={question.assessorId} dne={"-"} />;
        }

        let score = "-";
        if (question.score != null) {
            score = question.score;
        }

        const link = "/answered/" + question.id;
        return (
            <tr key={index} className={classes}>
                <th>{index + 1}</th>
                <td>
                    <UserEmail userId={question.traineeId} />
                </td>
                <td>{assessorStr}</td>
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
                    <th>Trainee</th>
                    <th>Assessor</th>
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
            <h2>All Answered</h2>

            {/* could turn this into a toggle button instead of a checkbox */}
            <div className="form-check form-check-inline">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="hideGradedCheckbox"
                    defaultChecked={hideGraded}
                    onChange={handleToggleHideGraded}
                />
                <label
                    className="form-check-label"
                    htmlFor="hideGradedCheckbox"
                >
                    Hide Graded
                </label>
            </div>

            {table}
        </React.Fragment>
    );
}
