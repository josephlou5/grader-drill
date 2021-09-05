import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, hasTagsSubstring } from "app/shared";
import { TagsView } from "./shared";
import { getAllQuestions, deleteQuestion } from "app/api";

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

function QuestionsTable() {
    const [{ needsQuestions, questions }, setState] = useState({
        needsQuestions: true,
    });
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        if (!needsQuestions) return;
        getAllQuestions((questions) => {
            setState({ questions });
        });
    });

    if (!questions) {
        return <p>Getting questions...</p>;
    }

    if (questions.length === 0) {
        return <p>No questions!</p>;
    }

    function handleAddFilter() {
        setFilters([...filters, ""]);
    }

    function handleChangeFilter(index, tag) {
        const updated = [...filters];
        updated[index] = tag;
        setFilters(updated);
    }

    function handleDeleteFilter(index) {
        const updated = [...filters];
        updated.splice(index, 1);
        setFilters(updated);
    }

    function handleDeleteQuestion(questionId) {
        deleteQuestion(questionId, () => {
            setState({ needsQuestions: true, questions });
        });
    }

    const rows = questions.map((question) => {
        const {
            id: questionId,
            version,
            questionType,
            questionText,
            tags,
        } = question;

        let classes = undefined;
        if (!hasTagsSubstring(tags, filters)) {
            classes = "d-none";
        }

        let preview = questionText;
        const PREVIEW_LENGTH = 50;
        if (preview.length > PREVIEW_LENGTH) {
            preview = preview.substring(0, PREVIEW_LENGTH - 3) + "...";
        }

        const viewLink = "/questions/" + questionId;
        const editLink = "/questions/edit/" + questionId;
        return (
            <tr key={`${questionId}v${version}`} className={classes}>
                <th>{questionId}</th>
                <td>{version}</td>
                <td>{questionType}</td>
                <td>{preview}</td>
                <td>
                    <TagsView tags={tags} />
                </td>
                <td>
                    <Link to={viewLink}>
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                        >
                            View
                        </button>
                    </Link>
                </td>
                <td>
                    <Link to={editLink}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm mx-2"
                        >
                            Edit
                        </button>
                    </Link>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
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
            <FilterTags
                filters={filters}
                onAddFilter={handleAddFilter}
                onChangeFilter={handleChangeFilter}
                onDeleteFilter={handleDeleteFilter}
            />
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Version</th>
                        <th>Type</th>
                        <th>Text</th>
                        <th>Tags</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </React.Fragment>
    );
}

function FilterTags({ filters, onAddFilter, onChangeFilter, onDeleteFilter }) {
    const tags = filters.map((tag, index) => (
        <div key={index}>
            <input
                type="text"
                className="mb-1"
                placeholder="Tag"
                value={tag}
                onChange={(event) => onChangeFilter(index, event.target.value)}
            />
            <button
                type="button"
                className="btn btn-close"
                onClick={() => onDeleteFilter(index)}
            />
        </div>
    ));

    return (
        <React.Fragment>
            <h3>Filter Tags</h3>
            {tags}
            <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={onAddFilter}
            >
                Add tag
            </button>
        </React.Fragment>
    );
}
