import { useState, useEffect } from "react";
import { getUser, getQuestionVersion } from "./api.js";

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

// component to load a user's email
export function UserEmail({ userId, label, dne = "Unknown" }) {
    const [state, setState] = useState({
        loading: true,
        user: null,
    });

    useEffect(() => {
        if (isNaN(userId)) {
            setState({ invalid: true });
            return;
        }
        getUser(userId, (user) => {
            setState({
                loading: false,
                user,
            });
        });
    }, [userId]);

    let pre = "";
    if (label) {
        pre = label + ": ";
    }

    if (state.invalid) {
        return pre + dne;
    } else if (state.loading) {
        return pre + "Loading...";
    } else if (state.user) {
        return pre + state.user.email;
    } else {
        return pre + dne;
    }
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
        if (event.keyCode === 13) {
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
