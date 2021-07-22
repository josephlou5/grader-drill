import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import QuestionTextField from "./questionTextField";
import CodeField from "./codeField";
import AnswerField from "./answerField";
import RubricField from "./rubricField";
import { ResizeTextareas } from "../shared";

class QuestionEditView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCodeField: true,
            canToggleCodeField: false,
            hasAnswerField: true,
            questionType: "Comment",
            questionText: "",
            code: "",
            highlights: [],
            answerChoices: [],
            correct: null,
            rubric: [],
        };
        if (!props.newQuestion && props.question) {
            Object.assign(this.state, props.question);
            if (props.question.questionType === "Multiple Choice") {
                this.state["canToggleCodeField"] = true;
            }
        }
    }

    handleQuestionType = (questionType) => {
        switch (questionType) {
            case "Comment":
                this.setState({
                    questionType: questionType,
                    hasCodeField: true,
                    canToggleCodeField: false,
                    hasAnswerField: true,
                });
                break;
            case "Highlight":
                this.setState({
                    questionType: questionType,
                    hasCodeField: true,
                    canToggleCodeField: false,
                    hasAnswerField: false,
                });
                break;
            case "Multiple Choice":
                this.setState({
                    questionType: questionType,
                    canToggleCodeField: true,
                    hasAnswerField: true,
                });
                break;
            default:
                return;
        }
    };

    handleTextChange = (questionText) => {
        this.setState({ questionText: questionText });
    };

    handleToggleCodeField = () => {
        if (this.state.canToggleCodeField) {
            this.setState({ hasCodeField: !this.state.hasCodeField });
        }
    };

    handleCodeChange = (code) => {
        // see if any highlights were deleted
        const lines = code.split("\n");
        const numLines = lines.length;
        const lineLengths = lines.map((line) => line.length);

        let removing = [];
        const highlights = this.state.highlights.flatMap((h, i) => {
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
                startLine: startLine,
                startChar: startChar,
                endLine: endLine,
                endChar: endChar,
            });
            return [highlight];
        });

        this.setState({
            code: code,
            highlights: highlights,
        });
    };

    handleAddHighlight = (question, highlight) => {
        let highlights = [...this.state.highlights];
        highlights.push(highlight);
        this.setState({ highlights: highlights });
    };

    handleClearHighlights = () => {
        this.setState({ highlights: [] });
    };

    handleChangeHighlightText = (index, text) => {
        let highlights = [...this.state.highlights];
        highlights[index]["text"] = text;
        this.setState({ highlights: highlights });
    };

    handleDeleteHighlight = (question, highlightIndex) => {
        let highlights = [...this.state.highlights];
        highlights.splice(highlightIndex, 1);
        this.setState({ highlights: highlights });
    };

    handleAddAnswerChoice = () => {
        let answerChoices = [...this.state.answerChoices];
        answerChoices.push("");
        this.setState({ answerChoices: answerChoices });
    };

    handleChangeAnswerChoice = (index, answerChoice) => {
        let answerChoices = [...this.state.answerChoices];
        answerChoices[index] = answerChoice;
        this.setState({ answerChoices: answerChoices });
    };

    handleDeleteAnswerChoice = (index) => {
        let answerChoices = [...this.state.answerChoices];
        answerChoices.splice(index, 1);
        let stateUpdate = { answerChoices: answerChoices };
        if (index === this.state.correct) {
            // deleting the correct choice, so no more correct choice
            stateUpdate["correct"] = null;
        } else if (index < this.state.correct) {
            // deleting one before the correct choice, so shift correct choice up
            stateUpdate["correct"] = this.state.correct - 1;
        }
        this.setState(stateUpdate);
    };

    handleSetCorrectAnswerChoice = (index) => {
        this.setState({ correct: index });
    };

    handleAddRubricItem = () => {
        let rubric = [...this.state.rubric];
        rubric.push({ points: 1, text: "" });
        this.setState({ rubric: rubric });
    };

    handleChangeRubricItemPoints = (index, points) => {
        let rubric = [...this.state.rubric];
        let rubricItem = { ...rubric[index] };
        let pointsNum = parseInt(points);
        if (isNaN(pointsNum)) {
            pointsNum = 0;
        }
        rubricItem["points"] = pointsNum;
        rubric[index] = rubricItem;
        this.setState({ rubric: rubric });
    };

    handleChangeRubricItemText = (index, text) => {
        let rubric = [...this.state.rubric];
        let rubricItem = { ...rubric[index] };
        rubricItem["text"] = text;
        rubric[index] = rubricItem;
        this.setState({ rubric: rubric });
    };

    handleDeleteRubricItem = (index) => {
        let rubric = [...this.state.rubric];
        rubric.splice(index, 1);
        this.setState({ rubric: rubric });
    };

    handleCancel = () => {
        this.props.history.goBack();
    };

    validate = (question) => {
        let formValid = true;

        function setValid(elementId, isValid) {
            document
                .getElementById(elementId)
                .classList.toggle("is-invalid", !isValid);
            if (!isValid) formValid = false;
        }

        setValid("question-edit-text", question.questionText.length > 0);
        if (question.hasCodeField) {
            setValid("question-edit-code", question.code.length > 0);
        }
        if (question.questionType === "Multiple Choice") {
            if (question.answerChoices.length === 0) {
                setValid("question-edit-mc", false);
            } else {
                if (question.correct == null) {
                    setValid("question-edit-mc-correct", false);
                }
                question.answerChoices.forEach((text, index) =>
                    setValid("question-edit-mc-" + index, text.length > 0)
                );
            }
        } else {
            if (question.rubric.length === 0) {
                setValid("question-edit-rubric", false);
            } else {
                question.rubric.forEach((item, index) => {
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
    };

    handleSave = () => {
        let question = {
            id: this.state.id,
            hasCodeField: this.state.hasCodeField,
            hasAnswerField: this.state.hasAnswerField,
            questionType: this.state.questionType,
            questionText: this.state.questionText,
            highlights: this.state.highlights,
        };
        if (this.state.hasCodeField) {
            question["code"] = this.state.code;
        }
        switch (this.state.questionType) {
            case "Comment":
                question["answers"] = this.state.highlights.map(() => "");
            // fall through
            case "Highlight":
                question["rubric"] = this.state.rubric;
                break;
            case "Multiple Choice":
                Object.assign(question, {
                    answerChoices: this.state.answerChoices,
                    correct: this.state.correct,
                });
                break;
            default:
                return;
        }

        if (!this.validate(question)) return;

        if (this.props.newQuestion) {
            this.props.onAddQuestion(question);
        } else {
            this.props.onEditQuestion(question);
        }
        this.props.history.push("/questions");
    };

    render() {
        const questionTypes = ["Comment", "Highlight", "Multiple Choice"];
        return (
            <React.Fragment>
                <ResizeTextareas />

                <div className="row">
                    <div className="col">
                        <h1>
                            {this.props.newQuestion
                                ? "New Question"
                                : "Edit Question"}
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
                    {questionTypes.map((questionType) => {
                        const idFor = "type-" + questionType.toLowerCase();
                        return (
                            <React.Fragment key={questionType}>
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="question-type"
                                    id={idFor}
                                    checked={
                                        questionType === this.state.questionType
                                    }
                                    onChange={() =>
                                        this.handleQuestionType(questionType)
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
                    })}
                </div>

                <QuestionTextField
                    editMode={true}
                    question={this.state}
                    onTextChange={this.handleTextChange}
                />

                {this.state.canToggleCodeField && (
                    // todo: can change this into a toggle button instead of a checkbox
                    <div
                        className="form-check form-check-inline"
                        style={{ marginLeft: "10px" }}
                    >
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="hasCodeField"
                            defaultChecked={this.state.hasCodeField}
                            onChange={this.handleToggleCodeField}
                        />
                        <label
                            className="form-check-label"
                            htmlFor="hasCodeField"
                        >
                            Include code field
                        </label>
                    </div>
                )}
                {this.state.hasCodeField && (
                    <CodeField
                        editMode={true}
                        question={this.state}
                        onCodeChange={this.handleCodeChange}
                        onAddHighlight={this.handleAddHighlight}
                        onDeleteHighlight={this.handleDeleteHighlight}
                        onClearHighlights={this.handleClearHighlights}
                    />
                )}

                {this.state.hasAnswerField && (
                    <AnswerField
                        editMode={true}
                        question={this.state}
                        onClearHighlights={this.handleClearHighlights}
                        onChangeHighlightText={this.handleChangeHighlightText}
                        onDeleteHighlight={this.handleDeleteHighlight}
                        onAddAnswerChoice={this.handleAddAnswerChoice}
                        onChangeAnswerChoice={this.handleChangeAnswerChoice}
                        onDeleteAnswerChoice={this.handleDeleteAnswerChoice}
                        onSetCorrectAnswerChoice={
                            this.handleSetCorrectAnswerChoice
                        }
                    />
                )}

                {this.state.questionType !== "Multiple Choice" && (
                    <div className="row">
                        <div className="col">
                            <RubricField
                                editMode={true}
                                question={this.state}
                                onAddRubricItem={this.handleAddRubricItem}
                                onChangeRubricItemPoints={
                                    this.handleChangeRubricItemPoints
                                }
                                onChangeRubricItemText={
                                    this.handleChangeRubricItemText
                                }
                                onDeleteRubricItem={this.handleDeleteRubricItem}
                            />
                        </div>
                        <div className="col">
                            <RubricField preview={true} question={this.state} />
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="button"
                        className="btn btn-danger m-2"
                        onClick={this.handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-success m-2"
                        onClick={this.handleSave}
                    >
                        Save
                    </button>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(QuestionEditView);
