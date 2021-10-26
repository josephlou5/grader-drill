import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { useMountEffect, Title, DueDate, ButtonHelp } from "app/shared";
import {
    getAnswered,
    getAllDrillsAndAnswered,
    getAssessorUngraded,
    getQuestionVersion,
    updateAnswered,
} from "app/api";
import { QuestionView, RubricField } from "../question";

export default function GradingView(props) {
    let gradeField;
    if (props.specificQuestion) {
        gradeField = <GradeSpecific {...props} />;
    } else {
        gradeField = <ChooseDrill {...props} />;
    }
    return (
        <React.Fragment>
            <Title title="Grading" />
            <h1>Grading</h1>
            {gradeField}
        </React.Fragment>
    );
}

function GradeSpecific({ assessor, specificQuestion, answeredId }) {
    const [invalid, setInvalid] = useState(false);
    const [alreadyGraded, setAlreadyGraded] = useState(false);
    const [answered, setAnswered] = useState(null);
    const [question, setQuestion] = useState(null);

    useMountEffect(() => {
        // get the specified answered
        getAnswered(answeredId).then((answered) => {
            if (!answered) {
                setInvalid(true);
                return;
            }
            setAnswered(answered);
            if (answered.graded && assessor.id !== answered.assessorId) {
                // question was graded by someone else,
                // so this assessor can't grade it
                setAlreadyGraded(true);
                return;
            }
            // get question
            getQuestionVersion(answered.questionId, answered.version).then(
                (question) => {
                    if (!question) {
                        // question id & version should exist,
                        // so either answered is invalid
                        // or user not authenticated
                        setInvalid(true);
                    } else {
                        setQuestion(question);
                    }
                }
            );
        });
    });

    if (invalid) {
        return <p>Invalid question</p>;
    }
    if (alreadyGraded) {
        const link = "/answered/" + answered.id;
        return <Redirect to={link} />;
    }

    if (!answered || !question) {
        return <p>Getting answered...</p>;
    }

    return (
        <GradeQuestion
            assessor={assessor}
            answered={answered}
            question={question}
            specificQuestion={specificQuestion}
        />
    );
}

function ChooseDrill({ assessor }) {
    const [gradeAll, setGradeAll] = useState(false);
    const [drills, setDrills] = useState(null);
    const [drill, setDrill] = useState(null);

    useEffect(() => {
        if (drills || drill) return;
        getAllDrillsAndAnswered().then((drills) => {
            drills.forEach((drill, index) => {
                // get the ungraded answered
                const ungraded = [];
                for (const traineeDrill of drill.TraineeDrills) {
                    for (const a of traineeDrill.Answereds) {
                        if (a.graded) continue;
                        if (a.traineeId === assessor.id) continue;
                        ungraded.push(a);
                    }
                }
                console.log("before sort:", ungraded);
                ungraded.sort((a, b) => {
                    if (a.questionId !== b.questionId) {
                        return a.questionId - b.questionId;
                    } else if (a.version !== b.version) {
                        return a.version - b.version;
                    } else {
                        return 0;
                    }
                });
                console.log("ungraded:", ungraded);
                Object.assign(drills[index], {
                    ungraded,
                    numUngraded: ungraded.length,
                });
            });
            setDrills(drills);
        });
    });

    if (!drills) {
        return <p>Getting drills...</p>;
    }

    function handleGlobalTraining() {
        setGradeAll(true);
    }

    function handleBackToChoose() {
        if (gradeAll) setGradeAll(false);
        if (drill) setDrill(null);
        setDrills(null);
    }

    if (gradeAll) {
        return <GradeAll assessor={assessor} onBack={handleBackToChoose} />;
    }

    if (drill) {
        return (
            <Grading
                assessor={assessor}
                ungraded={drill.ungraded}
                onBack={handleBackToChoose}
            />
        );
    }

    function handleChooseDrill(traineeDrill) {
        setDrill(traineeDrill);
    }

    const choices = [];
    choices.push(
        <div key="global" className="card col-2 m-2">
            <div className="card-body">
                <h5 className="card-title">Grade all</h5>
                <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={handleGlobalTraining}
                >
                    Grade
                </button>
            </div>
        </div>
    );
    drills.forEach((drill) => {
        const { numUngraded } = drill;
        let gradeButton = null;
        if (numUngraded > 0) {
            gradeButton = (
                <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={() => handleChooseDrill(drill)}
                >
                    Grade
                </button>
            );
        }
        choices.push(
            <div key={drill.id} className="card col-2 m-2">
                <div className="card-body">
                    <h5 className="card-title">{drill.name}</h5>
                    <div className="card-text">
                        Due date: <DueDate drill={drill} />
                    </div>
                    <div className="card-text">Num ungraded: {numUngraded}</div>
                    {gradeButton}
                </div>
            </div>
        );
    });

    return (
        <React.Fragment>
            <h2>Choose drill</h2>
            <div className="row">{choices}</div>
        </React.Fragment>
    );
}

function GradeAll({ assessor, onBack }) {
    const [ungraded, setUngraded] = useState(null);

    useMountEffect(() => {
        getAssessorUngraded().then((ungraded) => {
            setUngraded(ungraded);
        });
    });

    if (!ungraded) {
        return <p>Getting ungraded...</p>;
    }

    return <Grading assessor={assessor} ungraded={ungraded} onBack={onBack} />;
}

