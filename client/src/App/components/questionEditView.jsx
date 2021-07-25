import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ResizeTextareas } from "../shared";
import { getQuestion, updateQuestion } from "../api";
import QuestionTextField from "./questionTextField";
import CodeField from "./codeField";
import AnswerField from "./answerField";
import RubricField from "./rubricField";

export default function QuestionEditView(props) {
    const [needsQuestion, setNeedsQuestion] = useState(!props.newQuestion);
    const [question, setQuestionState] = useState({
        hasCodeField: true,
        hasAnswerField: true,
        questionType: "Comment",
        questionText: "",
        code: "",
        highlights: [],
        answerChoices: [],
        correct: null,
        rubric: [],
    });
    const [canToggleCodeField, setToggleCodeField] = useState(false);

    const history = useHistory();

    function setQuestion(updates) {
        setQuestionState({ ...question, ...updates });
    }

    useEffect(() => {
        if (!needsQuestion) return;
        getQuestion(props.questionId, (q) => {
            setNeedsQuestion(false);
            if (!q) {
                setQuestionState(null);
                return;
            }
            setQuestion(q);
            if (q.questionType === "Multiple Choice") {
                setToggleCodeField(true);
            }
        });
    });

    if (needsQuestion) {
        return <h1>Loading question...</h1>;
    }

    if (!question) {
        return <h1>Invalid question</h1>;
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
                });
                break;
            case "Highlight":
                setToggleCodeField(false);
                setQuestion({
                    questionType,
                    hasCodeField: true,
                    hasAnswerField: false,
                });
                break;
            case "Multiple Choice":
                setToggleCodeField(true);
                setQuestion({
                    questionType,
                    hasAnswerField: true,
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

        let removing = [];
        const highlights = question.highlights.flatMap((h, i) => {
            let highlight = { ...h };
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
                    highlight["endChar"] = lineLengths[endLine];
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

    function handleAddHighlight(question, highlight) {
        let highlights = [...question.highlights];
        highlights.push(highlight);
        setQuestion({ highlights });
    }

    function handleClearHighlights() {
        setQuestion({ highlights: [] });
    }

    function handleChangeHighlightText(index, text) {
        let highlights = [...question.highlights];
        highlights[index] = { ...highlights[index], text };
        setQuestion({ highlights });
    }

    function handleDeleteHighlight(question, highlightIndex) {
        let highlights = [...question.highlights];
        highlights.splice(highlightIndex, 1);
        setQuestion({ highlights });
    }

    function handleAddAnswerChoice() {
        let answerChoices = [...question.answerChoices];
        answerChoices.push("");
        setQuestion({ answerChoices });
    }

    function handleChangeAnswerChoice(index, answerChoice) {
        let answerChoices = [...question.answerChoices];
        answerChoices[index] = answerChoice;
        setQuestion({ answerChoices });
    }

    function handleDeleteAnswerChoice(index) {
        let answerChoices = [...question.answerChoices];
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
        let rubric = [...question.rubric];
        rubric.push({ points: 1, text: "" });
        setQuestion({ rubric });
    }

    function handleChangeRubricItemPoints(index, points) {
        let rubric = [...question.rubric];
        let pointsNum = parseInt(points);
        if (isNaN(pointsNum)) {
            pointsNum = 0;
        }
        rubric[index] = { ...rubric[index], points: pointsNum };
        setQuestion({ rubric });
    }

    function handleChangeRubricItemText(index, text) {
        let rubric = [...question.rubric];
        rubric[index] = { ...rubric[index], text };
        setQuestion({ rubric });
    }

    function handleDeleteRubricItem(index) {
        let rubric = [...question.rubric];
        rubric.splice(index, 1);
        setQuestion({ rubric });
    }

    function handleCancel() {
        history.goBack();
    }

    function validate(q) {
        let formValid = true;

        function setValid(elementId, isValid) {
            document
                .getElementById(elementId)
                .classList.toggle("is-invalid", !isValid);
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
                        item.points && item.points !== 0
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
        const {
            id,
            hasCodeField,
            hasAnswerField,
            questionType,
            questionText,
            highlights,
        } = question;
        let newQuestion = {
            id,
            hasCodeField,
            hasAnswerField,
            questionType,
            questionText,
            highlights,
        };
        if (hasCodeField) {
            newQuestion["code"] = question.code;
        }
        switch (questionType) {
            case "Comment":
            // TODO: this used to cause some error, but it's actually unnecessary,
            // so i need to find the error
            // newQuestion["answers"] = highlights.map(() => "");
            // fall through
            case "Highlight":
                newQuestion["rubric"] = question.rubric;
                break;
            case "Multiple Choice":
                Object.assign(newQuestion, {
                    answerChoices: question.answerChoices,
                    correct: question.correct,
                });
                break;
            default:
                return;
        }

        if (!validate(newQuestion)) return;

        updateQuestion(newQuestion);
    }

    function handleDone() {
        handleSave();
        history.push("/questions");
    }

    return (
        <React.Fragment>
            <ResizeTextareas />

            <div className="row">
                <div className="col">
                    <h1>
                        {props.newQuestion ? "New Question" : "Edit Question"}
                    </h1>
                </div>
                <div className="col">
                    <h1>Preview</h1>
                </div>
            </div>

            <div
                className="btn-group"
                role="group"
                style={{ marginLeft: "10px" }}
            >
                {["Comment", "Highlight", "Multiple Choice"].map(
                    (questionType) => {
                        const idFor = "type-" + questionType.toLowerCase();
                        return (
                            <React.Fragment key={questionType}>
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="question-type"
                                    id={idFor}
                                    checked={
                                        questionType === question.questionType
                                    }
                                    onChange={() =>
                                        handleQuestionType(questionType)
                                    }
                                />
                                <label
                                    className="btn btn-outline-primary"
                                    htmlFor={idFor}
                                >
                                    {questionType}
                                </label>
                            </React.Fragment>
                        );
                    }
                )}
            </div>

            <QuestionTextField
                editMode={true}
                question={question}
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
                        id="hasCodeField"
                        defaultChecked={question.hasCodeField}
                        onChange={handleToggleCodeField}
                    />
                    <label className="form-check-label" htmlFor="hasCodeField">
                        Include code field
                    </label>
                </div>
            )}
            {question.hasCodeField && (
                <CodeField
                    editMode={true}
                    question={question}
                    onCodeChange={handleCodeChange}
                    onAddHighlight={handleAddHighlight}
                    onDeleteHighlight={handleDeleteHighlight}
                    onClearHighlights={handleClearHighlights}
                />
            )}

            {question.hasAnswerField && (
                <AnswerField
                    editMode={true}
                    question={question}
                    onClearHighlights={handleClearHighlights}
                    onChangeHighlightText={handleChangeHighlightText}
                    onDeleteHighlight={handleDeleteHighlight}
                    onAddAnswerChoice={handleAddAnswerChoice}
                    onChangeAnswerChoice={handleChangeAnswerChoice}
                    onDeleteAnswerChoice={handleDeleteAnswerChoice}
                    onSetCorrectAnswerChoice={handleSetCorrectAnswerChoice}
                />
            )}

            {question.questionType !== "Multiple Choice" && (
                <div className="row">
                    <div className="col">
                        <RubricField
                            editMode={true}
                            question={question}
                            onAddRubricItem={handleAddRubricItem}
                            onChangeRubricItemPoints={
                                handleChangeRubricItemPoints
                            }
                            onChangeRubricItemText={handleChangeRubricItemText}
                            onDeleteRubricItem={handleDeleteRubricItem}
                        />
                    </div>
                    <div className="col">
                        <RubricField previewMode={true} question={question} />
                    </div>
                </div>
            )}

            <div>
                <button
                    type="button"
                    className="btn btn-danger m-2"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-success m-2"
                    onClick={handleSave}
                >
                    Save
                </button>
                <button
                    type="button"
                    className="btn btn-light m-2"
                    onClick={handleDone}
                >
                    Done
                </button>
            </div>
        </React.Fragment>
    );
}
