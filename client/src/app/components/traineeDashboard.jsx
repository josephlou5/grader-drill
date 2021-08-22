import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    useMountEffect,
    Title,
    QuestionType,
    setElementValid,
    resetValid,
} from "../shared";
import {
    getTraineeAnswered,
    addTraineeDrill,
    getDrillByTrainee,
    deleteTraineeDrill,
} from "../api";

export default function TraineeDashboard(props) {
    return (
        <React.Fragment>
            <Title title="Trainee Dashboard" />
            <h1>Trainee Dashboard</h1>
            <Link to="/training">
                <button type="button" className="btn btn-success m-2">
                    Training
                </button>
            </Link>
            <Dashboard {...props} />
        </React.Fragment>
    );
}

function Dashboard() {
    const [answered, setAnswered] = useState(null);
    const [needsDrills, setNeedsDrills] = useState(true);
    const [drills, setDrills] = useState(null);

    useMountEffect(() => {
        getTraineeAnswered((answered) => setAnswered(answered));
    });

    useEffect(() => {
        if (!needsDrills) return;
        getDrillByTrainee((d) => {
            setNeedsDrills(false);
            setDrills(d);
        });
    });

    function handleAddDrill() {
        setNeedsDrills(true);
    }

    function handleRemoveDrill(traineeDrillId) {
        deleteTraineeDrill(traineeDrillId, () => setNeedsDrills(true));
    }

    return (
        <React.Fragment>
            <DrillsTable
                drills={drills}
                onAddDrill={handleAddDrill}
                onRemoveDrill={handleRemoveDrill}
            />
            <AnsweredTable drills={drills} answered={answered} />
        </React.Fragment>
    );
}

function AddDrillInput({ onAddDrill }) {
    const [drillCode, setDrillCode] = useState("");

    function handleDrillCodeChange(text) {
        setDrillCode(text);
    }

    function handleAddDrill() {
        setElementValid("drill-code", true);

        if (drillCode.length === 0) {
            document.getElementById("drill-code-feedback").innerText =
                "Please enter a drill code.";
            setElementValid("drill-code", false);
            return;
        }

        addTraineeDrill(drillCode, (drill) => {
            if (drill.error) {
                const element = document.getElementById("drill-code-feedback");
                if (drill.unique_violation) {
                    element.innerText = "Already in drill.";
                } else {
                    element.innerText = "Invalid drill code.";
                }
                setElementValid("drill-code", false);
                return;
            }
            onAddDrill();
            setDrillCode("");
        });
    }

    return (
        <div
            className="input-group has-validation mb-2"
            style={{ width: "400px" }}
        >
            <input
                type="text"
                id="drill-code"
                className="form-control"
                placeholder="Drill Code"
                value={drillCode}
                onChange={(event) => {
                    resetValid(event.target);
                    handleDrillCodeChange(event.target.value);
                }}
            />
            <button
                type="button"
                className="btn btn-success"
                onClick={handleAddDrill}
            >
                Add Drill
            </button>
            <div className="invalid-feedback" id="drill-code-feedback"></div>
        </div>
    );
}

function DrillNameCode({ name, code }) {
    const [showing, setShowing] = useState(0);
    function handleClick() {
        setShowing(1 - showing);
    }
    return <span onClick={handleClick}>{[name, code][showing]}</span>;
}

function DrillsTable({ drills, onAddDrill, onRemoveDrill }) {
    const [hideCompleted, setHideCompleted] = useState(false);

    function handleToggleHideCompleted() {
        setHideCompleted(!hideCompleted);
    }

    if (!drills) {
        return <p>Getting drills...</p>;
    }

    let rowsShowing = 0;
    const rows = drills.map((traineeDrill, index) => {
        const drill = traineeDrill.Drill;

        let classes = undefined;
        if (hideCompleted && traineeDrill.completedAt) {
            classes = "d-none";
        } else {
            rowsShowing++;
        }

        const removeDrillButton = (
            <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onRemoveDrill(traineeDrill.id)}
            >
                Remove Drill
            </button>
        );

        return (
            <tr key={index} className={classes}>
                <th>{index + 1}</th>
                <td>
                    <DrillNameCode name={drill.name} code={drill.code} />
                </td>
                <td>{drill.dueDate}</td>
                <td>{drill.numQuestions}</td>
                <td>{traineeDrill.progress}</td>
                <td>{traineeDrill.completedDate}</td>
                <td>{!traineeDrill.completedAt && removeDrillButton}</td>
            </tr>
        );
    });

    // could turn this into a toggle button instead of a checkbox
    const hideCompletedToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="hideCompletedDrills"
                checked={hideCompleted}
                onChange={handleToggleHideCompleted}
            />
            <label className="form-check-label" htmlFor="hideCompletedDrills">
                Hide Completed
            </label>
        </div>
    );
    const table = (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Drill</th>
                    <th>Due Date</th>
                    <th>Num Questions</th>
                    <th>Progress</th>
                    <th>Completed</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
    return (
        <div>
            <h2>My Drills</h2>
            {hideCompletedToggle}
            <AddDrillInput onAddDrill={onAddDrill} />
            {table}
            {rowsShowing === 0 && <p>No drills</p>}
        </div>
    );
}

function AnsweredTable({ drills, answered }) {
    const [hideUngraded, setHideUngraded] = useState(false);
    const [filterDrill, setFilterDrill] = useState(null);

    function handleToggleHideUngraded() {
        setHideUngraded(!hideUngraded);
    }

    function handleFilterDrill(drill) {
        if (drill === "None") {
            setFilterDrill(null);
        } else {
            setFilterDrill(parseInt(drill));
        }
    }

    if (!answered) {
        return <p>Loading...</p>;
    }

    let rowsShowing = 0;
    const rows = answered.map((question, index) => {
        const drill = question.TraineeDrill.Drill;

        let classes = undefined;
        if (hideUngraded && !question.graded) {
            classes = "d-none";
        } else if (filterDrill != null && drill.id !== filterDrill) {
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
                <td>{drill.name}</td>
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

    // could turn this into a toggle button instead of a checkbox
    const hideUngradedToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="hideUngradedCheckbox"
                checked={hideUngraded}
                onChange={handleToggleHideUngraded}
            />
            <label className="form-check-label" htmlFor="hideUngradedCheckbox">
                Hide Ungraded
            </label>
        </div>
    );
    const selectDrill = (
        <div className="input-group mb-2" style={{ width: "400px" }}>
            <label className="input-group-text" htmlFor="drill-filter">
                Filter drill
            </label>
            <select
                className="form-select"
                id="drill-filter"
                defaultValue="None"
                onChange={(event) => handleFilterDrill(event.target.value)}
            >
                <option value="None">None</option>
                {drills &&
                    drills.map((traineeDrill, index) => {
                        const drill = traineeDrill.Drill;
                        return (
                            <option key={index} value={drill.id}>
                                {drill.name}
                            </option>
                        );
                    })}
            </select>
        </div>
    );

    const table = (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Drill</th>
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

    return (
        <div>
            <h2>My Answered</h2>
            {hideUngradedToggle}
            {selectDrill}
            {table}
            {rowsShowing === 0 && <p>No answered</p>}
        </div>
    );
}