function Grading({ assessor, ungraded, onBack }) {
    const [index, setIndex] = useState(0);
    const [needsAnswered, setNeedsAnswered] = useState(true);
    const [answered, setAnswered] = useState(null);

    const noMoreAnswered = needsAnswered && index >= ungraded.length;

    useEffect(() => {
        if (noMoreAnswered) return;
        if (!needsAnswered) return;
        // get the next ungraded question
        const q = ungraded[index];
        let message = "index: " + index;
        // get question
        let getQuestion = null;
        if (
            answered &&
            answered.question &&
            answered.question.id === q.questionId &&
            answered.question.version === q.version
        ) {
            message += "; question exists";
            console.log(message);
            getQuestion = new Promise((resolve) => resolve(answered.question));
        } else {
            // question id & version should exist,
            // so either answered was not from the app
            // or not authenticated
            getQuestion = getQuestionVersion(q.questionId, q.version);
            if (getQuestion) {
                message += "; got question";
                console.log(message);
            } else {
                message += "; question was invalid";
                console.log(message);
            }
        }
        getQuestion.then((question) => {
            if (question) {
                setNeedsAnswered(false);
                setAnswered({
                    answered: q,
                    question,
                });
            }
            setIndex(index + 1);
        });
    });

    if (noMoreAnswered) {
        return (
            <React.Fragment>
                <p>Nothing to grade!</p>
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={onBack}
                >
                    Back
                </button>
            </React.Fragment>
        );
    }

    if (needsAnswered || !(answered?.answered && answered?.question)) {
        return <p>Getting answered...</p>;
    }

    function handleNextQuestion() {
        setNeedsAnswered(true);
    }

    return (
        <GradeQuestion
            assessor={assessor}
            answered={answered.answered}
            question={answered.question}
            onBack={onBack}
            onNextQuestion={handleNextQuestion}
        />
    );
}

function TraineeInfo({ answered }) {
    const [anonymous, setAnonymous] = useState(true);

    function handleToggleAnonymous() {
        setAnonymous(!anonymous);
    }

    // could turn this into a toggle button instead of a checkbox
    const anonymousToggle = (
        <div className="form-check form-check-inline">
            <input
                type="checkbox"
                className="form-check-input"
                id="anonymousCheckbox"
                checked={anonymous}
                onChange={handleToggleAnonymous}
            />
            <label className="form-check-label" htmlFor="anonymousCheckbox">
                Anonymous
            </label>
        </div>
    );

    let traineeStr = "Trainee: ";
    if (anonymous) {
        traineeStr += "Anonymous";
    } else {
        traineeStr += answered.Trainee.User.username;
    }

    return (
        <React.Fragment>
            {anonymousToggle}
            <div>{traineeStr}</div>
        </React.Fragment>
    );
}

function GradeQuestion({
    assessor,
    answered,
    question,
    specificQuestion,
    onBack,
    onNextQuestion,
}) {
    const [checked, setChecked] = useState(answered.rubric);
    const [score, setScore] = useState(
        answered.graded || answered.score ? answered.score : 0
    );

    const { rubric } = question;

    // event handlers

    function handleCheckChange(index) {
        const updated = [...checked];
        updated[index] = !updated[index];
        setChecked(updated);
        const multiplier = updated[index] ? 1 : -1;
        setScore(score + multiplier * rubric[index].points);
    }

    function handleNext() {
        onNextQuestion();
    }

    function handleSave() {
        const savedQuestion = {
            ...answered,
            rubric: checked,
            score,
        };
        updateAnswered(savedQuestion);
    }

    const buttons = [];
    if (onBack) {
        buttons.push({
            variant: "danger",
            onClick: onBack,
            text: "Back",
        });
    }
    buttons.push({
        variant: "success",
        onClick: handleSave,
        text: "Save",
    });
    if (!specificQuestion) {
        buttons.push({
            variant: "warning",
            onClick: handleNext,
            text: "Next",
        });
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <TraineeInfo answered={answered} />
                <div>Assessor: {assessor.username}</div>
                <div className="col-6">
                    <QuestionView
                        answered={answered}
                        question={question}
                        noChange={true}
                    />
                </div>
                <div className="col-6">
                    {"Score: " + score}
                    <RubricField
                        rubric={rubric}
                        checked={checked}
                        onCheckChange={handleCheckChange}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-6"></div>
                <div className="col-6">
                    {buttons.map(({ variant, onClick, text }) => (
                        <button
                            key={text}
                            type="button"
                            className={"btn btn-" + variant + " m-1"}
                            onClick={onClick}
                        >
                            {text}
                        </button>
                    ))}
                    <Link to="/dashboard">
                        <button type="button" className="btn btn-light m-1">
                            Done
                        </button>
                    </Link>
                    <ButtonHelp
                        help={[
                            '"Back" goes back to the drills without saving.',
                            '"Save" saves the current state of grading this question (but doesn\'t go anywhere).',
                            !specificQuestion &&
                                '"Next" goes to the next question without saving.',
                            '"Done" redirects back to the Dashboard without saving.',
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
