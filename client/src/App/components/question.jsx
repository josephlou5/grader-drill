import React from "react";
import CodeField from "./codeField";
import QuestionTextField from "./questionTextField";
import AnswerField from "./answerField";
import { ResizeTextareas } from "../shared";

export default function Question(props) {
    const { question, noChange } = props;
    if (!question) {
        return <h1>Undefined question</h1>;
    }
    if (question.id == null) {
        return <h1>Invalid question</h1>;
    }

    let codeFieldProps = { question };
    let answerFieldProps = { question };
    if (noChange) {
        codeFieldProps["noChange"] = true;
        answerFieldProps["noChange"] = true;
    } else {
        const {
            onAddHighlight,
            onClearHighlights,
            onDeleteHighlight,
            onAnswerChange,
            onMCSelect,
        } = props;
        Object.assign(codeFieldProps, {
            onAddHighlight,
            onClearHighlights,
        });
        Object.assign(answerFieldProps, {
            onClearHighlights,
            onDeleteHighlight,
            onAnswerChange,
            onMCSelect,
        });
    }

    return (
        <React.Fragment>
            <ResizeTextareas />
            <h1>Question</h1>
            <h3>{question.questionType}</h3>
            <QuestionTextField question={question} />
            {question.hasCodeField && <CodeField {...codeFieldProps} />}
            {question.hasAnswerField && <AnswerField {...answerFieldProps} />}
        </React.Fragment>
    );
}
