import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title, ResizeTextareas } from "app/shared";
import {
    getQuestionVersions,
    getQuestionAnswered,
    deleteAnswered,
} from "app/api";
import {
    QuestionTextField,
    CodeField,
    AnswerField,
    RubricField,
} from "../question";
import { ExportYAML } from "./shared";

export default function QuestionView() {
    return (
        <React.Fragment>
            <Title title="Question" />
            <Question />
        </React.Fragment>
    );
}

function Question() {
    const [invalid, setInvalid] = useState(false);
    const [versions, setVersions] = useState(null);

    const { questionId } = useParams();

    useEffect(() => {
        getQuestionVersions(questionId).then((questions) => {
            if (!questions || questions.length === 0) {
                setInvalid(true);
                return;
            }
            setVersions(questions);
        });
    }, [questionId]);

    if (invalid) {
        return (
            <React.Fragment>
                <Title title="Invalid Question" />
                <h1>Invalid Question</h1>
            </React.Fragment>
        );
    }

    if (!versions) {
        return (
            <React.Fragment>
                <h1>Question</h1>
                <p>Getting question...</p>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <ShowQuestionVersion questionId={questionId} versions={versions} />
            <AnsweredTable
                questionId={questionId}
                numVersions={versions.length}
            />
        </React.Fragment>
    );
}

function ExportQuestion({ question, numVersions }) {
    const fields = [
        "id",
        "version",
        "questionType",
        "hasCodeField",
        "hasAnswerField",
        "questionText",
    ];
    if (question.hasCodeField) {
        fields.push("code", "highlights");
    }
    if (question.questionType === "Multiple Choice") {
        fields.push("answerChoices", "correct");
    } else {
        fields.push("rubric");
    }
    fields.push("tags");

    const filename = `question${question.id}-version${question.version}.yaml`;

    let buttonText = "Export";
    if (numVersions > 1) {
        buttonText += " This Version";
    }

    return (
        <ExportYAML
            obj={question}
            fields={fields}
            filename={filename}
            button={buttonText}
        />
    );
}

function ShowQuestionVersion({ questionId, versions }) {
    const [version, setVersion] = useState(versions.length);

    function handleChangeVersion(version) {
        setVersion(version);
    }

    let versionChoice = null;
    if (versions.length > 1) {
        versionChoice = [];
        for (let versionNum = 1; versionNum <= versions.length; versionNum++) {
            const idFor = "version" + versionNum;
            versionChoice.push(
                <React.Fragment key={versionNum}>
                    <input
                        type="radio"
                        className="btn-check"
                        name="show-version"
                        id={idFor}
                        checked={versionNum === version}
                        onChange={() => handleChangeVersion(versionNum)}
                    />
                    <label className="btn btn-outline-success" htmlFor={idFor}>
                        {versionNum}
                    </label>
                </React.Fragment>
            );
        }
        versionChoice = (
            <React.Fragment>
                Version:
                <div className="btn-group btn-group-sm ms-1" role="group">
                    {versionChoice}
                </div>
            </React.Fragment>
        );
    }

    const question = versions[version - 1];

    const fieldProps = {
        question,
        noChange: true,
    };
    let questionView = (
        <React.Fragment>
            <p>Question Type: {question.questionType}</p>
            <QuestionTextField {...fieldProps} />
            {question.hasCodeField && <CodeField {...fieldProps} />}
            {question.hasAnswerField && <AnswerField {...fieldProps} />}
        </React.Fragment>
    );
    if (question.questionType !== "Multiple Choice") {
        questionView = (
            <div className="row">
                <div className="col-6">{questionView}</div>
                <div className="col-6">
                    <RubricField rubric={question.rubric} previewMode={true} />
                </div>
            </div>
        );
    }

    const link = "/questions/edit/" + questionId;

    return (
        <React.Fragment>
            <ResizeTextareas />
            <h1>Question {questionId}</h1>
            <div className="mb-2">
                <Link to={link}>
                    <button type="button" className="btn btn-success">
                        Edit question
                    </button>
                </Link>
                <ExportQuestion
                    question={question}
                    numVersions={versions.length}
                />
            </div>
            {versionChoice}
            {questionView}
        </React.Fragment>
    );
}

function AnsweredTable(props) {
    return (
        <React.Fragment>
            <h2>Answered</h2>
            <div>
                These tables show all the answered questions for each version of
                this question.
            </div>
            <AnsweredTables {...props} />
        </React.Fragment>
    );
}

function AnsweredTables({ questionId, numVersions }) {
    const [{ needsAnswered, answered }, setState] = useState({
        needsAnswered: true,
    });

    useEffect(() => {
        if (!needsAnswered) return;
        getQuestionAnswered(questionId).then((answered) => {
            setState({ answered });
        });
    });

    if (!answered) {
        return <p>Getting answered...</p>;
    }

    if (answered.length === 0) {
        return <p>No trainees have answered this question.</p>;
    }

    function handleDeleteAnswered(answeredId) {
        deleteAnswered(answeredId).then(() => {
            setState({ needsAnswered: true, answered });
        });
    }

    const versions = new Array(numVersions);
    for (let i = 0; i < numVersions; i++) {
        versions[i] = [];
    }

    for (const question of answered) {
        const { id: answeredId, version } = question;

        const traineeStr = question.Trainee.User.username;
        const drillName = question.TraineeDrill.Drill.name;

        let assessorStr = "-";
        if (question.autograded) {
            assessorStr = "Auto-graded";
        } else if (question.graded) {
            assessorStr = question.Assessor.User.username;
        }

        const score = question.graded ? "-" : question.score;
        const questionScore = question.maxPoints;

        const link = "/answered/" + answeredId;

        versions[version - 1].push(
            <tr key={answeredId}>
                <th>{versions[version - 1].length + 1}</th>
                <td>{traineeStr}</td>
                <td>{drillName}</td>
                <td>{assessorStr}</td>
                <td>
                    {score} / {questionScore}
                </td>
                <td>
                    <Link to={link}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                        >
                            Question
                        </button>
                    </Link>
                    <button
                        type="button"
                        className="btn btn-danger btn-sm ms-1"
                        onClick={() => handleDeleteAnswered(answeredId)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        );
    }

    return versions.map((answered, index) => {
        let body;
        if (answered.length === 0) {
            body = <p>No answered</p>;
        } else {
            body = (
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th></th>
                            <th>Trainee</th>
                            <th>Drill</th>
                            <th>Assessor</th>
                            <th>Score</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{answered}</tbody>
                </table>
            );
        }

        return (
            <div key={index + 1}>
                {numVersions > 1 && <h3>Version {index + 1}</h3>}
                {body}
            </div>
        );
    });
}
