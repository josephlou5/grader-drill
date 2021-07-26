import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import { preventEnter, resetValidId } from "../shared";

class RubricField extends Component {
    renderEditMode = () => {
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
                        this.props.onAddRubricItem();
                    }}
                >
                    Add Rubric Item
                </button>
            </React.Fragment>
        );

        if (this.props.question.rubric.length === 0) {
            return (
                <React.Fragment>
                    <p>No rubric items</p>
                    {addButton}
                </React.Fragment>
            );
        }
        return (
            <React.Fragment>
                <div className="row g-1 mb-2">
                    <div className="col-2">Points</div>
                    <div className="col-10">Rubric item</div>
                </div>
                {this.props.question.rubric.map((item, index) => (
                    <div
                        key={index}
                        className="row align-items-center g-1 mb-2"
                    >
                        <div className="col-2">
                            <input
                                type="number"
                                className="form-control text-center"
                                id={"question-edit-rubric-points-" + index}
                                value={item.points}
                                onChange={(event) => {
                                    event.target.classList.remove("is-invalid");
                                    this.props.onChangeRubricItemPoints(
                                        index,
                                        event.target.value
                                    );
                                }}
                            />
                            <div className="invalid-feedback">
                                Invalid value.
                            </div>
                        </div>
                        <div className="col-10 align-self-start">
                            <div className="row align-items-center g-1">
                                <div className="col">
                                    <textarea
                                        className="form-control textarea"
                                        id={"question-edit-rubric-" + index}
                                        value={item.text}
                                        onKeyDown={preventEnter}
                                        onChange={(event) => {
                                            event.target.classList.remove(
                                                "is-invalid"
                                            );
                                            this.props.onChangeRubricItemText(
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
                                        onClick={() =>
                                            this.props.onDeleteRubricItem(index)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {addButton}
            </React.Fragment>
        );
    };

    renderField = () => {
        if (this.props.previewMode) {
            return this.props.question.rubric.map((item, index) => (
                <div key={index} className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        disabled={true}
                    />
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                </div>
            ));
        } else if (this.props.editMode) {
            return this.renderEditMode();
        } else if (this.props.noChange) {
            return this.props.question.rubric.map((item, index) => (
                <div key={index} className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.checked}
                        disabled={true}
                    />
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                </div>
            ));
        } else {
            return this.props.rubric.map((item, index) => {
                const idFor = "item" + index;

                let inputProps = {
                    type: "checkbox",
                    className: "form-check-input",
                    id: idFor,
                    checked: item.checked,
                    onChange: () => this.props.onCheckChange(index),
                };
                return (
                    <div key={index} className="form-check">
                        <input {...inputProps} />
                        <label className="form-check-label" htmlFor={idFor}>
                            <ReactMarkdown>{item.text}</ReactMarkdown>
                        </label>
                    </div>
                );
            });
        }
    };

    render() {
        return (
            <React.Fragment>
                <h1>Rubric</h1>
                {this.renderField()}
            </React.Fragment>
        );
    }
}

export default RubricField;
