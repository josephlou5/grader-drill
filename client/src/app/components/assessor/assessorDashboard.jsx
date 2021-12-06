import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMountEffect, Title, QuestionType } from "app/shared";
import { getAllAnswered, getAssessorGraded } from "app/api";

export default function AssessorDashboard(props) {
    return (
        <React.Fragment>
            <Title title="Assessor Dashboard" />
            <h1>Assessor Dashboard</h1>
            <div>
                This is the Assessor dashboard. You can view the questions that
                you have graded, and potentially regrade any if you need to.
            </div>
            <Dashboard {...props} />
        </React.Fragment>
    );
}

function Dashboard() {
    const [answered, setAnswered] = useState(null);
    const [anonymous, setAnonymous] = useState(true);

    function handleToggleAnonymous() {
        setAnonymous(!anonymous);
    }

    useMountEffect(() => {
        getAllAnswered().then((answered) => {
            setAnswered(answered);
        });
    });

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
            <div>{anonymousToggle}</div>
            <GradedTable anonymous={anonymous} />
            {/* <AnsweredTable answered={answered} anonymous={anonymous} /> */}
        </React.Fragment>
    );
}

function GradedTable({ anonymous }) {
    const [graded, setGraded] = useState(null);

    useMountEffect(() => {
        getAssessorGraded().then((graded) => {
            setGraded(graded);
        });
    });

    if (!graded) {
        return <p>Getting graded...</p>;
    }

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
                <td>{question.score}</td>
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
        const answeredId = question.id;

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
            traineeStr = question.Trainee.User.username;
        }

        const drillName = question.TraineeDrill.Drill.name;

        let assessorStr, score;
        if (question.graded) {
            if (question.autograded) {
                assessorStr = "Auto-graded";
            } else if (anonymous) {
                assessorStr = "Graded";
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
            <tr key={answeredId} className={classes}>
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
