import React, { Component } from "react";
import { Link } from "react-router-dom";

class QuestionsView extends Component {
    renderTable = () => {
        const { questions } = this.props;
        if (!questions || Object.keys(questions).length === 0) {
            return <p className="m-2">No questions!</p>;
        }

        let rows = [];
        let index = 1;
        for (const [questionId, question] of Object.entries(questions)) {
            let preview = question.questionText;
            if (preview.length > 50) {
                preview = preview.substring(0, 47) + "...";
            }
            rows.push(
                <tr key={"question-" + questionId}>
                    <th>{index++}</th>
                    <td>{question.questionType || "N/A"}</td>
                    <td>{preview}</td>
                    <td>
                        <Link to={"questions/edit/" + questionId}>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm mx-2"
                            >
                                Edit
                            </button>
                        </Link>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm mx-2"
                            onClick={() =>
                                this.props.onDeleteQuestion(questionId)
                            }
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            );
        }

        if (rows.length === 0) {
            return <p className="m-2">Nothing here</p>;
        }

        return (
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>Type</th>
                        <th>Text</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    };

    render() {
        return (
            <React.Fragment>
                <h1>Questions</h1>
                <Link to="questions/new">
                    <button type="button" className="btn btn-success m-2">
                        New Question
                    </button>
                </Link>
                {this.renderTable()}
            </React.Fragment>
        );
    }
}

export default QuestionsView;
