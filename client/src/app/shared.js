import React, { useState, useEffect } from "react";
import { getQuestionVersion } from "./api.js";

export function useMountEffect(callback) {
    // eslint-disable-next-line
    useEffect(callback, []);
}

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
    return null;
}

// component to display a possibly expired due date
export function DueDate({ drill, completedAt = null }) {
    const { dueDate, expired } = drill;
    if (completedAt || !expired) return dueDate;
    return <span className="text-danger">{dueDate}</span>;
}

// component to load a question's type
export function QuestionType({ questionId, version }) {
    const [{ loading, question }, setState] = useState({
        loading: true,
    });

    useEffect(() => {
        getQuestionVersion(questionId, version).then((question) => {
            setState({ question });
        });
    }, [questionId, version]);

    if (loading) {
        return "Loading...";
    } else if (!question) {
        return "Invalid question";
    } else {
        return question.questionType;
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

// component for providing help messages for buttons
export function ButtonHelp({ help }) {
    const [show, setShow] = useState(false);

    const button = (
        <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShow(!show)}
        >
            {show ? "Hide" : "Help"}
        </button>
    );

    let helpMsg = null;
    if (show) {
        helpMsg = help.map((text, index) => {
            if (!text) return null;
            return <div key={index}>{text}</div>;
        });
    }

    return (
        <div className="mt-1">
            {button}
            {helpMsg}
        </div>
    );
}

export function collapseToggle(elementId) {
    return () => {
        document.getElementById(elementId).classList.toggle("d-none");
    };
}

export function setValid(element, isValid) {
    element.classList.toggle("is-invalid", !isValid);
}

export function setElementValid(elementId, isValid) {
    setValid(document.getElementById(elementId), isValid);
}

export function resetValid(element) {
    element.classList.remove("is-invalid");
}

export function resetValidId(elementId) {
    resetValid(document.getElementById(elementId));
}

// returns true if any tag in `questionTags` is in `drillTags`
export function hasTags(drillTags, questionTags) {
    if (drillTags.length === 0 || questionTags.length === 0) return true;
    for (const tag of questionTags) {
        if (drillTags.includes(tag)) return true;
    }
    return false;
}

// returns true if any tag in `filterTags`
// are substrings of any tag in `questionTags`
export function hasTagsSubstring(questionTags, filterTags) {
    if (filterTags.length === 0) return true;
    // there are filters but this question has no tags, so automatically false
    if (questionTags.length === 0) return false;
    let numSearched = 0;
    for (const tag1 of filterTags) {
        if (tag1 === "") continue;
        for (const tag2 of questionTags) {
            if (tag2.includes(tag1)) return true;
        }
        numSearched++;
    }
    return numSearched === 0;
}
