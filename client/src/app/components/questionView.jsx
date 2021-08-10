import React, { useState, useEffect } from "react";
import { ResizeTextareas, setElementValid } from "../shared";
import QuestionTextField from "./questionTextField";
import CodeField from "./codeField";
import AnswerField from "./answerField";

export default function QuestionView(props) {
    return (
        <React.Fragment>
            <ResizeTextareas />
            <h1>Question</h1>
            <Question {...props} />
        </React.Fragment>
    );
}

function Question({ answered, question: propsQuestion, noChange, onSubmit }) {
    const [question, setQuestionState] = useState(null);

    function setQuestion(updates) {
        setQuestionState({ ...question, ...updates });
    }

    useEffect(() => {
        const initial = { highlights: [], ...propsQuestion };
        if (propsQuestion.questionType === "Multiple Choice") {
            initial["answer"] = null;
        }
        setQuestionState(initial);
    }, [propsQuestion]);

    if (noChange) {
        // displaying the question in answered view or grading view
        const question = {
            ...propsQuestion,
            highlights: answered.highlights,
        };
        if (propsQuestion.questionType === "Multiple Choice") {
            question["answer"] = answered.answer;
        }
        const fieldProps = {
            question,
            noChange: true,
        };
        return (
            <React.Fragment>
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
        // validate and submit the question

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
            if (!question.highlights.some((h) => h.byUser)) {
                setValid("question-code", false);
            } else {
                question.highlights.forEach((h, index) => {
                    setValid(
                        `highlight-${index}-comment`,
                        h.answer && h.answer.length > 0
                    );
                });
            }
        }

        if (!formValid) return;

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
            <p>Question Type: {question.questionType}</p>
            <QuestionTextField question={question} />
            {question.hasCodeField && <CodeField {...codeFieldProps} />}
            {question.hasAnswerField && <AnswerField {...answerFieldProps} />}
            <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </React.Fragment>
    );
}
