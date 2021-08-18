import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Title, UserEmail } from "../shared";
import { getAnswered, getQuestionVersion } from "../api";
import QuestionView from "./questionView";
import RubricField from "./rubricField";

export default function AnsweredView({ trainee, assessor, hideRubric }) {
    const [invalid, setInvalid] = useState(false);
    const [answered, setAnswered] = useState(null);
    const [question, setQuestion] = useState(null);

    const { answeredId } = useParams();

    useEffect(() => {
        getAnswered(answeredId, (a) => {
            if (!a) {
                setInvalid(true);
                return;
            }
            setAnswered(a);
            getQuestionVersion(a.questionId, a.version, (q) => {
                // assume `q` must exist
                setQuestion(q);
            });
        });
    }, [answeredId]);

    if (invalid) {
        return <h1>Invalid question</h1>;
    }

    if (!question) {
        return <p>Getting answered...</p>;
    }

    if (trainee && trainee.id !== answered.traineeId) {
        return (
            <React.Fragment>
                <h1>Sorry! Access Denied</h1>
                <p>Trainees can only view their own answered questions.</p>
            </React.Fragment>
        );
    }

    let rubricField = null;
    let gradeButton = null;
    if (question.questionType !== "Multiple Choice") {
        if (answered.graded) {
            // if already graded, show the rubric
            rubricField = (
                <RubricField rubric={answered.rubric} noChange={true} />
            );
            // if same assessor, let them "regrade"
            if (assessor && assessor.id === answered.assessorId) {
                const link = "/grading/" + answered.id;
                gradeButton = (
                    <Link to={link}>
                        <button type="button" className="btn btn-success m-2">
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
                    className="btn btn-success m-2"
                    disabled={disabled}
                >
                    Grade
                </button>
            );
            if (!disabled) {
                const link = "/grading/" + answered.id;
                gradeButton = <Link to={link}>{gradeButton}</Link>;
            }
        } else if (!hideRubric) {
            rubricField = (
                <RubricField rubric={answered.rubric} noChange={true} />
            );
        }
    }

    let traineeStr = "Trainee: ";
    if (trainee && trainee.id === answered.traineeId) {
        traineeStr += trainee.email;
    } else if (assessor && assessor.id === answered.traineeId) {
        traineeStr += assessor.email;
    } else {
        traineeStr = (
            <UserEmail userId={answered.traineeId} label={"Trainee"} />
        );
    }
    let assessorStr = "Assessor: ";
    if (answered.graded) {
        if (answered.autograded) {
            assessorStr += "Auto-graded";
        } else if (assessor && assessor.id === answered.assessorId) {
            assessorStr += assessor.email;
        } else if (trainee && trainee.id === answered.assessorId) {
            assessorStr += trainee.email;
        } else {
            assessorStr = (
                <UserEmail userId={answered.assessorId} label={"Assessor"} />
            );
        }
    } else {
        assessorStr += "Ungraded";
    }
    let score = null;
    if (answered.graded) {
        score = <div>Score: {answered.score}</div>;
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
            <Title title="Answered" />
            <div>{traineeStr}</div>
            <div>{assessorStr}</div>
            {score}
            {gradeButton}
            {field}
        </React.Fragment>
    );
}
