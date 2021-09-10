import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ResizeTextareas, ButtonHelp, setElementValid } from "app/shared";
import QuestionTextField from "./questionTextField";
import CodeField from "./codeField";
import AnswerField from "./answerField";

export default function QuestionView(props) {
    return (
        <React.Fragment>
            <h1>Question</h1>
            <Question {...props} />
        </React.Fragment>
    );
}

function Question({
    answered,
    question: propsQuestion,
    noChange,
    onBack,
    onSubmit,
    onSkip,
}) {
    const [question, setQuestionState] = useState(null);

    function setQuestion(updates) {
        setQuestionState({ ...question, ...updates });
    }

    useEffect(() => {
        const question = { ...propsQuestion };
        if (!question.highlights) {
            question.highlights = [];
        }
        if (propsQuestion.questionType === "Multiple Choice") {
            question.answer = null;
        }
        setQuestionState(question);
    }, [propsQuestion]);

    if (noChange) {
        // displaying the question in answered view or grading view
        const question = {
            ...propsQuestion,
            highlights: answered.highlights,
        };
        if (propsQuestion.questionType === "Multiple Choice") {
            question.answer = answered.answer;
        }
        const fieldProps = {
            question,
            noChange: true,
        };
        return (
            <React.Fragment>
                <ResizeTextareas />
                <p>Question Type: {propsQuestion.questionType}</p>
                <QuestionTextField {...fieldProps} />
                {propsQuestion.hasCodeField && <CodeField {...fieldProps} />}
                {propsQuestion.hasAnswerField && (
                    <AnswerField {...fieldProps} />
                )}
            </React.Fragment>
        );
    }

    // trainee is answering the question

    if (!question) {
        return <p>Loading...</p>;
    }

    // event handlers

    function handleAddHighlight(highlight) {
        const highlights = [...question.highlights];
        highlights.push(highlight);
        setQuestion({ highlights });
    }

    function handleDeleteHighlight(highlightIndex) {
        const highlights = [...question.highlights];
        highlights.splice(highlightIndex, 1);
        setQuestion({ highlights });
    }

    function handleClearHighlights() {
        const highlights = question.highlights.filter((h) => !h.byUser);
        setQuestion({ highlights });
    }

    function handleAnswerChange(index, text) {
        const highlights = [...question.highlights];
        highlights[index] = { ...highlights[index], answer: text };
        setQuestion({ highlights });
    }

    function handleMCSelect(index) {
        setQuestion({ answer: index });
    }

    function handleSubmit() {
        // validate
        let formValid = true;

        function setValid(elementId, isValid) {
            setElementValid(elementId, isValid);
            if (!isValid) formValid = false;
        }

        if (question.questionType === "Multiple Choice") {
            if (question.answer == null) {
                setValid("question-mc-choice", false);
            }
        } else {
            if (question.highlights.length === 0) {
                setValid("question-code", false);
            } else if (question.questionType === "Comment") {
                question.highlights.forEach((h, index) => {
                    setValid(
                        `highlight-${index}-comment`,
                        h.answer && h.answer.length > 0
                    );
                });
            }
        }

        if (!formValid) return;

        // submit question
        onSubmit(question);
    }

    const codeFieldProps = {
        question,
        onAddHighlight: handleAddHighlight,
        onDeleteHighlight: handleDeleteHighlight,
        onClearHighlights: handleClearHighlights,
    };
    const answerFieldProps = {
        question,
        onClearHighlights: handleClearHighlights,
        onDeleteHighlight: handleDeleteHighlight,
        onAnswerChange: handleAnswerChange,
        onMCSelect: handleMCSelect,
    };
    return (
        <React.Fragment>
            <ResizeTextareas />

            <p>Question Type: {question.questionType}</p>
            <QuestionTextField question={question} />
            {question.hasCodeField && <CodeField {...codeFieldProps} />}
            {question.hasAnswerField && <AnswerField {...answerFieldProps} />}

            {onBack && (
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={onBack}
                >
                    Back
                </button>
            )}
            <button
                type="button"
                className="btn btn-success m-1"
                onClick={handleSubmit}
            >
                Submit
            </button>
            <button
                type="button"
                className="btn btn-secondary m-1"
                onClick={onSkip}
            >
                Skip
            </button>
            <Link to="/dashboard">
                <button type="button" className="btn btn-light m-1">
                    Done
                </button>
            </Link>
            <ButtonHelp
                help={[
                    onBack && '"Back" goes back to the drills without saving.',
                    '"Submit" submits the question and goes to the next one.',
                    '"Skip" goes to the next question without saving.',
                    '"Done" redirects back to the Dashboard without saving.',
                ]}
            />
        </React.Fragment>
    );
}
