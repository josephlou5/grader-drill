import React, { Component, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllQuestions, deleteQuestion } from "../api";

class QuestionsView extends Component {
    render() {
        return (
            <React.Fragment>
                <h1>Questions</h1>
                <Link to="questions/new">
                    <button type="button" className="btn btn-success m-2">
                        New Question
                    </button>
                </Link>
                <QuestionsTable />
            </React.Fragment>
        );
    }
}

const QuestionsTable = () => {
    const [needsQuestions, setNeedsQuestions] = useState(true);
    const [questions, setQuestions] = useState(null);

    useEffect(() => {
        if (!needsQuestions) return;
        getAllQuestions((data) => {
            setNeedsQuestions(false);
            setQuestions(data);
        });
    });

    if (needsQuestions && !questions) {
        return <p>Getting questions...</p>;
    }

    if (!questions || Object.keys(questions).length === 0) {
        return <p className="m-2">No questions!</p>;
    }

    function handleDeleteQuestion(questionId) {
        deleteQuestion(questionId);
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
                    <Link to={"/questions/edit/" + questionId}>
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
                        onClick={() => {
                            handleDeleteQuestion(questionId);
                            setNeedsQuestions(true);
                        }}
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

export default QuestionsView;
