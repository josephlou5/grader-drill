import React from "react";
import ReactMarkdown from "react-markdown";
import { TextareaLine, resetValid, resetValidId } from "../shared";

export default function RubricField(props) {
    return (
        <React.Fragment>
            <h1>Rubric</h1>
            <Rubric {...props} />
        </React.Fragment>
    );
}

function Rubric(props) {
    const { rubric, previewMode, editMode, noChange } = props;
    if (previewMode || noChange) {
        return rubric.map((item, index) => (
            <div key={index} className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={noChange && item.checked}
                    disabled={true}
                />
                <ReactMarkdown>{item.text}</ReactMarkdown>
            </div>
        ));
    } else if (editMode) {
        return <EditRubric {...props} />;
    } else {
        return rubric.map((item, index) => {
            const idFor = "item" + index;
            let points = item.points;
            if (points === 0) {
                points = " " + points;
            } else if (points > 0) {
                points = "+" + points;
            }
            return (
                <div key={index} className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id={idFor}
                        checked={item.checked}
                        onChange={() => props.onCheckChange(index)}
                    />
                    <label className="form-check-label" htmlFor={idFor}>
                        <ReactMarkdown>{`\`[${points}]\` ${item.text}`}</ReactMarkdown>
                    </label>
                </div>
            );
        });
    }
}

function EditRubric(props) {
    const { rubric } = props;

    const addButton = (
        <React.Fragment>
            <div>
                <input type="hidden" id="question-edit-rubric" />
                <div className="invalid-feedback">
                    Must have at least one rubric item.
                </div>
            </div>
            <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                    resetValidId("question-edit-rubric");
                    props.onAddRubricItem();
                }}
            >
                Add Rubric Item
            </button>
        </React.Fragment>
    );

    if (rubric.length === 0) {
        return (
            <React.Fragment>
                <p>No rubric items</p>
                {addButton}
            </React.Fragment>
        );
    }

    const items = rubric.map((item, index) => (
        <div key={index} className="row align-items-center g-1 mb-2">
            <div className="col-2">
                <input
                    type="number"
                    className="form-control text-center"
                    id={"question-edit-rubric-points-" + index}
                    value={item.points}
                    onChange={(event) => {
                        resetValid(event.target);
                        props.onChangeRubricItemPoints(
                            index,
                            event.target.value
                        );
                    }}
                />
                <div className="invalid-feedback">Invalid value.</div>
            </div>
            <div className="col-10 align-self-start">
                <div className="row align-items-center g-1">
                    <div className="col">
                        <TextareaLine
                            className="form-control textarea"
                            id={"question-edit-rubric-" + index}
                            placeholder="Explanation"
                            value={item.text}
                            onChange={(event) => {
                                resetValid(event.target);
                                props.onChangeRubricItemText(
                                    index,
                                    event.target.value
                                );
                            }}
                        />
                    </div>
                    <div className="col-auto">
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => props.onDeleteRubricItem(index)}
                        />
                    </div>
                </div>
            </div>
        </div>
    ));

    return (
        <React.Fragment>
            <div className="row g-1 mb-2">
                <div className="col-2">Points</div>
                <div className="col-10">Rubric item</div>
            </div>
            {items}
            {addButton}
        </React.Fragment>
    );
}
