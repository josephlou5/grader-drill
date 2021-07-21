import React, { Component } from 'react';
import { Link } from "react-router-dom";

class GradingDashboard extends Component {

    renderTable = () => {
        const {answered, hideGraded} = this.props;
        if (!answered || answered.length === 0) {
            return <p className="m-2">No questions!</p>;
        }

        const rows = answered.flatMap((question, index) => {
            if (question.graded && hideGraded) return [];
            let score = "-";
            if (question.score != null) {
                score = question.score;
            }
            const questionId = question.id;
            const {trainee} = question;
            const link = "/grading/" + trainee + "/" + questionId;
            return (
                <tr key={"question-" + questionId}>
                    <th>{index + 1}</th>
                    <td>{trainee}</td>
                    <td>{question.assessor || "-"}</td>
                    <td>{question.questionType || "N/A"}</td>
                    <td>{score}</td>
                    <td>
                        <Link to={link}>
                            <button type="button" className="btn btn-primary btn-sm">
                                Question
                            </button>
                        </Link>
                    </td>
                </tr>
            );
        });

        if (rows.length === 0) {
            return <p className="m-2">Nothing here</p>;
        }

        return (
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>Trainee</th>
                        <th>Assessor</th>
                        <th>Question Type</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { rows }
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <React.Fragment>
                <h1>Grading Dashboard</h1>
                <Link to="/grading">
                    <button type="button" className="btn btn-success m-2">
                        Grading
                    </button>
                </Link>
                <button type="button" className="btn btn-light m-2">Export</button>
                {/* todo: could turn this into a toggle button instead of a checkbox */}
                <div className="form-check form-check-inline">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="hideGradedCheckbox"
                        defaultChecked={this.props.hideGraded}
                        onChange={this.props.onHideGraded}
                    />
                    <label className="form-check-label" htmlFor="hideGradedCheckbox">
                        Hide Graded
                    </label>
                </div>
                { this.renderTable() }
            </React.Fragment>
        );
    }
}

export default GradingDashboard;
