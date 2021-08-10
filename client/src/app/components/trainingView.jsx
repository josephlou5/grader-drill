import React, { useState, useEffect } from "react";
import { getTraineeAnswered, getAllQuestions, addAnswered } from "../api";
import QuestionView from "./questionView";

export default function TrainingView(props) {
    return (
        <React.Fragment>
            <h1>Training</h1>
            <Training {...props} />
        </React.Fragment>
    );
}

function Training({ trainee }) {
    const [noMoreQuestions, setNoMoreQuestions] = useState(false);
    const [question, setQuestion] = useState(null);

    const traineeId = trainee.id;

    useEffect(() => {
        if (noMoreQuestions) return;
        if (question) return;

        // get all questions answered by this trainee
        getTraineeAnswered(traineeId, (answered) => {
            const answeredIds = new Set(answered.map((q) => q.questionId));

            // get the next question not answered by this trainee
            getAllQuestions((questions) => {
                for (const q of questions) {
                    if (answeredIds.has(q.id)) continue;
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

    if (!question) {
        return <p>Getting question...</p>;
    }

    function handleSubmit(q) {
        const question = { ...q, traineeId, questionId: q.id };
        addAnswered(question, () => {
            setQuestion(null);
        });
    }

    return <QuestionView question={question} onSubmit={handleSubmit} />;
}
