import React, { useState, useEffect } from "react";
const yaml = require("js-yaml");

// read contents from YAML file
export function readYAML(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(yaml.load(reader.result));
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsText(file);
    });
}

class ImportFile {
    constructor(name, file, existing, extractFields) {
        this.name = name;
        this.file = file;
        this.filename = file.name;
        this.existing = existing;
        this.extractFields = extractFields;
        this.obj = null;
        this.status = "Importing...";
        this.invalid = false;
    }

    async readFile() {
        const imported = await readYAML(this.file);
        // extract fields from imported
        const [invalid, reason, obj] = this.extractFields(imported);
        if (invalid) {
            this.status = `Invalid ${this.name}: ${reason}`;
            this.invalid = true;
            return;
        }
        // check if imported should replace existing
        if (imported.id == null) {
            this.status = `New ${this.name}`;
        } else if (this.existing.some((e) => e.id === imported.id)) {
            obj.id = imported.id;
            this.status = `Updating ${this.name} ${imported.id}`;
        }
        this.obj = obj;
    }
}

// component for importing obj from YAML
export function ImportYAML({
    name,
    extractFields,
    existing,
    apiImport,
    onRefresh,
}) {
    const [files, setFiles] = useState([]);

    async function handleChooseFiles(event) {
        if (!existing) return;

        const element = event.target;

        // find all YAML files
        const yamlFiles = [];
        for (const file of element.files) {
            if (file.type !== "application/x-yaml") continue;
            yamlFiles.push(new ImportFile(name, file, existing, extractFields));
        }

        // reset input element
        element.value = null;

        if (yamlFiles.length === 0) {
            return;
        }

        // make sure all files are read
        await Promise.all(yamlFiles.map((d) => d.readFile()));

        setFiles([...files, ...yamlFiles]);
    }

    function handleDeleteFile(index) {
        const changed = files.flatMap((file, i) => {
            if (i === index) return [];
            else return [file];
        });
        setFiles(changed);
    }

    function handleImport() {
        const creating = [];
        const imports = {};
        for (const { invalid, obj } of files) {
            if (invalid) continue;
            if (obj.id == null) {
                // new
                creating.push(obj);
            } else {
                // replacing existing
                imports[obj.id] = obj;
            }
        }

        const updating = [];
        for (const id in imports) {
            updating.push(imports[id]);
        }

        if (creating.length === 0 && updating.length === 0) {
            setFiles([]);
            return;
        }

        apiImport({ creating, updating }).then(() => {
            onRefresh();
            setFiles([]);
        });
    }

    function handleCancelImport() {
        setFiles([]);
    }

    return (
        <div className="mb-2">
            <input
                type="file"
                className="d-none"
                id="import-files"
                accept=".yaml,application/x-yaml"
                multiple={true}
                onChange={handleChooseFiles}
            />
            <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                    // simulate click on choose file input
                    document.getElementById("import-files").click();
                }}
            >
                Import Files
            </button>
            <ImportStatusTable
                name={name}
                files={files}
                onDeleteFile={handleDeleteFile}
                onImport={handleImport}
                onCancelImport={handleCancelImport}
            />
        </div>
    );
}

function ImportStatusTable({
    name,
    files,
    onDeleteFile,
    onImport,
    onCancelImport,
}) {
    if (!files || files.length === 0) return null;

    const rows = files.map(({ filename, status }, index) => (
        <tr key={index}>
            <th>{index + 1}</th>
            <td>{filename}</td>
            <td>{status}</td>
            <td>
                <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteFile(index)}
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    return (
        <React.Fragment>
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th></th>
                        <th>File</th>
                        <th>Import Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <button
                type="button"
                className="btn btn-success me-1"
                onClick={onImport}
            >
                Import {name}s
            </button>
            <button
                type="button"
                className="btn btn-danger"
                onClick={onCancelImport}
            >
                Cancel
            </button>
        </React.Fragment>
    );
}

// component for exporting obj to YAML
export function ExportYAML({ obj, fields, filename }) {
    const [downloadUrl, setDownloadUrl] = useState(null);

    useEffect(() => {
        const dumping = {};
        for (const field of fields) {
            dumping[field] = obj[field];
        }
        const data = new Blob([yaml.dump(dumping)], {
            type: "application/x-yaml",
        });
        if (downloadUrl) window.URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(window.URL.createObjectURL(data));
    }, [obj]); // eslint-disable-line

    return (
        <a
            className="btn btn-primary ms-2"
            href={downloadUrl}
            download={filename}
        >
            Export
        </a>
    );
}

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
