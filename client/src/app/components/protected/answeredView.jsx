import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title } from "app/shared";
import { getAnswered, getQuestionVersion } from "app/api";
import { QuestionView, RubricField } from "../question";

export default function AnsweredView(props) {
    return (
        <React.Fragment>
            <Title title="Answered" />
            <Answered {...props} />
        </React.Fragment>
    );
}

function Answered({ user }) {
    const admin = user?.role === "Admin" ? user : null;
    const assessor = user?.role === "Assessor" ? user : null;
    const trainee = user?.role === "Trainee" ? user : null;

    const [invalid, setInvalid] = useState(false);
    const [answered, setAnswered] = useState(null);
    const [question, setQuestion] = useState(null);

    const { answeredId } = useParams();

    useEffect(() => {
        getAnswered(answeredId).then((answered) => {
            if (!answered) {
                setInvalid(true);
                return;
            }
            setAnswered(answered);
            getQuestionVersion(answered.questionId, answered.version).then(
                (question) => {
                    setQuestion(question);
                }
            );
        });
    }, [answeredId]);

    if (invalid) {
        return (
            <React.Fragment>
                <Title title="Invalid Answered" />
                <h1>Invalid Answered</h1>
            </React.Fragment>
        );
    }

    if (answered && trainee && trainee.id !== answered.traineeId) {
        return (
            <React.Fragment>
                <Title title="Access Denied" />
                <h1>Sorry! Access Denied</h1>
                <p>Trainees can only view their own answered questions.</p>
            </React.Fragment>
        );
    }

    if (!question) {
        return (
            <React.Fragment>
                <h1>Answered</h1>
                <p>Getting answered...</p>
            </React.Fragment>
        );
    }

    let score = "-";
    if (answered.graded) {
        score = answered.score;
    }

    let rubricField = null;
    let gradeButton = null;
    if (question.questionType !== "Multiple Choice") {
        if (answered.graded) {
            // if already graded, show the rubric
            rubricField = (
                <RubricField
                    rubric={question.rubric}
                    checked={answered.rubric}
                    noChange={true}
                />
            );
            // if same assessor, let them "regrade"
            if (assessor && assessor.id === answered.assessorId) {
                const link = "/grading/" + answered.id;
                gradeButton = (
                    <Link to={link}>
                        <button type="button" className="btn btn-success my-2">
                            Regrade
                        </button>
                    </Link>
                );
            }
        } else if (assessor) {
            // if assessor is viewing the question, give them button to grade it
            // but only if they're not grading themselves
            const disabled = assessor.id === answered.traineeId;
            gradeButton = (
                <button
                    type="button"
                    className="btn btn-success my-2"
                    disabled={disabled}
                >
                    Grade
                </button>
            );
            if (!disabled) {
                const link = "/grading/" + answered.id;
                gradeButton = <Link to={link}>{gradeButton}</Link>;
            }
        } else if (trainee) {
            // trainee doesn't get to see the rubric
        } else {
            rubricField = (
                <RubricField
                    rubric={question.rubric}
                    checked={answered.rubric}
                    noChange={true}
                />
            );
        }
    }

    let field = (
        <QuestionView answered={answered} question={question} noChange={true} />
    );
    if (rubricField) {
        field = (
            <div className="row">
                <div className="col-6">{field}</div>
                <div className="col-6">{rubricField}</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <AnsweredInfo admin={admin} answered={answered} />
            <div>
                Score: {score} / {answered.maxPoints}
            </div>
            {gradeButton}
            {field}
        </React.Fragment>
    );
}

function AnsweredInfo({ admin, answered }) {
    const [anonymous, setAnonymous] = useState(admin ? false : true);

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

    let traineeStr;
    if (anonymous) {
        traineeStr = "Anonymous";
    } else {
        traineeStr = answered.Trainee.User.username;
    }
    let assessorStr;
    if (answered.graded) {
        if (answered.autograded) {
            assessorStr = "Auto-graded";
        } else if (anonymous) {
            assessorStr = "Graded";
        } else {
            assessorStr = answered.Assessor.User.username;
        }
    } else {
        assessorStr = "Ungraded";
    }

    return (
        <React.Fragment>
            {anonymousToggle}
            <div>Trainee: {traineeStr}</div>
            <div>Assessor: {assessorStr}</div>
        </React.Fragment>
    );
}
