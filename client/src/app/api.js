const CONSOLE = true;

// API functions

function getRequest(route) {
    return fetch("/api" + route).then((res) => res.json());
}

function postRequest(route, data) {
    return new Promise((resolve, reject) => {
        fetch("/api" + route, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((res) => resolve(res.json()))
            .catch(reject);
    });
}

function deleteRequest(route) {
    return fetch("/api" + route, {
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
        case "log in":
            action = "logged in";
            break;
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
        case "log in":
            action = "logging in";
            break;
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

function checkError(data, requestType, resource, array = false) {
    if (data && !data.error) {
        if (CONSOLE) console.log(getMsg(requestType, resource), data);
        return data;
    } else {
        if (CONSOLE)
            console.log(
                getErrMsg(requestType, resource),
                data ? data.msg || data.message : "null"
            );
        return array ? [] : null;
    }
}

// authentication

export function signUpUser(email, password, roles, callback = null) {
    const user = { email, password, roles };
    postRequest("/users", user).then((u) => {
        checkError(u, "add", "user");
        if (callback) callback(u);
    });
}

export function logInUser(email, password, callback = null) {
    postRequest("/users/login", { email, password })
        .then((u) => {
            checkError(u, "log in", "user");
            if (callback) callback(u);
        })
        .catch(() => {
            // authentication failed
            const msg = "Invalid email or password.";
            if (CONSOLE) console.log("error while logging in:", msg);
            if (callback) callback({ error: true, message: msg });
        });
}

export function logOutUser(callback = null) {
    postRequest("/users/logout").then((data) => {
        console.log("logged out user");
        if (callback) callback(data);
    });
}

export function setRoleCookie(role, callback = null) {
    postRequest("/users/role", { role }).then((data) => {
        if (callback) callback(data);
    });
}

export function isLoggedIn(callback = null) {
    getRequest("/users/loggedin").then((user) => {
        if (callback) callback(user);
    });
}

// API

// not used
export function getAllUsers(callback = null) {
    getRequest("/users").then((users) => {
        users = checkError(users, "get", "all users", true);
        if (callback) callback(users);
    });
}

export function getUser(userId, callback = null) {
    if (checkNull(userId, callback)) return;
    if (!checkInt(userId, "get", "user", callback)) return;
    getRequest(`/users/${userId}`).then((u) => {
        u = checkError(u, "get", "user");
        if (callback) callback(u);
    });
}

export function getAllQuestions(callback = null) {
    getRequest("/questions").then((questions) => {
        questions = checkError(questions, "get", "all questions", true);
        if (callback) callback(questions);
    });
}

export function getQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "get", "question", callback)) return;
    getRequest(`/questions/${questionId}`).then((q) => {
        q = checkError(q, "get", "question");
        if (callback) callback(q);
    });
}

export function getQuestionVersion(questionId, version, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (checkNull(version, callback)) return;
    if (!checkInt(questionId, "get", "question version", callback)) return;
    if (!checkInt(version, "get", "question version", callback)) return;
    getRequest(`/questions/${questionId}/${version}`).then((q) => {
        q = checkError(q, "get", "question version");
        if (callback) callback(q);
    });
}

export function addQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/questions", question).then((q) => {
        q = checkError(q, "add", "question");
        if (callback) callback(q);
    });
}

export function updateQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    postRequest(`/questions/${questionId}`, question).then((q) => {
        q = checkError(q, "update", "question");
        if (callback) callback(q);
    });
}

export function updateQuestionVersion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    const { version } = question;
    postRequest(`/questions/${questionId}/${version}`, question).then((q) => {
        q = checkError(q, "update", "question version");
        if (callback) callback(q);
    });
}

export function deleteQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "delete", "question", callback)) return;
    deleteRequest(`/questions/${questionId}`).then((q) => {
        q = checkError(q, "delete", "question");
        if (callback) callback(q);
    });
}

export function getAllAnswered(callback = null) {
    getRequest("/answered").then((answered) => {
        answered = checkError(answered, "get", "all answered", true);
        if (callback) callback(answered);
    });
}

export function getAnswered(answeredId, callback = null) {
    if (checkNull(answeredId, callback)) return;
    if (!checkInt(answeredId, "get", "answered", callback)) return;
    getRequest(`/answered/${answeredId}`).then((q) => {
        q = checkError(q, "get", "answered");
        if (callback) callback(q);
    });
}

export function getTraineeAnswered(traineeId, callback = null) {
    if (checkNull(traineeId, callback)) return;
    if (!checkInt(traineeId, "get", "trainee answered", callback)) return;
    getRequest(`/answered/?traineeId=${traineeId}`).then((answered) => {
        answered = checkError(
            answered,
            "get",
            `answered for trainee ${traineeId}`,
            true
        );
        if (callback) callback(answered);
    });
}

// not used because assessor dashboard filters on its own
export function getAssessorGraded(assessorId, callback = null) {
    if (checkNull(assessorId, callback)) return;
    if (!checkInt(assessorId, "get", "assessor answered", callback)) return;
    getRequest(`/answered/?assessorId=${assessorId}`).then((graded) => {
        graded = checkError(
            graded,
            "get",
            `graded for assessor ${assessorId}`,
            true
        );
        if (callback) callback(graded);
    });
}

export function addAnswered(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/answered", question).then((q) => {
        q = checkError(q, "add", "answered");
        if (callback) callback(q);
    });
}

export function updateAnswered(question, callback = null) {
    if (checkNull(question, callback)) return;
    const answeredId = question.id;
    postRequest(`/answered/${answeredId}`, question).then((q) => {
        q = checkError(q, "update", "answered");
        if (callback) callback(q);
    });
}
