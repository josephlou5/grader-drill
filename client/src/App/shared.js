import { useEffect } from "react";

function dynamicResizing(element) {
    if (element.scrollHeight === element.clientHeight) {
        // extra space on the bottom, so reset height
        element.style.height = "1px";
    }
    element.style.height = element.scrollHeight + "px";
}

// SFC to automatically resize all textareas
export const ResizeTextareas = () => {
    useEffect(() => {
        document
            .querySelectorAll(".textarea")
            .forEach((e) => dynamicResizing(e));
    });
    // component doesn't render anything
    return null;
};

export function preventEnter(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
    }
}

export function resetValid(element) {
    element.classList.remove("is-invalid");
}

export function resetValidId(elementId) {
    resetValid(document.getElementById(elementId));
}
