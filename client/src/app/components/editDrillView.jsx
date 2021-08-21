import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import {
    Title,
    ResizeTextareas,
    TextareaLine,
    setElementValid,
    resetValid,
} from "../shared";
import { getDrill, addDrill, updateDrill } from "../api";

export default function EditDrillView({ newDrill, drillId }) {
    const today = new Date().toISOString().slice(0, 10);
    const initial = {
        name: "",
        numQuestions: 1,
        dueDate: today,
        tags: "",
    };

    console.log(newDrill, drillId);

    const [invalid, setInvalid] = useState(false);
    const [drill, setDrillState] = useState(initial);

    function setDrill(updates) {
        setDrillState({ ...drill, ...updates });
    }

    const history = useHistory();

    useEffect(() => {
        if (invalid || newDrill) return;
        if (drill.id != null) return;

        getDrill(drillId, (d) => {
            if (!d) {
                setInvalid(true);
                return;
            }
            setDrill(d);
        });
    });

    const title = newDrill ? "New Drill" : "Edit Drill";

    if (!drill) {
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>{title}</h1>
                <p>Getting drill...</p>
            </React.Fragment>
        );
    }

    if (invalid) {
        // `title` can only be "Edit Drill"
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>Invalid drill</h1>
            </React.Fragment>
        );
    }

    // event handlers

    function handleNameChange(name) {
        setDrill({ name });
    }

    function handleNumQuestionsChange(numQuestions) {
        setDrill({ numQuestions });
    }

    function handleDueDateChange(dueDate) {
        console.log(dueDate, typeof dueDate);
        setDrill({ dueDate });
    }

    function handleTagsChange(tags) {
        setDrill({ tags });
    }

    function handleCancel() {
        history.goBack();
    }

    function validate(d) {
        let formValid = true;

        function setValid(elementId, isValid) {
            setElementValid(elementId, isValid);
            if (!isValid) formValid = false;
        }

        setValid("drill-name", d.name.length > 0);
        setValid("num-questions", d.numQuestions > 0);
        // use string comparison in yyyy-mm-dd format
        // time zones makes the comparison not work for same day
        setValid("due-date", today <= d.dueDate);

        return formValid;
    }

    function handleSave() {
        if (!validate(drill)) return;
        if (drill.id == null) {
            // add the new drill
            addDrill(drill, (d) => setDrill({ id: d.id }));
        } else {
            // update the drill
            updateDrill(drill);
        }
    }

    return (
        <React.Fragment>
            <Title title={title} />
            <ResizeTextareas />

            <h1>{title}</h1>

            <div className="container-fluid">
                <div className="row align-items-center mb-2">
                    <div className="col-2">Name</div>
                    <div className="col">
                        <TextareaLine
                            className="form-control textarea"
                            id="drill-name"
                            value={drill.name}
                            onChange={(event) => {
                                resetValid(event.target);
                                handleNameChange(event.target.value);
                            }}
                        />
                        <div className="invalid-feedback">
                            Must have a name.
                        </div>
                    </div>
                </div>

                <div className="row align-items-center mb-2">
                    <div className="col-2">Number of questions</div>
                    <div className="col">
                        <input
                            type="number"
                            className="form-control text-center"
                            id="num-questions"
                            value={drill.numQuestions}
                            min={1}
                            onChange={(event) => {
                                resetValid(event.target);
                                handleNumQuestionsChange(event.target.value);
                            }}
                        />
                        <div className="invalid-feedback">
                            Number of questions must be a positive integer.
                        </div>
                    </div>
                </div>

                <div className="row align-items-center mb-2">
                    <div className="col-2">Due date</div>
                    <div className="col">
                        <input
                            type="date"
                            className="form-control text-center"
                            id="due-date"
                            value={drill.dueDate}
                            min={today}
                            onChange={(event) => {
                                resetValid(event.target);
                                handleDueDateChange(event.target.value);
                            }}
                        />
                        <div className="invalid-feedback">
                            Due date must be after today.
                        </div>
                    </div>
                </div>

                <div className="row align-items-center">
                    <div className="col-2">Tags</div>
                    <div className="col">
                        <TextareaLine
                            className="form-control textarea"
                            placeholder='E.g., "difficulty:hard"'
                            value={drill.tags}
                            onChange={(event) =>
                                handleTagsChange(event.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    className="btn btn-danger m-2"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-success m-2"
                    onClick={handleSave}
                >
                    Save
                </button>
                <Link to="/drills">
                    <button type="button" className="btn btn-light m-2">
                        Done
                    </button>
                </Link>
            </div>
        </React.Fragment>
    );
}
