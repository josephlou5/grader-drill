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
            <div>
                This is the questions view. You can create, view, import,
                export, and edit questions. Questions use a version system, so
                every time you edit and make some changes, a new version is
                automatically created. Each question displays its id, number of
                versions, and some info about the question.
            </div>
            <Link to="/questions/new">
                <button type="button" className="btn btn-success my-2">
                    New Question
                </button>
            </Link>
            <ImportQuestions
                questions={questions}
                onNeedsQuestions={handleNeedQuestions}
            />
            <div>
                You can import questions with the above button. Only YAML files
                are accepted, and only files with valid fields will be imported.
                (Export a question to see which fields are required.) If a
                file's contents are detected to be a duplicate of an existing
                question, it will not be imported. If a valid question id is
                given in a file, it will create a new version for that question.
                If no question id is provided or the question id does not exist,
                then a new question will be created.
            </div>
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
        ["questionText", "string"],
    ];
    function extractFields(imported) {
        const question = {};

        const missing = [];
        const wrongType = [];
        const invalid = [];

        const allFields = [...fields];
        const arrays = [["tags", "string"]];
        if (
            imported.questionType !== "Multiple Choice" ||
            imported.hasCodeField
        ) {
            question.hasCodeField = true;
            allFields.push(["code", "string"]);
        } else {
            question.hasCodeField = false;
        }
        switch (imported.questionType) {
            case "Comment":
                question.hasAnswerField = true;
            // fall through
            case "Highlight":
                allFields.push(["rubric", "object"]);
                arrays.push(["rubric", "object"]);
                break;
            case "Multiple Choice":
                question.hasAnswerField = true;
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

    function sameQuestion(q1, q2) {
        if (q1.questionType !== q2.questionType) return false;
        if (q1.hasCodeField !== q2.hasCodeField) return false;
        if (q1.hasCodeField) {
            if (q1.code !== q2.code) return false;
            // highlights
            const fields = [
                "startLine",
                "startChar",
                "endLine",
                "endChar",
                "byUser",
            ];
            const highlights1 = q1.highlights || [];
            const highlights2 = q2.highlights || [];
            for (const h1 of highlights1) {
                let found = false;
                for (let i = 0; i < highlights2.length; i++) {
                    const h2 = highlights2[i];
                    if (!fields.every((f) => h1[f] === h2[f])) continue;
                    if ((h1.text || "") !== (h2.text || "")) continue;
                    found = true;
                    highlights2.splice(i, 1);
                    break;
                }
                if (!found) return false;
            }
            if (highlights2.length > 0) return false;
        }
        if (q1.hasAnswerField !== q2.hasAnswerField) return false;
        if (q1.questionText !== q2.questionText) return false;
        switch (q1.questionType) {
            case "Comment":
            // fall through
            case "Highlight":
                // rubric
                const fields = ["points", "text"];
                const rubric1 = q1.rubric;
                const rubric2 = q2.rubric;
                for (const item1 of rubric1) {
                    let found = false;
                    for (let i = 0; i < rubric2.length; i++) {
                        const item2 = rubric2[i];
                        if (!fields.every((f) => item1[f] === item2[f]))
                            continue;
                        found = true;
                        rubric2.splice(i, 1);
                        break;
                    }
                    if (!found) return false;
                }
                if (rubric2.length > 0) return false;
                break;
            case "Multiple Choice":
                // answer choices
                const choices1 = q1.answerChoices;
                const choices2 = q2.answerChoices;
                if (
                    new Set(choices1).size !==
                    new Set(choices1.concat(choices2)).size
                )
                    return false;
                if (choices1[q1.correct] !== choices2[q2.correct]) return false;
                break;
            default:
                break;
        }
        // tags
        const tags1 = q1.tags || [];
        const tags2 = q2.tags || [];
        if (new Set(tags1).size !== new Set(tags1.concat(tags2)).size)
            return false;
        return true;
    }

    function checkExists(imported, question) {
        const nullId = imported.id == null;
        for (const q of questions) {
            // if imported matches existing
            if (sameQuestion(q, question)) {
                return [true, q.id];
            }
            if (nullId) continue;
            // if imported id exists, update
            if (q.id === imported.id) {
                return [true, null];
            }
        }
        return [false, null];
    }

    return (
        <ImportYAML
            name="Question"
            extractFields={extractFields}
            checkExists={checkExists}
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
            <div>
                Use the above to filter the questions table with specific tags.
                The table will show the union of the given tags.
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
