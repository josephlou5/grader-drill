import React, { useState, useEffect } from "react";
import { Title, DueDate, hasTags } from "app/shared";
import {
    getTraineeAnswered,
    getAllQuestions,
    addAnswered,
    getDrillByTrainee,
    traineeDrillProgress,
} from "app/api";
import { QuestionView } from "../question";

export default function TrainingView(props) {
    return (
        <React.Fragment>
            <Title title="Training" />
            <h1>Training</h1>
            <ChooseDrill {...props} />
        </React.Fragment>
    );
}

function ChooseDrill() {
    const [drills, setDrills] = useState(null);
    const [drill, setDrill] = useState(null);

    useEffect(() => {
        if (drills || drill) return;
        getDrillByTrainee((d) => setDrills(d));
    });

    if (!drills) {
        return <p>Getting drills...</p>;
    }

    if (drills.length === 0) {
        return <p>No drills!</p>;
    }

    function handleBackToChoose() {
        setDrill(null);
    }

    function handleDrillDone() {
        setDrills(null);
        setDrill(null);
    }

    if (drill) {
        let backButton = null;
        if (drills.length > 1) {
            backButton = (
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleBackToChoose}
                >
                    Back
                </button>
            );
        }
        return (
            <TrainDrill
                traineeDrill={drill}
                backButton={backButton}
                onDrillDone={handleDrillDone}
            />
        );
    }

    function handleChooseDrill(traineeDrill) {
        setDrill(traineeDrill);
    }

    if (drills.length === 1) {
        const traineeDrill = drills[0];
        if (!traineeDrill.completedAt && !traineeDrill.Drill.expired) {
            handleChooseDrill(traineeDrill);
            return <p>Redirecting to drill...</p>;
        }
    }

    const choices = drills.map((traineeDrill) => {
        const { completedAt, completedDate, progress } = traineeDrill;
        const drill = traineeDrill.Drill;

        let statusOrAction;
        if (completedAt) {
            statusOrAction = (
                <div className="card-text">Completed: {completedDate}</div>
            );
        } else if (drill.expired) {
            statusOrAction = (
                <div className="card-text text-danger">Expired</div>
            );
        } else {
            statusOrAction = (
                <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={() => handleChooseDrill(traineeDrill)}
                >
                    Train
                </button>
            );
        }
        return (
            <div key={traineeDrill.id} className="card col-2 m-2">
                <div className="card-body">
                    <h5 className="card-title">{drill.name}</h5>
                    <div className="card-text">
                        Due date:{" "}
                        <DueDate drill={drill} completedAt={completedAt} />
                    </div>
                    <div className="card-text">
                        Num questions: {drill.numQuestions}
                    </div>
                    <div className="card-text">Progress: {progress}</div>
                    {statusOrAction}
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

function TrainDrill({ traineeDrill, backButton, onDrillDone }) {
    const [localProgress, setProgress] = useState(traineeDrill.progress);

    function handleProgress() {
        setProgress(localProgress + 1);
    }

    const drill = traineeDrill.Drill;

    return (
        <React.Fragment>
            <div>
                <h3>Drill: {drill.name}</h3>
                <p>
                    Progress: {localProgress} / {drill.numQuestions}
                </p>
            </div>
            <TrainQuestion
                traineeDrill={traineeDrill}
                backButton={backButton}
                onDrillDone={onDrillDone}
                onProgress={handleProgress}
            />
        </React.Fragment>
    );
}

function TrainQuestion({ traineeDrill, backButton, onDrillDone, onProgress }) {
    const [needsQuestion, setNeedsQuestion] = useState(true);
    const [question, setQuestion] = useState(null);
    const [noMoreQuestions, setNoMoreQuestions] = useState(false);

    const traineeDrillId = traineeDrill.id;
    const drill = traineeDrill.Drill;
    const drillId = drill.id;

    useEffect(() => {
        if (noMoreQuestions) return;
        if (!needsQuestion) return;

        getTraineeAnswered((answered) => {
            // the ids of the questions already answered by this trainee
            const answeredIds = new Set(answered.map((q) => q.questionId));
            getAllQuestions((questions) => {
                // find the next question not answered by this trainee
                for (const q of questions) {
                    if (answeredIds.has(q.id)) continue;
                    // fits the drill requirements
                    if (!hasTags(drill.tags, q.tags)) continue;
                    // if questions were skipped, don't answer them again
                    if (question && q.id <= question.id) continue;
                    setNeedsQuestion(false);
                    setQuestion(q);
                    return;
                }
                // no more questions to answer
                setNoMoreQuestions(true);
            });
        });
    });

    if (noMoreQuestions) {
        return <p>No more questions!</p>;
    }

    if (needsQuestion || !question) {
        return <p>Getting question...</p>;
    }

    function handleNext() {
        setNeedsQuestion(true);
    }

    function handleSubmit(q) {
        // update drill progress
        traineeDrillProgress(traineeDrillId, (d) => {
            if (!d) return;
            let callback;
            if (d.completedAt) {
                onDrillDone();
                callback = null;
            } else {
                onProgress();
                callback = handleNext;
            }
            // add answered
            const answered = {
                ...q,
                questionId: q.id,
                traineeDrillId,
                drillId,
            };
            addAnswered(answered, callback);
        });
    }

    return (
        <QuestionView
            question={question}
            backButton={backButton}
            onSubmit={handleSubmit}
            onSkip={handleNext}
        />
    );
}
