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
                {this.props.question.rubric.map((item, index) => {
                    // return (
                    //     <div key={index} className="input-group mb-2">
                    //         {/* <div className="input-group-text p-0 bg-transparent w-25">
                    //             <input
                    //                 type="number"
                    //                 className="form-control text-center"
                    //                 value={item.points}
                    //                 onChange={(event) => this.props.onChangeRubricItemPoints(index, event.target.value)}
                    //             />
                    //         </div> */}
                    //         <span className="input-group-text">Points</span>
                    //         <input
                    //             type="number"
                    //             className="form-control text-center flex-grow-0"
                    //             value={item.points}
                    //             onChange={(event) => this.props.onChangeRubricItemPoints(index, event.target.value)}
                    //         />
                    //         <span className="input-group-text">Rubric item</span>
                    //         <textarea
                    //             className="form-control textarea"
                    //             placeholder="Rubric item"
                    //             value={item.text}
                    //             onKeyDown={preventEnter}
                    //             onChange={(event) => this.props.onChangeRubricItemText(index, event.target.value)}
                    //         />
                    //         <div className="input-group-text bg-danger">
                    //             <button
                    //                 type="button"
                    //                 className="btn-close btn-close-white"
                    //                 onClick={() => this.props.onDeleteRubricItem(index)}
                    //             />
                    //         </div>
                    //     </div>
                    // );
                    return (
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
                                        event.target.classList.remove(
                                            "is-invalid"
                                        );
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
                                                this.props.onDeleteRubricItem(
                                                    index
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                    // return (
                    //     <div key={index} className="input-group has-validation mb-2">
                    //         <div className="input-group-text p-0 bg-transparent border-0">
                    //             <input
                    //                 type="number"
                    //                 className="form-control text-center h-100"
                    //                 style={{borderRadius: "0.25rem 0 0 0.25rem"}}
                    //                 id={"question-edit-rubric-points-" + index}
                    //                 value={item.points}
                    //                 onChange={(event) => this.props.onChangeRubricItemPoints(index, event.target.value)}
                    //             />
                    //         </div>
                    //         {/* <input
                    //             type="number"
                    //             className="form-control text-center"
                    //             id={"question-edit-rubric-points-" + index}
                    //             value={item.points}
                    //             onChange={(event) => this.props.onChangeRubricItemPoints(index, event.target.value)}
                    //         /> */}
                    //         <textarea
                    //             className="form-control textarea"
                    //             id={"question-edit-rubric-" + index}
                    //             value={item.text}
                    //             onKeyDown={preventEnter}
                    //             onChange={(event) => this.props.onChangeRubricItemText(index, event.target.value)}
                    //         />
                    //         <div className="input-group-text bg-danger">
                    //             <button
                    //                 type="button"
                    //                 className="btn-close btn-close-white"
                    //                 onClick={() => this.props.onDeleteRubricItem(index)}
                    //             />
                    //         </div>
                    //         <div>
                    //             <input type="hidden" id={"question-edit-rubric-points-feedback-" + index} />
                    //             <div className="invalid-feedback">Invalid point value.</div>
                    //         </div>
                    //     </div>
                    // );
                })}
                {addButton}
            </React.Fragment>
        );
    };

    renderField = () => {
        if (this.props.editMode) {
            return this.renderEditMode();
        }
        if (this.props.preview) {
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
        } else {
            return this.props.question.rubric.map((item, index) => {
                const idFor = "item" + index;
                return (
                    <div key={index} className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={idFor}
                            checked={item.checked}
                            onChange={() => this.props.onCheckChange(index)}
                        />
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
