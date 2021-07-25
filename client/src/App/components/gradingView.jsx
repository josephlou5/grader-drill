import React, { useState, useEffect } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { getAllAnswered, getAnswered, updateAnswered } from "../api";
import Question from "./question";
import RubricField from "./rubricField";

export default function GradingView() {
    const [needsQuestion, setNeedsQuestion] = useState(true);
    const [question, setQuestion] = useState(null);
    const [rubric, setRubric] = useState(null);
    const [score, setScore] = useState(0);

    const history = useHistory();

    const { trainee, questionId } = useParams();
    const specificQuestion = !!(trainee && questionId);

    // todo: find out the assessor
    const assessor = "jdlou";

    useEffect(() => {
        if (!needsQuestion) return;

        function processQuestion(q) {
            setNeedsQuestion(false);

            if (!q) {
                setQuestion(null);
                console.log("Invalid question");
                return;
            }

            if (q.graded) {
                setScore(q.score);
                setRubric(q.rubric);
            } else if (q.questionType === "Multiple Choice") {
                if (q.answer === q.correct) {
                    setScore(100);
                }
            } else {
                setRubric(
                    q.rubric.map((item) => {
                        return { ...item, checked: !!item.checked };
                    })
                );
                if (q.score) {
                    setScore(q.score);
                }
            }
            setQuestion(q);
        }

        if (specificQuestion) {
            // get the specified question
            getAnswered(trainee, questionId, processQuestion);
        } else {
            // get the first ungraded question
            getAllAnswered((answered) => {
                const nextUngraded = answered.find(
                    (q) =>
                        // ungraded
                        !q.graded &&
                        // not the same question as the current
                        !(
                            question &&
                            q.trainee === question.trainee &&
                            q.id === question.id
                        )
                );
                processQuestion(nextUngraded);
            });
        }
    });

    if (needsQuestion && !question) {
        return (
            <React.Fragment>
                <h1>Grading</h1>
                <p>Getting question...</p>
            </React.Fragment>
        );
    }

    if (!question) {
        return (
            <React.Fragment>
                <h1>Grading</h1>
                <p>
                    {specificQuestion
                        ? "Invalid question"
                        : "Nothing to grade!"}
                </p>
            </React.Fragment>
        );
    }

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
        setNeedsQuestion(true);
    }

    function handleSave() {
        let savedQuestion = { ...question, assessor, score, graded: true };
        if (question.questionType !== "Multiple Choice") {
            savedQuestion["rubric"] = rubric;
        }
        updateAnswered(savedQuestion);
    }

    let rubricField = null;
    if (question.questionType !== "Multiple Choice") {
        let rubricFieldProps = { question };
        if (question.graded) {
            rubricFieldProps["noChange"] = true;
        } else {
            Object.assign(rubricFieldProps, {
                rubric,
                onCheckChange: handleCheckChange,
            });
        }
        rubricField = <RubricField {...rubricFieldProps} />;
    }

    let buttons = [];
    if (!question.graded) {
        buttons.push({
            variant: "danger",
            onClick: handleCancel,
            text: "Cancel",
        });
        buttons.push({
            variant: "success",
            onClick: handleSave,
            text: "Save",
        });
    }
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
        <React.Fragment>
            <h1>Grading</h1>
            <div className="row">
                <div>Trainee: {question.trainee}</div>
                <div>Assessor: {assessor}</div>
                <div className="col-6">
                    <Question question={question} noChange={true} />
                </div>
                <div className="col-6">
                    {"Score: " + score}
                    {rubricField}
                    <div className="position-absolute bottom-0 d-flex justify-content-center">
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
                        <Link to="/">
                            <button type="button" className="btn btn-light m-2">
                                Done
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
