import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Title, hasTagsSubstring } from "app/shared";
import { getAllQuestions, importQuestions, deleteQuestion } from "app/api";
import { TagsView, ImportYAML } from "./shared";

export default function QuestionsView() {
    const [{ needsQuestions, questions }, setState] = useState({
        needsQuestions: true,
    });

    useEffect(() => {
        if (!needsQuestions) return;
        getAllQuestions().then((questions) => {
            setState({ questions });
        });
    });

    function handleNeedQuestions() {
        setState({ needsQuestions: true, questions });
    }

    return (
        <React.Fragment>
            <Title title="Questions" />
            <h1>Questions</h1>
            <Link to="/questions/new">
                <button type="button" className="btn btn-success m-2">
                    New Question
                </button>
            </Link>
            <ImportQuestions
                questions={questions}
                onNeedsQuestions={handleNeedQuestions}
            />
            <QuestionsTable
                questions={questions}
                onNeedsQuestions={handleNeedQuestions}
            />
        </React.Fragment>
    );
}

function ImportQuestions({ questions, onNeedsQuestions }) {
    // `id` and `version` are optional (replace existing or new question)
    const fields = [
        ["questionType", "string"],
        ["hasCodeField", "boolean"],
        ["hasAnswerField", "boolean"],
        ["questionText", "string"],
    ];
    function extractFields(imported) {
        const question = {};

        const missing = [];
        const wrongType = [];
        const invalid = [];

        const allFields = [...fields];
        const arrays = [["tags", "string"]];
        if (imported.hasCodeField) {
            allFields.push(["code", "string"]);
        }
        switch (imported.questionType) {
            case "Comment":
            // fall through
            case "Highlight":
                allFields.push(["rubric", "object"]);
                arrays.push(["rubric", "object"]);
                break;
            case "Multiple Choice":
                allFields.push(
                    ["answerChoices", "object"],
                    ["correct", "number"]
                );
                arrays.push(["answerChoices", "string"]);
                break;
            default:
                invalid.push("questionType");
                break;
        }

        for (const [field, fieldType] of allFields) {
            // if missing vital field, invalid
            if (imported[field] == null) {
                missing.push(field);
            } else if (typeof imported[field] !== fieldType) {
                wrongType.push(field);
            } else {
                question[field] = imported[field];
            }
        }
        if (missing.length > 0) {
            const reason =
                "Missing fields " + missing.map((s) => `'${s}'`).join(", ");
            return [true, reason, null];
        }

        if (question.hasCodeField) {
            arrays.push(["highlights", "object"]);
            // check if `highlights` exists
            if (
                imported.highlights != null &&
                typeof imported.highlights === "object"
            ) {
                question.highlights = imported.highlights;
            } else {
                question.highlights = [];
            }
        }
        // check if `tags` exists
        if (imported.tags != null && typeof imported.tags === "object") {
            question.tags = imported.tags;
        } else {
            question.tags = [];
        }

        // check for arrays
        for (const [field, arrayType] of arrays) {
            if (typeof imported[field] !== "object") {
                continue;
            }
            // if `imported[field]` is an object, then it's in `question`
            if (!Array.isArray(question[field])) {
                wrongType.push(field);
            } else if (!question[field].every((e) => typeof e === arrayType)) {
                wrongType.push(field);
            }
        }

        // check if `highlights` is an array of objects with proper attributes
        if (question.highlights && !wrongType.includes("highlights")) {
            const numFields = ["startLine", "startChar", "endLine", "endChar"];
            const highlights = [];
            for (const h of question.highlights) {
                const { startLine, startChar, endLine, endChar, byUser } = h;
                // check for missing values
                if (numFields.some((f) => h[f] == null) || byUser == null) {
                    missing.push("highlights");
                    break;
                }
                // check for correct types
                if (
                    !numFields.every((f) => typeof h[f] === "number") ||
                    typeof byUser !== "boolean"
                ) {
                    wrongType.push("highlights");
                    break;
                }
                // check for validity
                if (startLine > endLine) {
                    invalid.push("highlights");
                    break;
                } else if (startLine === endLine && startChar >= endChar) {
                    invalid.push("highlights");
                    break;
                }
                const h2 = { startLine, startChar, endLine, endChar, byUser };
                // optional field `text`
                if (h.text != null) {
                    // type
                    if (typeof h.text !== "string") {
                        wrongType.push("highlights");
                        break;
                    }
                    // validity
                    if (h.text !== "") {
                        h2.text = h.text;
                    }
                }
                highlights.push(h2);
            }
            question.highlights = highlights;
        }
        // check if `rubric` is an array of objects with `points` and `text`
        if (question.rubric && !wrongType.includes("rubric")) {
            const rubric = [];
            for (const { points, text } of question.rubric) {
                // check for missing values
                if (points == null || text == null) {
                    missing.push("rubric");
                    break;
                }
                // check for correct types
                if (typeof points !== "number" || typeof text !== "string") {
                    wrongType.push("rubric");
                    break;
                }
                // check for validity
                if (points === 0 || text === "") {
                    invalid.push("rubric");
                    break;
                }
                rubric.push({ points, text });
            }
            question.rubric = rubric;
        }

        if (wrongType.length > 0) {
            const reason =
                "Fields " +
                wrongType.map((s) => `'${s}'`).join(", ") +
                " have wrong type";
            return [true, reason, null];
        }
        if (missing.length > 0) {
            const reason =
                "Fields " +
                missing.map((s) => `'${s}'`).join(", ") +
                " have missing values";
            return [true, reason, null];
        }

        // check if `questionText` is valid
        if (question.questionText === "") {
            invalid.push("questionText");
        }
        if (question.questionType === "Multiple Choice") {
            // check if `answerChoices` is valid
            if (question.answerChoices.some((s) => s === "")) {
                invalid.push("answerChoices");
            }
            // check if `correct` is valid
            if (
                question.correct < 0 ||
                question.correct >= question.answerChoices.length
            ) {
                invalid.push("correct");
            }
        }

        if (invalid.length > 0) {
            const reason =
                "Invalid values for fields " +
                invalid.map((s) => `'${s}'`).join(", ");
            return [true, reason, null];
        }

        return [false, null, question];
    }

    return (
        <ImportYAML
            name="Question"
            extractFields={extractFields}
            existing={questions}
            apiImport={importQuestions}
            onRefresh={onNeedsQuestions}
        />
    );
}

function QuestionsTable({ questions, onNeedsQuestions }) {
    const [filters, setFilters] = useState([]);

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
        deleteQuestion(questionId).then(() => {
            onNeedsQuestions();
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
