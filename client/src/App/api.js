// API functions

function getRequest(route) {
    return fetch(route).then((res) => res.json());
}

function postRequest(route, data) {
    return fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then((res) => res.json());
}

export function getAllQuestions(callback = null) {
    getRequest("/api/getAllQuestions").then((questions) => {
        console.log("got all questions:", questions);
        if (callback) callback(questions);
    });
}

export function getQuestion(questionId, callback = null) {
    getRequest(`/api/getQuestion/${questionId}`).then((question) => {
        console.log("got question:", question);
        if (callback) callback(question);
    });
}

export function updateQuestion(question, callback = null) {
    const action = question.id ? "Edit" : "Add";
    postRequest("/api/updateQuestion", question).then((res) => {
        console.log(`${action}ed question ${res.id}`);
        if (callback) callback(res);
    });
}

export function deleteQuestion(questionId, callback = null) {
    getRequest(`/api/deleteQuestion/${questionId}`).then((question) => {
        console.log("Deleted question:", question);
        if (callback) callback(question);
    });
}

export function getAllAnswered(callback = null) {
    getRequest("/api/getAllAnswered").then((answered) => {
        console.log("got all answered");
        if (callback) callback(answered);
    });
}

export function getAnswered(trainee, questionId, callback = null) {
    const route = `/api/getAnswered/${trainee}/${questionId}`;
    getRequest(route).then((question) => {
        console.log(`got question ${questionId} for trainee ${trainee}`);
        if (callback) callback(question);
    });
}

export function updateAnswered(question, callback = null) {
    const log = `updated answered for question ${question.id} and trainee ${question.trainee}`;
    postRequest("/api/updateAnswered", question).then((res) => {
        console.log(log);
        if (callback) callback(res);
    });
}
