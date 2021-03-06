import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import {
    useMountEffect,
    Title,
    ResizeTextareas,
    ButtonHelp,
    setElementValid,
    resetValid,
    resetValidId,
} from "app/shared";
import { EditTags } from "./shared";
import { getDrill, addDrill, updateDrill } from "app/api";

let now;
function updateNow() {
    now = new Date();
    now = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
}
updateNow();
setInterval(updateNow, 1000);

function today() {
    return now.toISOString().slice(0, 10);
}

export default function EditDrillView({ newDrill, drillId }) {
    const initial = {
        name: "",
        numQuestions: 1,
        dueDate: today(),
        tags: [],
    };
    const [drill, setDrillState] = useState(initial);

    function setDrill(updates) {
        setDrillState({ ...drill, ...updates });
    }

    const history = useHistory();

    useMountEffect(() => {
        if (newDrill) return;
        getDrill(drillId).then((d) => {
            if (!d) {
                setDrillState(null);
            } else {
                setDrill(d);
            }
        });
    });

    const title = newDrill ? "New Drill" : "Edit Drill";

    if (!drill) {
        // `title` can only be "Edit Drill"
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>Invalid drill</h1>
            </React.Fragment>
        );
    }

    // need to get drill
    if (!newDrill && drill.id == null) {
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>{title}</h1>
                <p>Getting drill...</p>
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
        setDrill({ dueDate });
    }

    function handleAddTag() {
        setDrill({ tags: [...drill.tags, ""] });
    }

    function handleChangeTag(index, tag) {
        const tags = [...drill.tags];
        tags[index] = tag;
        setDrill({ tags });
    }

    function handleDeleteTag(index) {
        const tags = [...drill.tags];
        tags.splice(index, 1);
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
        // due date must be after today
        setValid("due-date", d.dueDate >= today());

        return formValid;
    }

    function handleSave() {
        resetValidId("save-feedback");
        if (!validate(drill)) return;
        if (drill.id == null) {
            // add the new drill
            addDrill(drill).then((d) => {
                if (!d) {
                    setElementValid("save-feedback", false);
                } else {
                    setDrill({ id: d.id });
                }
            });
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
                        <input
                            type="text"
                            className="form-control"
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
                    <div className="col-2">
                        <div>Due date</div>
                        <div className="small">
                            The drill is due by the end of this day.
                        </div>
                    </div>
                    <div className="col">
                        <input
                            type="date"
                            className="form-control text-center"
                            id="due-date"
                            value={drill.dueDate}
                            // min={today}
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

                <div className="row">
                    <div className="col-2">
                        <div>Tags</div>
                        <div className="small">
                            Questions with any one of these tags will be matched
                            with this drill.
                        </div>
                    </div>
                    <div className="col">
                        <EditTags
                            tags={drill.tags}
                            onAddTag={handleAddTag}
                            onChangeTag={handleChangeTag}
                            onDeleteTag={handleDeleteTag}
                        />
                    </div>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    className="btn btn-danger m-1"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-success m-1"
                    onClick={handleSave}
                >
                    Save
                </button>
                <Link to="/drills">
                    <button type="button" className="btn btn-light m-1">
                        Done
                    </button>
                </Link>
                <div>
                    <input type="hidden" id="save-feedback" />
                    <div className="invalid-feedback">Error while saving.</div>
                </div>
                <ButtonHelp
                    help={[
                        '"Cancel" goes back to the last page without saving.',
                        '"Save" saves the current state of the drill (but doesn\'t go anywhere).',
                        '"Done" redirects back to the Drills page without saving.',
                    ]}
                />
            </div>
        </React.Fragment>
    );
}
