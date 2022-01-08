import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    useMountEffect,
    Title,
    DueDate,
    setElementValid,
    resetValid,
} from "app/shared";
import {
    getTraineeAnswered,
    addTraineeDrill,
    getDrillsByTrainee,
    deleteTraineeDrill,
} from "app/api";
import {
    ExpandCollapseAnswered,
    createDrillAnsweredTable,
} from "../protected/DrillAnsweredTable";

export default function TraineeDashboard(props) {
    return (
        <React.Fragment>
            <Title title="Trainee Dashboard" />
            <h1>Trainee Dashboard</h1>
            <Dashboard {...props} />
        </React.Fragment>
    );
}

function Dashboard() {
    const [answered, setAnswered] = useState(null);
    // const [needsDrills, setNeedsDrills] = useState(true);
    // const [drills, setDrills] = useState(null);
    const [{ needsDrills, drills }, setDrillsState] = useState({
        needsDrills: true,
    });

    useMountEffect(() => {
        getTraineeAnswered().then((answered) => {
            const byDrill = {};
            answered.forEach((question) => {
                const traineeDrillId = question.TraineeDrill.id;
                if (byDrill[traineeDrillId] == null) {
                    byDrill[traineeDrillId] = [question];
                } else {
                    byDrill[traineeDrillId].push(question);
                }
            });
            setAnswered(byDrill);
        });
    });

    useEffect(() => {
        if (!needsDrills) return;
        getDrillsByTrainee().then((drills) => {
            // setNeedsDrills(false);
            // setDrills(d);
            setDrillsState({ drills });
        });
    });

    function handleAddDrill() {
        // setNeedsDrills(true);
        setDrillsState({
            needsDrills: true,
            drills,
        });
    }

    function handleRemoveDrill(traineeDrillId) {
        deleteTraineeDrill(traineeDrillId).then(() => {
            // setNeedsDrills(true);
            setDrillsState({
                needsDrills: true,
                drills,
            });
        });
    }

    return (
        <DrillsTable
            drills={drills}
            answered={answered}
            onAddDrill={handleAddDrill}
            onRemoveDrill={handleRemoveDrill}
        />
    );
}

function AddDrillInput({ onAddDrill }) {
    const [drillCode, setDrillCode] = useState("");

    function handleDrillCodeChange(text) {
        setDrillCode(text);
    }

    function handleAddDrill() {
        setElementValid("drill-code", true);
        const feedback = document.getElementById("drill-code-feedback");

        if (drillCode.length === 0) {
            feedback.innerHTML = "Please enter a drill code.";
            setElementValid("drill-code", false);
            return;
        }

        addTraineeDrill(drillCode).then((drill) => {
            if (drill.error) {
                if (drill.uniqueViolation) {
                    feedback.innerHTML = "Already in drill.";
                } else {
                    feedback.innerHTML = "Invalid drill code.";
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

function DrillNameCode({ drill: { name, code } }) {
    const [showing, setShowing] = useState(0);
    function handleClick() {
        setShowing(1 - showing);
    }
    return <span onClick={handleClick}>{[name, code][showing]}</span>;
}

function DrillsTable({ drills, answered, onAddDrill, onRemoveDrill }) {
    const [hideCompleted, setHideCompleted] = useState(false);
    const [hideOverdue, setHideOverdue] = useState(false);

    function handleToggleHideCompleted() {
        setHideCompleted(!hideCompleted);
    }

    function handleToggleHideOverdue() {
        setHideOverdue(!hideOverdue);
    }

    if (!drills) {
        return <p>Getting drills...</p>;
    }

    let rowsShowing = 0;
    const rows = drills.map((traineeDrill, index) => {
        const {
            id: traineeDrillId,
            completedAt,
            completedDate,
            progress,
        } = traineeDrill;
        const drill = traineeDrill.Drill;
        const { expired } = drill;

        let classes = undefined;
        let hiding = false;
        if ((hideCompleted && completedAt) || (hideOverdue && expired)) {
            classes = "d-none";
            hiding = true;
        } else {
            rowsShowing++;
        }

        let trainButton;
        if (completedAt) {
            // train button should be disabled
            trainButton = (
                <button
                    type="button"
                    className="btn btn-success btn-sm me-2"
                    disabled={true}
                >
                    Train
                </button>
            );
        } else {
            // train button links to drill
            trainButton = (
                <Link to={"/training/drill/" + drill.id}>
                    <button
                        type="button"
                        className="btn btn-success btn-sm me-2"
                    >
                        Train
                    </button>
                </Link>
            );
        }

        let drillScore = 0;
        let maxScore = 0;
        let toggleAnsweredButton = null;
        let answeredTable = null;
        if (!hiding && progress > 0 && answered && answered[traineeDrillId]) {
            [drillScore, maxScore, toggleAnsweredButton, answeredTable] =
                createDrillAnsweredTable(
                    traineeDrill,
                    7,
                    answered[traineeDrillId]
                );
        }

        return (
            <React.Fragment key={traineeDrillId}>
                <tr className={classes}>
                    <th>{index + 1}</th>
                    <td>
                        <DrillNameCode drill={drill} />
                    </td>
                    <td>
                        <DueDate drill={drill} completedAt={completedAt} />
                    </td>
                    <td>
                        {progress} / {drill.numQuestions}
                    </td>
                    <td>{completedDate}</td>
                    <td>
                        {drillScore} / {maxScore}
                    </td>
                    <td>{toggleAnsweredButton}</td>
                    <td>
                        {trainButton}
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => onRemoveDrill(traineeDrillId)}
                        >
                            Remove Drill
                        </button>
                    </td>
                </tr>
                {answeredTable}
            </React.Fragment>
        );
    });

    const table = (
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th></th>
                    <th>Drill</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                    <th>Completed</th>
                    <th>Score</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );

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

    // could turn this into a toggle button instead of a checkbox
    const hideOverdueToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="hideOverdueDrills"
                checked={hideOverdue}
                onChange={handleToggleHideOverdue}
            />
            <label className="form-check-label" htmlFor="hideOverdueDrills">
                Hide Overdue
            </label>
        </div>
    );

    return (
        <div>
            <h2>My Drills</h2>
            <div>
                You can join a new drill and see and remove the drills you are
                in.
            </div>
            {hideCompletedToggle}
            {hideOverdueToggle}
            <AddDrillInput onAddDrill={onAddDrill} />
            <ExpandCollapseAnswered />
            {table}
            {rowsShowing === 0 && <p>No drills</p>}
        </div>
    );
}
