import React, { useState, useEffect } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { Title, DueDate, hasTags } from "app/shared";
import {
    getTraineeAnswered,
    getAllQuestions,
    addAnswered,
    getDrillsByTrainee,
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

function ChooseDrill({ drillId }) {
    const [drills, setDrills] = useState(null);
    const [drill, setDrill] = useState(null);

    const history = useHistory();

    useEffect(() => {
        if (drills || drill) return;
        getDrillsByTrainee().then((d) => {
            setDrills(d);
        });
    });

    if (!drills) {
        return <p>Getting drills...</p>;
    }

    if (drills.length === 0) {
        return <p>No drills!</p>;
    }

    if (drillId != null) {
        // TODO: if not joined drill yet, automatically join
        for (const traineeDrill of drills) {
            if (traineeDrill.drillId !== drillId) continue;
            function onBack() {
                history.push("/training");
            }
            return (
                <TrainDrill
                    traineeDrill={traineeDrill}
                    onBack={onBack}
                    onDrillDone={onBack}
                />
            );
        }
        return <Redirect to="/training" />;
    }

    function handleBackToChoose() {
        setDrill(null);
    }

    function handleDrillDone() {
        setDrills(null);
        setDrill(null);
    }

    if (drill) {
        return (
            <TrainDrill
                traineeDrill={drill}
                onBack={handleBackToChoose}
                onDrillDone={handleDrillDone}
            />
        );
    }

    function handleChooseDrill(traineeDrill) {
        setDrill(traineeDrill);
    }

    const choices = drills.map((traineeDrill) => {
        const { completedAt, completedDate, progress } = traineeDrill;
        const drill = traineeDrill.Drill;

        let statusOrAction;
        if (completedAt) {
            statusOrAction = (
                <div className="card-text">Completed: {completedDate}</div>
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

function TrainDrill({ traineeDrill, onBack, onDrillDone }) {
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
                onBack={onBack}
                onDrillDone={onDrillDone}
                onProgress={handleProgress}
            />
        </React.Fragment>
    );
}

function TrainQuestion({ traineeDrill, onBack, onDrillDone, onProgress }) {
    const [needsQuestion, setNeedsQuestion] = useState(true);
    const [question, setQuestion] = useState(null);
    const [noMoreQuestions, setNoMoreQuestions] = useState(false);

    const traineeDrillId = traineeDrill.id;
    const drill = traineeDrill.Drill;
    const drillId = drill.id;

    useEffect(() => {
        if (noMoreQuestions) return;
        if (!needsQuestion) return;

        getTraineeAnswered().then((answered) => {
            // the ids of the questions already answered by this trainee
            const answeredIds = new Set(answered.map((q) => q.questionId));
            getAllQuestions().then((questions) => {
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
        traineeDrillProgress(traineeDrillId).then((d) => {
            if (!d) return;
            if (d.completedAt) {
                onDrillDone();
            } else {
                onProgress();
            }
            // add answered
            const answered = {
                ...q,
                questionId: q.id,
                traineeDrillId,
                drillId,
            };
            addAnswered(answered).then(() => {
                if (!d.completedAt) {
                    handleNext();
                }
            });
        });
    }

    return (
        <QuestionView
            question={question}
            onBack={onBack}
            onSubmit={handleSubmit}
            onSkip={handleNext}
        />
    );
}
