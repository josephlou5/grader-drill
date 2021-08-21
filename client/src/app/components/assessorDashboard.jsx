import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, QuestionType } from "../shared";
import { getAllAnswered, getAssessorGraded } from "../api";

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
    const [anonymous, setAnonymous] = useState(true);

    function handleToggleAnonymous() {
        setAnonymous(!anonymous);
    }

    useEffect(() => {
        getAllAnswered((answered) => {
            setAnswered(answered);
        });
    }, []);

    if (!answered) {
        return <p>Getting answered...</p>;
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

    return (
        <React.Fragment>
            <Link to="/grading">
                <button type="button" className="btn btn-success m-2">
                    Grading
                </button>
            </Link>
            <div>{anonymousToggle}</div>

            <GradedTable assessor={assessor} anonymous={anonymous} />
            <AnsweredTable answered={answered} anonymous={anonymous} />
        </React.Fragment>
    );
}

function GradedTable({ assessor, anonymous }) {
    const [graded, setGraded] = useState(null);

    useEffect(() => {
        getAssessorGraded((g) => setGraded(g));
    }, []);

    if (!graded) {
        return <p>Getting graded...</p>;
    }

    const rows = graded.map((question, index) => {
        let traineeStr;
        if (anonymous) {
            traineeStr = "Anonymous";
        } else {
            traineeStr = question.Trainee.User.email;
        }

        const link = "/answered/" + question.id;
        return (
            <tr key={index}>
                <th>{index + 1}</th>
                <td>{traineeStr}</td>
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
            </tr>
        );
    });

    const table = (
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
    );

    return (
        <React.Fragment>
            <h2>My Graded</h2>
            {table}
            {rows.length === 0 && <p>None graded</p>}
        </React.Fragment>
    );
}

function AnsweredTable({ answered, anonymous }) {
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

        let traineeStr;
        if (anonymous) {
            traineeStr = "Anonymous";
        } else {
            traineeStr = question.Trainee.User.email;
        }

        let assessorStr;
        if (!question.graded) {
            assessorStr = "-";
        } else if (question.autograded) {
            assessorStr = "Auto-graded";
        } else if (anonymous) {
            assessorStr = "Graded";
        } else {
            assessorStr = question.Assessor.User.email;
        }

        let score = "-";
        if (question.score != null) {
            score = question.score;
        }

        const link = "/answered/" + question.id;
        return (
            <tr key={index} className={classes}>
                <th>{index + 1}</th>
                <td>{traineeStr}</td>
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

    // could turn this into a toggle button instead of a checkbox
    const hideGradedToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="hideGradedCheckbox"
                checked={hideGraded}
                onChange={handleToggleHideGraded}
            />
            <label className="form-check-label" htmlFor="hideGradedCheckbox">
                Hide Graded
            </label>
        </div>
    );

    return (
        <React.Fragment>
            <h2>All Answered</h2>
            {hideGradedToggle}
            {table}
            {rowsShowing === 0 && <p>No answered</p>}
        </React.Fragment>
    );
}
