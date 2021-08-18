import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, ResizeTextareas, TextareaLine } from "../shared";
import { getAllQuestions, deleteQuestion } from "../api";

export default function QuestionsView() {
    return (
        <React.Fragment>
            <Title title="Questions" />
            <h1>Questions</h1>
            <Link to="/questions/new">
                <button type="button" className="btn btn-success m-2">
                    New Question
                </button>
            </Link>
            <QuestionsTable />
        </React.Fragment>
    );
}

const QuestionsTable = () => {
    const [needsQuestions, setNeedsQuestions] = useState(true);
    const [questions, setQuestions] = useState(null);
    const [filter, setFilter] = useState("");

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

    if (!questions || questions.length === 0) {
        return <p>No questions!</p>;
    }

    function handleDeleteQuestion(questionId) {
        deleteQuestion(questionId, () => {
            setNeedsQuestions(true);
        });
    }

    const rows = questions.map((question) => {
        const questionId = question.id;

        let classes = undefined;
        if (!question.tags.includes(filter)) {
            classes = "d-none";
        }

        let preview = question.questionText;
        const PREVIEW_LENGTH = 50;
        if (preview.length > PREVIEW_LENGTH) {
            preview = preview.substring(0, PREVIEW_LENGTH - 3) + "...";
        }

        const tags = question.tags;

        return (
            <tr
                key={`question-${questionId}-v-${question.version}`}
                className={classes}
            >
                <th>{question.id}</th>
                <td>{question.version}</td>
                <td>{question.questionType || "N/A"}</td>
                <td>{preview}</td>
                <td>{tags || "None"}</td>
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
                        onClick={() => handleDeleteQuestion(questionId)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        );
    });

    return (
        <React.Fragment>
            <ResizeTextareas />
            <div className="container-fluid mb-2">
                <div className="input-group">
                    <span className="input-group-text">Filter Tags</span>
                    <TextareaLine
                        className="form-control textarea"
                        id="filter-tags"
                        placeholder='E.g., "difficulty:hard"'
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                    />
                </div>
            </div>
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Version</th>
                        <th>Type</th>
                        <th>Text</th>
                        <th>Tags</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </React.Fragment>
    );
};
