import React from "react";
import ReactMarkdown from "react-markdown";
import { TextareaLine, resetValid, resetValidId } from "app/shared";

export default function RubricField(props) {
    let rubric;
    if (props.editMode) {
        rubric = <EditRubric {...props} />;
    } else {
        rubric = <Rubric {...props} />;
    }
    return (
        <React.Fragment>
            <h1>Rubric</h1>
            {rubric}
        </React.Fragment>
    );
}

function formatPoints(points) {
    if (points === 0) {
        return " " + points;
    } else if (points > 0) {
        return "+" + points;
    } else {
        return "" + points;
    }
}

function Rubric({ rubric, checked, previewMode, noChange, onCheckChange }) {
    if (previewMode || noChange) {
        // answered view or preview on edit/view question
        return rubric.map((item, index) => {
            let text = item.text;
            if (previewMode) {
                // include the point values
                text = `\`[${formatPoints(item.points)}]\` ${text}`;
            }
            return (
                <div key={index} className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={noChange && checked[index]}
                        disabled={true}
                    />
                    <ReactMarkdown>{text}</ReactMarkdown>
                </div>
            );
        });
    } else {
        // grading
        return rubric.map((item, index) => {
            const idFor = "item" + index;
            const text = `\`[${formatPoints(item.points)}]\` ${item.text}`;
            return (
                <div key={index} className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id={idFor}
                        checked={checked[index]}
                        onChange={() => onCheckChange(index)}
                    />
                    <label className="form-check-label" htmlFor={idFor}>
                        <ReactMarkdown>{text}</ReactMarkdown>
                    </label>
                </div>
            );
        });
    }
}

function EditRubric({
    rubric,
    onAddRubricItem,
    onChangeRubricItemPoints,
    onChangeRubricItemText,
    onDeleteRubricItem,
}) {
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
                    onAddRubricItem();
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
                        const points = event.target.value;
                        onChangeRubricItemPoints(index, points);
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
                                const text = event.target.value;
                                onChangeRubricItemText(index, text);
                            }}
                        />
                    </div>
                    <div className="col-auto">
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => onDeleteRubricItem(index)}
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
