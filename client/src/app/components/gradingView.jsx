import React, { useState, useEffect } from "react";
import { useHistory, Link, Redirect } from "react-router-dom";
import { useMountEffect, Title } from "../shared";
import {
    getAnswered,
    getAssessorUngraded,
    getQuestionVersion,
    updateAnswered,
} from "../api";
import QuestionView from "./questionView";
import RubricField from "./rubricField";

export default function GradingView(props) {
    return (
        <React.Fragment>
            <Title title="Grading" />
            <h1>Grading</h1>
            <Grading {...props} />
        </React.Fragment>
    );
}

function Grading({ assessor, specificQuestion, answeredId }) {
    const [invalid, setInvalid] = useState(false);
    const [alreadyGraded, setAlreadyGraded] = useState(false);
    const [noMoreQuestions, setNoMoreQuestions] = useState(false);
    const [answered, setAnswered] = useState(null);
    const [question, setQuestion] = useState(null);

    useMountEffect(() => {
        if (!specificQuestion) return;
        // get the specified answered
        getAnswered(answeredId, (answered) => {
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
            getQuestionVersion(answered.questionId, answered.version, (q) =>
                setQuestion(q)
            );
        });
    });

    useEffect(() => {
        if (specificQuestion) return;
        if (noMoreQuestions) return;
        if (answered) return;
        // get the next ungraded question
        getAssessorUngraded((ungraded) => {
            for (const q of ungraded) {
                // if questions were skipped, don't grade them again
                if (answered && q.id <= answered.id) continue;
                setAnswered(q);
                // get question
                if (
                    question &&
                    question.id === q.questionId &&
                    question.version === q.version
                )
                    return;
                getQuestionVersion(q.questionId, q.version, (question) =>
                    setQuestion(question)
                );
                return;
            }
            // no more to grade
            setNoMoreQuestions(true);
        });
    });

    if (invalid) {
        return <p>Invalid question</p>;
    } else if (alreadyGraded) {
        const link = "/answered/" + answered.id;
        return <Redirect to={link} />;
    }

    if (noMoreQuestions) {
        return <p>Nothing to grade!</p>;
    }

    if (!answered || !question) {
        return <p>Getting answered...</p>;
    }

    function handleNextQuestion() {
        setAnswered(null);
    }

    return (
        <GradeQuestion
            assessor={assessor}
            answered={answered}
            question={question}
            specificQuestion={specificQuestion}
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
        traineeStr += answered.Trainee.User.email;
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
    onNextQuestion,
}) {
    const [rubric, setRubric] = useState(answered.rubric);
    const [score, setScore] = useState(
        answered.graded || answered.score ? answered.score : 0
    );

    const history = useHistory();

    // event handlers

    function handleCheckChange(index) {
        const checked = !rubric[index].checked;
        const multiplier = checked ? 1 : -1;
        setRubric(
            rubric.map((item, i) => {
                if (i === index) {
                    return { ...item, checked };
                } else {
                    return item;
                }
            })
        );
        setScore(score + multiplier * rubric[index].points);
    }

    function handleCancel() {
        history.goBack();
    }

    function handleNext() {
        onNextQuestion();
    }

    function handleSave() {
        const savedQuestion = {
            ...answered,
            rubric,
            score,
        };
        updateAnswered(savedQuestion);
    }

    const buttons = [
        {
            variant: "danger",
            onClick: handleCancel,
            text: "Cancel",
        },
        {
            variant: "success",
            onClick: handleSave,
            text: "Save",
        },
    ];
    if (!specificQuestion) {
        buttons.push({
            variant: "secondary",
            onClick: handleNext,
            text: "Skip",
        });
        buttons.push({
            variant: "warning",
            onClick: () => {
                handleSave();
                handleNext();
            },
            text: "Next",
        });
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <TraineeInfo answered={answered} />
                <div>Assessor: {assessor.email}</div>
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
                        onCheckChange={handleCheckChange}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-6"></div>
                <div className="col-6">
                    {buttons.map(({ variant, onClick, text }, index) => (
                        <button
                            key={index}
                            type="button"
                            className={"btn btn-" + variant + " m-2"}
                            onClick={onClick}
                        >
                            {text}
                        </button>
                    ))}
                    <Link to="/dashboard">
                        <button type="button" className="btn btn-light m-2">
                            Done
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
