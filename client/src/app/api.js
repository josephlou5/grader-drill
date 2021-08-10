const CONSOLE = true;

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

function deleteRequest(route) {
    return fetch(route, {
        method: "DELETE",
    }).then((res) => res.json());
}

// arg checking

function checkNull(arg, callback) {
    if (arg == null) {
        if (callback) callback(null);
        return true;
    }
    return false;
}

function getMsg(requestType, resource) {
    let action;
    switch (requestType) {
        case "get":
            action = "got";
            break;
        case "add":
            action = "added";
            break;
        case "update":
            action = "updated";
            break;
        case "delete":
            action = "deleted";
            break;
        default:
            break;
    }
    if (action) {
        return `${action} ${resource}:`;
    } else {
        return `${resource}:`;
    }
}

function getErrMsg(requestType, resource) {
    let action;
    switch (requestType) {
        case "get":
            action = "getting";
            break;
        case "add":
            action = "adding";
            break;
        case "update":
            action = "updating";
            break;
        case "delete":
            action = "deleting";
            break;
        default:
            break;
    }
    if (action) {
        return `error while ${action} ${resource}:`;
    } else {
        return `error with ${resource}:`;
    }
}

function checkInt(arg, requestType, resource, callback) {
    if (arg == null || isNaN(arg)) {
        if (CONSOLE)
            console.log(
                getErrMsg(requestType, resource),
                `Invalid id "${arg}"`
            );
        if (callback) callback(null);
        return false;
    }
    return true;
}

function checkError(data, requestType, resource) {
    if (!data.error) {
        if (CONSOLE) console.log(getMsg(requestType, resource), data);
        return data;
    } else {
        if (CONSOLE)
            console.log(
                getErrMsg(requestType, resource),
                data.msg || data.message
            );
        return null;
    }
}

// functions

export function getAllUsers(callback = null) {
    getRequest("/api/users").then((users) => {
        if (CONSOLE) console.log("got users:", users);
        if (callback) callback(users);
    });
}

export function getUser(userId, callback = null) {
    if (checkNull(userId, callback)) return;
    if (!checkInt(userId, "get", "user", callback)) return;
    getRequest(`/api/users/${userId}`).then((u) => {
        u = checkError(u, "get", "user");
        if (callback) callback(u);
    });
}

export function addUser(user, callback = null) {
    if (checkNull(user, callback)) return;
    postRequest("/api/users", user).then((u) => {
        u = checkError(u, "add", "user");
        if (callback) callback(u);
    });
}

export function getAllQuestions(callback = null) {
    getRequest("/api/questions").then((questions) => {
        if (CONSOLE) console.log("got all questions:", questions);
        if (callback) callback(questions);
    });
}

export function getQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "get", "question", callback)) return;
    getRequest(`/api/questions/${questionId}`).then((q) => {
        q = checkError(q, "get", "question");
        if (callback) callback(q);
    });
}

export function getQuestionVersion(questionId, version, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (checkNull(version, callback)) return;
    if (!checkInt(questionId, "get", "question version", callback)) return;
    if (!checkInt(version, "get", "question version", callback)) return;
    getRequest(`/api/questions/${questionId}/${version}`).then((q) => {
        q = checkError(q, "get", "question version");
        if (callback) callback(q);
    });
}

export function addQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/api/questions", question).then((q) => {
        q = checkError(q, "add", "question");
        if (callback) callback(q);
    });
}

export function updateQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    postRequest(`/api/questions/${questionId}`, question).then((q) => {
        q = checkError(q, "update", "question");
        if (callback) callback(q);
    });
}

export function updateQuestionVersion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    const { version } = question;
    postRequest(`api/questions/${questionId}/${version}`, question).then(
        (q) => {
            q = checkError(q, "update", "question version");
            if (callback) callback(q);
        }
    );
}

export function deleteQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "delete", "question", callback)) return;
    deleteRequest(`/api/questions/${questionId}`).then((q) => {
        q = checkError(q, "delete", "question");
        if (callback) callback(q);
    });
}

export function getAllAnswered(callback = null) {
    getRequest("/api/answered").then((answered) => {
        if (CONSOLE) console.log("got all answered:", answered);
        if (callback) callback(answered);
    });
}

export function getAnswered(answeredId, callback = null) {
    if (checkNull(answeredId, callback)) return;
    if (!checkInt(answeredId, "get", "answered", callback)) return;
    getRequest(`/api/answered/${answeredId}`).then((q) => {
        q = checkError(q, "get", "answered");
        if (callback) callback(q);
    });
}

export function getTraineeAnswered(traineeId, callback = null) {
    if (checkNull(traineeId, callback)) return;
    if (!checkInt(traineeId, "get", "trainee answered", callback)) return;
    getRequest(`/api/answered/?traineeId=${traineeId}`).then((answered) => {
        if (CONSOLE)
            console.log(`got all answered for trainee ${traineeId}:`, answered);
        if (callback) callback(answered);
    });
}

export function getAssessorGraded(assessorId, callback = null) {
    if (checkNull(assessorId, callback)) return;
    if (!checkInt(assessorId, "get", "assessor answered", callback)) return;
    getRequest(`/api/answered/?assessorId=${assessorId}`).then((graded) => {
        if (CONSOLE)
            console.log(`got all graded for assessor ${assessorId}:`, graded);
        if (callback) callback(graded);
    });
}

export function addAnswered(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/api/answered", question).then((q) => {
        q = checkError(q, "add", "answered");
        if (callback) callback(q);
    });
}

export function updateAnswered(question, callback = null) {
    if (checkNull(question, callback)) return;
    const answeredId = question.id;
    postRequest(`/api/answered/${answeredId}`, question).then((q) => {
        q = checkError(q, "update", "answered");
        if (callback) callback(q);
    });
}
