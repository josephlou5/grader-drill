import { useState, useEffect } from "react";
import { getQuestionVersion } from "./api.js";

// component to set the document title
export function Title({ title }) {
    useEffect(() => {
        document.title = title;
    }, [title]);
    return null;
}

function dynamicResizing(element) {
    if (element.scrollHeight === element.clientHeight) {
        // extra space on the bottom, so reset height
        element.style.height = "1px";
    }
    element.style.height = element.scrollHeight + "px";
}

// component to automatically resize all textareas
export function ResizeTextareas() {
    useEffect(() => {
        document
            .querySelectorAll(".textarea")
            .forEach((e) => dynamicResizing(e));
    });
    // component doesn't render anything
    return null;
}

// component to load a question's type
export function QuestionType({ questionId, version }) {
    const [state, setState] = useState({
        loading: true,
        question: null,
    });

    useEffect(() => {
        getQuestionVersion(questionId, version, (question) => {
            setState({
                loading: false,
                question,
            });
        });
    }, [questionId, version]);

    if (state.loading) {
        return "Loading...";
    } else if (!state.question) {
        return "Invalid question";
    } else {
        return state.question.questionType;
    }
}

// component for textareas that disallow line breaks (single line textarea)
export function TextareaLine(props) {
    const updatedProps = { ...props };
    updatedProps.onKeyDown = (event) => {
        // enter key doesn't do anything
        if (event.code === "Enter") {
            event.preventDefault();
        }
        if (props.onKeyDown) props.onKeyDown(event);
    };
    updatedProps.onChange = (event) => {
        // remove all line breaks
        event.target.value = event.target.value.replace("\n", "");
        if (props.onChange) props.onChange(event);
    };
    return <textarea {...updatedProps} />;
}

export function setElementValid(elementId, isValid) {
    document.getElementById(elementId).classList.toggle("is-invalid", !isValid);
}

export function resetValid(element) {
    element.classList.remove("is-invalid");
}

export function resetValidId(elementId) {
    resetValid(document.getElementById(elementId));
}
