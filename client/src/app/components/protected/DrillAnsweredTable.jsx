import React from "react";
import { Link } from "react-router-dom";
import { QuestionType } from "app/shared";

// milliseconds in one day
const MS_ONE_DAY = 24 * 60 * 60 * 1000;

const ANSWERED_TABLE_CLASS = "drill-answered-table";
const TOGGLE_BUTTON_CLASS = "toggle-answered-button";

// component for expanding / collapsing all answered tables
export function ExpandCollapseAnswered() {
    function handleToggleAll(collapse) {
        const rows = document.getElementsByClassName(ANSWERED_TABLE_CLASS);
        for (const element of rows) {
            element.classList.toggle("d-none", collapse);
        }
        // update all buttons
        const text = (collapse ? "View" : "Hide") + " Answered";
        const buttons = document.getElementsByClassName(TOGGLE_BUTTON_CLASS);
        for (const element of buttons) {
            element.innerHTML = text;
        }
    }

    return (
        <div className="my-2">
            <button
                type="button"
                className="btn btn-primary me-1"
                onClick={() => handleToggleAll(false)}
            >
                Expand All Answered
            </button>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleToggleAll(true)}
            >
                Collapse All Answered
            </button>
        </div>
    );
}

// generate answered question table for trainee drill
export function createDrillAnsweredTable(
    traineeDrill,
    colSpan,
    answered,
    options = {}
) {
    const { overdueColor = false, dueDate = null } = options;

    if (overdueColor && !dueDate) {
        throw new Error("drill answered table needs drill due date");
    }

    if (answered.length === 0) {
        return [0, 0, null, null];
    }

    const rowId = "drill-" + traineeDrill.id + "-answered";

    function handleToggleShow(event) {
        // toggle row and update button text
        const classList = document.getElementById(rowId).classList;
        if (classList.contains("d-none")) {
            classList.remove("d-none");
            event.target.innerHTML = "Hide Answered";
        } else {
            classList.add("d-none");
            event.target.innerHTML = "View Answered";
        }
    }

    const toggleAnsweredButton = (
        <button
            type="button"
            className={"btn btn-primary btn-sm " + TOGGLE_BUTTON_CLASS}
            onClick={handleToggleShow}
        >
            View Answered
        </button>
    );

    let drillScore = 0;
    let maxScore = 0;

    const answeredRows = answered.map((question, index) => {
        const answeredId = question.id;

        let isGraded = "-";
        if (question.autograded) {
            isGraded = "Auto-graded";
        } else if (question.graded) {
            isGraded = "Graded";
        }

        const questionScore = question.maxPoints;

        let score = "-";
        if (question.graded) {
            score = question.score;
            drillScore += score;
            maxScore += questionScore;
        }

        const link = "/answered/" + answeredId;
        const classes = ["btn"];
        if (
            !overdueColor ||
            Date.parse(question.createdAt) < Date.parse(dueDate) + MS_ONE_DAY
        ) {
            classes.push("btn-primary");
        } else {
            // if question was answered after due date, use red button
            classes.push("btn-danger");
        }
        classes.push("btn-sm");

        return (
            <tr key={answeredId}>
                <th>{index + 1}</th>
                <td>{isGraded}</td>
                <td>{question.questionId}</td>
                <td>
                    <QuestionType
                        questionId={question.questionId}
                        version={question.version}
                    />
                </td>
                <td>
                    {score} / {questionScore}
                </td>
                <td>
                    <Link to={link}>
                        <button type="button" className={classes.join(" ")}>
                            View
                        </button>
                    </Link>
                </td>
            </tr>
        );
    });
    const classes = [ANSWERED_TABLE_CLASS, "d-none"];
    const answeredTable = (
        <tr id={rowId} className={classes.join(" ")}>
            <td></td>
            <td colSpan={colSpan}>
                <table className="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Graded</th>
                            <th>Question Id</th>
                            <th>Question Type</th>
                            <th>Score</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{answeredRows}</tbody>
                </table>
            </td>
        </tr>
    );

    return [drillScore, maxScore, toggleAnsweredButton, answeredTable];
}
