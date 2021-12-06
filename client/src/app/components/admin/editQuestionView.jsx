import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import {
    useMountEffect,
    Title,
    ResizeTextareas,
    ButtonHelp,
    setElementValid,
} from "app/shared";
import { EditTags } from "./shared";
import {
    getQuestion,
    addQuestion,
    updateQuestion,
    updateQuestionVersion,
} from "app/api";
import {
    QuestionTextField,
    CodeField,
    AnswerField,
    RubricField,
} from "../question";

export default function EditQuestionView({ newQuestion, questionId }) {
    const initial = {
        id: null,
        version: null,
        hasCodeField: true,
        hasAnswerField: true,
        questionType: "Comment",
        questionText: "",
        code: "",
        highlights: [],
        answerChoices: [],
        correct: null,
        rubric: [],
        tags: [],
    };

    const [question, setQuestionState] = useState(initial);
    const [canToggleCodeField, setToggleCodeField] = useState(false);

    function setQuestion(updates) {
        setQuestionState({ ...question, ...updates });
    }

    const history = useHistory();

    useMountEffect(() => {
        if (newQuestion) return;
        getQuestion(questionId).then((q) => {
            if (!q) {
                setQuestionState(null);
                return;
            }
            // want to create new version, so keep version as null
            delete q.version;
            setQuestion(q);
            if (q.questionType === "Multiple Choice") {
                setToggleCodeField(true);
            }
        });
    });

    const title = newQuestion ? "New Question" : "Edit Question";

    if (!question) {
        // `title` can only be "Edit Question"
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>Invalid question</h1>
            </React.Fragment>
        );
    }

    // need to get question
    if (!newQuestion && question.id == null) {
        return (
            <React.Fragment>
                <Title title={title} />
                <h1>{title}</h1>
                <p>Getting question...</p>
            </React.Fragment>
        );
    }

    // event handlers

    function handleQuestionType(questionType) {
        switch (questionType) {
            case "Comment":
                setToggleCodeField(false);
                setQuestion({
                    questionType,
                    hasCodeField: true,
                    hasAnswerField: true,
                    code: question.code || "",
                    highlights: question.highlights || [],
                    rubric: question.rubric || [],
                });
                break;
            case "Highlight":
                setToggleCodeField(false);
                setQuestion({
                    questionType,
                    hasCodeField: true,
                    hasAnswerField: false,
                    code: question.code || "",
                    highlights: question.highlights || [],
                    rubric: question.rubric || [],
                });
                break;
            case "Multiple Choice":
                setToggleCodeField(true);
                setQuestion({
                    questionType,
                    hasAnswerField: true,
                    answerChoices: question.answerChoices || [],
                });
                break;
            default:
                return;
        }
    }

    function handleTextChange(questionText) {
        setQuestion({ questionText });
    }

    function handleToggleCodeField() {
        setQuestion({ hasCodeField: !question.hasCodeField });
    }

    function handleCodeChange(code) {
        // see if any highlights were deleted
        const lines = code.split("\n");
        const numLines = lines.length;
        const lineLengths = lines.map((line) => line.length);

        const removing = [];
        const highlights = question.highlights.flatMap((h, i) => {
            const highlight = { ...h };
            let { startLine, startChar, endLine, endChar } = highlight;
            if (startLine >= numLines) return [];
            if (endLine >= numLines) {
                endLine = numLines - 1;
                endChar = lineLengths[endLine];
            }
            if (startLine === endLine) {
                // highlight doesn't exist on this line anymore
                if (startChar >= lineLengths[startLine]) {
                    removing.unshift(i);
                    return [];
                }
                // the end of the highlight got cut off
                if (endChar >= lineLengths[endLine]) {
                    highlight.endChar = lineLengths[endLine];
                }
                return [highlight];
            }
            if (startChar >= lineLengths[startLine]) {
                // go to start of next non-empty line
                do {
                    startLine++;
                } while (lineLengths[startLine] === 0);
                if (startLine >= numLines) return [];
                startChar = 0;
            }
            if (endChar > lineLengths[endLine]) {
                // go to end of last non-empty line
                while (lineLengths[endLine] === 0) {
                    endLine--;
                }
                if (endLine < 0) return [];
                endChar = lineLengths[endLine];
            }
            if (startLine > endLine) return [];
            Object.assign(highlight, {
                startLine,
                startChar,
                endLine,
                endChar,
            });
            return [highlight];
        });

        setQuestion({ code, highlights });
    }

    function handleAddHighlight(highlight) {
        const highlights = [...question.highlights];
        highlights.push(highlight);
        setQuestion({ highlights });
    }

    function handleClearHighlights() {
        setQuestion({ highlights: [] });
    }

    function handleDeleteHighlight(highlightIndex) {
        const highlights = [...question.highlights];
        highlights.splice(highlightIndex, 1);
        setQuestion({ highlights });
    }

    function handleChangeHighlightText(index, text) {
        const highlights = [...question.highlights];
        highlights[index] = { ...highlights[index], text };
        setQuestion({ highlights });
    }

    function handleAddAnswerChoice() {
        const answerChoices = [...question.answerChoices];
        answerChoices.push("");
        setQuestion({ answerChoices });
    }

    function handleChangeAnswerChoice(index, answerChoice) {
        const answerChoices = [...question.answerChoices];
        answerChoices[index] = answerChoice;
        setQuestion({ answerChoices });
    }

    function handleDeleteAnswerChoice(index) {
        const answerChoices = [...question.answerChoices];
        answerChoices.splice(index, 1);
        let correct = question.correct;
        if (index === correct) {
            // deleting the correct choice, so no more correct choice
            correct = null;
        } else if (index < correct) {
            // deleting one before the correct choice, so shift correct choice up
            correct--;
        }
        setQuestion({ answerChoices, correct });
    }

    function handleSetCorrectAnswerChoice(index) {
        setQuestion({ correct: index });
    }

    function handleAddRubricItem() {
        const rubric = [...question.rubric];
        rubric.push({ points: 1, text: "" });
        setQuestion({ rubric });
    }

    function handleChangeRubricItemPoints(index, points) {
        const rubric = [...question.rubric];
        let pointsNum = parseInt(points);
        if (isNaN(pointsNum)) {
            pointsNum = 0;
        }
        rubric[index] = { ...rubric[index], points: pointsNum };
        setQuestion({ rubric });
    }

    function handleChangeRubricItemText(index, text) {
        const rubric = [...question.rubric];
        rubric[index] = { ...rubric[index], text };
        setQuestion({ rubric });
    }

    function handleDeleteRubricItem(index) {
        const rubric = [...question.rubric];
        rubric.splice(index, 1);
        setQuestion({ rubric });
    }

    function handleAddTag() {
        setQuestion({ tags: [...question.tags, ""] });
    }

    function handleChangeTag(index, tag) {
        const tags = [...question.tags];
        tags[index] = tag;
        setQuestion({ tags });
    }

    function handleDeleteTag(index) {
        const tags = [...question.tags];
        tags.splice(index, 1);
        setQuestion({ tags });
    }

    function handleCancel() {
        history.goBack();
    }

    function validate(q) {
        let formValid = true;

        function setValid(elementId, isValid) {
            setElementValid(elementId, isValid);
            if (!isValid) formValid = false;
        }

        setValid("question-edit-text", q.questionText.length > 0);
        if (q.hasCodeField) {
            setValid("question-edit-code", q.code.length > 0);
        }
        if (q.questionType === "Multiple Choice") {
            if (q.answerChoices.length === 0) {
                setValid("question-edit-mc", false);
            } else {
                if (q.correct == null) {
                    setValid("question-edit-mc-correct", false);
                }
                q.answerChoices.forEach((text, index) =>
                    setValid("question-edit-mc-" + index, text.length > 0)
                );
            }
        } else {
            if (q.rubric.length === 0) {
                setValid("question-edit-rubric", false);
            } else {
                q.rubric.forEach((item, index) => {
                    setValid(
                        "question-edit-rubric-points-" + index,
                        item.points !== 0
                    );
                    setValid(
                        "question-edit-rubric-" + index,
                        item.text.length > 0
                    );
                });
            }
        }

        return formValid;
    }

    function handleSave() {
        if (!validate(question)) return;
        if (question.id == null) {
            // add the new question
            addQuestion(question).then((q) => {
                if (!q) return;
                setQuestion({ id: q.id, version: q.version });
            });
        } else if (question.version == null) {
            // make a new version of the current question
            updateQuestion(question).then((q) => {
                if (!q) return;
                setQuestion({ version: q.version });
            });
        } else {
            // keep updating the current version
            updateQuestionVersion(question);
        }
    }

    const questionTypeChoice = ["Comment", "Highlight", "Multiple Choice"].map(
        (questionType) => {
            const idFor = "type-" + questionType.toLowerCase();
            return (
                <React.Fragment key={questionType}>
                    <input
                        type="radio"
                        className="btn-check"
                        name="question-type"
                        id={idFor}
                        checked={questionType === question.questionType}
                        onChange={() => handleQuestionType(questionType)}
                    />
                    <label className="btn btn-outline-primary" htmlFor={idFor}>
                        {questionType}
                    </label>
                </React.Fragment>
            );
        }
    );

    const codeFieldProps = {
        question: question,
        editMode: true,
        onCodeChange: handleCodeChange,
        onAddHighlight: handleAddHighlight,
        onDeleteHighlight: handleDeleteHighlight,
        onClearHighlights: handleClearHighlights,
    };
    const answerFieldProps = {
        question: question,
        editMode: true,
        onClearHighlights: handleClearHighlights,
        onChangeHighlightText: handleChangeHighlightText,
        onDeleteHighlight: handleDeleteHighlight,
        onAddAnswerChoice: handleAddAnswerChoice,
        onChangeAnswerChoice: handleChangeAnswerChoice,
        onDeleteAnswerChoice: handleDeleteAnswerChoice,
        onSetCorrectAnswerChoice: handleSetCorrectAnswerChoice,
    };

    let rubricField = null;
    if (question.questionType !== "Multiple Choice") {
        const editRubricFieldProps = {
            rubric: question.rubric,
            editMode: true,
            onAddRubricItem: handleAddRubricItem,
            onChangeRubricItemPoints: handleChangeRubricItemPoints,
            onChangeRubricItemText: handleChangeRubricItemText,
            onDeleteRubricItem: handleDeleteRubricItem,
        };
        rubricField = (
            <div className="rubric-field row">
                <div className="col">
                    <RubricField {...editRubricFieldProps} />
                </div>
                <div className="col">
                    <RubricField rubric={question.rubric} previewMode={true} />
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Title title={title} />
            <ResizeTextareas />

            <div className="row">
                <div className="col">
                    <h1>{title}</h1>
                </div>
                <div className="col">
                    <h1>Preview</h1>
                </div>
            </div>

            <div role="group" className="btn-group">
                {questionTypeChoice}
            </div>

            <QuestionTextField
                question={question}
                editMode={true}
                onTextChange={handleTextChange}
            />
            {canToggleCodeField && (
                // todo: can change this into a toggle button instead of a checkbox
                <div
                    className="form-check form-check-inline"
                    style={{ marginLeft: "10px" }}
                >
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="hasCodeFieldCheck"
                        defaultChecked={question.hasCodeField}
                        onChange={handleToggleCodeField}
                    />
                    <label
                        className="form-check-label"
                        htmlFor="hasCodeFieldCheck"
                    >
                        Include code field
                    </label>
                </div>
            )}
            {question.hasCodeField && <CodeField {...codeFieldProps} />}
            {question.hasAnswerField && <AnswerField {...answerFieldProps} />}
            {rubricField}
            <div className="tags-field row">
                <div className="col-6">
                    <h1>Tags</h1>
                    <div>
                        This question will be matched with drills with any one
                        of these tags.
                    </div>
                    <EditTags
                        tags={question.tags}
                        onAddTag={handleAddTag}
                        onChangeTag={handleChangeTag}
                        onDeleteTag={handleDeleteTag}
                    />
                </div>
            </div>

            <div className="mt-2">
                <button
                    type="button"
                    className="btn btn-danger me-1"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-success me-1"
                    onClick={handleSave}
                >
                    Save
                </button>
                <Link to="/questions">
                    <button type="button" className="btn btn-light">
                        Done
                    </button>
                </Link>
                <ButtonHelp
                    help={[
                        '"Cancel" goes back to the last page without saving.',
                        '"Save" saves the current state of the question (but doesn\'t go anywhere).',
                        '"Done" redirects back to the Questions page without saving.',
                    ]}
                />
            </div>
        </React.Fragment>
    );
}
