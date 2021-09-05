import React, { useState } from "react";

// component for showing tags in tables
export function TagsView({ tags }) {
    const [expanded, setExpanded] = useState(false);

    if (tags.length === 0) {
        return "None";
    } else if (tags.length <= 2) {
        return tags.join(", ");
    }

    function toggleExpanded() {
        setExpanded(!expanded);
    }

    let tagsStr;
    if (expanded) {
        tagsStr = tags.map((tag, index) => <div key={index}>{tag}</div>);
    } else {
        tagsStr = `${tags[0]}, ${tags[1]}, ...`;
    }

    const classes = ["btn btn-sm"];
    if (expanded) {
        classes.push("btn-danger");
    } else {
        classes.push("btn-success", "ms-2");
    }
    const buttonText = expanded ? "Hide" : "More";

    return (
        <React.Fragment>
            {tagsStr}
            <button
                type="button"
                className={classes.join(" ")}
                onClick={toggleExpanded}
            >
                {buttonText}
            </button>
        </React.Fragment>
    );
}

// component to edit the tags of a question or drill
export function EditTags({ tags, onAddTag, onChangeTag, onDeleteTag }) {
    const inputs = tags.map((tag, index) => (
        <div key={index}>
            <input
                type="text"
                className="mb-1"
                placeholder="Tag"
                value={tag}
                onChange={(event) => onChangeTag(index, event.target.value)}
            />
            <button
                type="button"
                className="btn btn-close"
                onClick={() => onDeleteTag(index)}
            />
        </div>
    ));

    return (
        <React.Fragment>
            {inputs}
            <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={onAddTag}
            >
                Add tag
            </button>
        </React.Fragment>
    );
}
