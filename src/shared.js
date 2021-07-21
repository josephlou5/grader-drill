export function textareaSizing() {
    const textareas = document.querySelectorAll(".textarea");
    for (const textarea of textareas) {
        dynamicResizing({ target: textarea });
    }
}

export function dynamicResizing(event) {
    const element = event.target;
    if (element.scrollHeight === element.clientHeight) {
        // extra space on the bottom
        element.style.height = "1em";
    }
    element.style.height = element.scrollHeight + "px";
}

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
