const CONSOLE = process.env.NODE_ENV !== "production";

// API functions

async function getRequest(route) {
    const res = await fetch("/api" + route);
    return await res.json();
}

async function postRequest(route, data = {}) {
    const res = await fetch("/api" + route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await res.json();
}

async function deleteRequest(route) {
    const res = await fetch("/api" + route, {
        method: "DELETE",
    });
    return await res.json();
}

// arg checking

function checkNull(arg, callback) {
    if (arg == null) {
        callback?.(null);
        return true;
    }
    return false;
}

function getMsg(requestType, resource) {
    const actions = {
        login: "logged in",
        get: "got",
        add: "added",
        update: "updated",
        reset: "reset",
        delete: "deleted",
    };
    const action = actions[requestType];
    if (action) {
        return `${action} ${resource}:`;
    } else {
        return `${resource}:`;
    }
}

function getErrMsg(requestType, resource) {
    const actions = {
        login: "logging in",
        get: "getting",
        add: "adding",
        update: "updating",
        reset: "resetting",
        delete: "deleting",
    };
    const action = actions[requestType];
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
        callback?.(null);
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
        if (data.notAuthenticated) {
            // reload the page to redirect back to login
            window.location.reload();
        }
        return array ? [] : null;
    }
}

// authentication

export function logInUser(callback = null) {
    postRequest("/users/login").then((u) => {
        checkError(u, "login", "user");
        callback?.(u);
    });
}

export function logOutUser(callback = null) {
    postRequest("/users/logout").then((data) => {
        if (CONSOLE) console.log("logged out user");
        callback?.(data);
    });
}

export function setRoleCookie(role, callback = null) {
    postRequest("/users/role", { role }).then((data) => {
        callback?.(data);
    });
}

export function isLoggedIn(callback = null) {
    getRequest("/users/loggedin").then((user) => {
        callback?.(user);
    });
}

// API

export function getAllUsers(callback = null) {
    getRequest("/users").then((users) => {
        users = checkError(users, "get", "all users", true);
        callback?.(users);
    });
}

// not used
export function getUser(userId, callback = null) {
    if (checkNull(userId, callback)) return;
    if (!checkInt(userId, "get", "user", callback)) return;
    getRequest(`/users/${userId}`).then((u) => {
        u = checkError(u, "get", "user");
        callback?.(u);
    });
}

export function updateUserRoles(user, callback = null) {
    if (checkNull(user, callback)) return;
    postRequest(`/users/${user.id}/roles`, user).then((u) => {
        checkError(u, "update", "user");
        callback?.(u);
    });
}

export function addUser(username, callback = null) {
    if (checkNull(username, callback)) return;
    postRequest("/users", { username }).then((u) => {
        checkError(u, "add", "user");
        callback?.(u);
    });
}

export function getAllQuestions(callback = null) {
    getRequest("/questions").then((questions) => {
        questions = checkError(questions, "get", "all questions", true);
        callback?.(questions);
    });
}

export function getQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "get", "question", callback)) return;
    getRequest(`/questions/${questionId}`).then((q) => {
        q = checkError(q, "get", "question");
        callback?.(q);
    });
}

export function getQuestionVersion(questionId, version, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (checkNull(version, callback)) return;
    if (!checkInt(questionId, "get", "question version", callback)) return;
    if (!checkInt(version, "get", "question version", callback)) return;
    return getRequest(`/questions/${questionId}/${version}`).then((q) => {
        q = checkError(q, "get", "question version");
        callback?.(q);
        return q;
    });
}

export function addQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/questions", question).then((q) => {
        q = checkError(q, "add", "question");
        callback?.(q);
    });
}

export function updateQuestion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    postRequest(`/questions/${questionId}`, question).then((q) => {
        q = checkError(q, "update", "question");
        callback?.(q);
    });
}

export function updateQuestionVersion(question, callback = null) {
    if (checkNull(question, callback)) return;
    const questionId = question.id;
    const { version } = question;
    postRequest(`/questions/${questionId}/${version}`, question).then((q) => {
        q = checkError(q, "update", "question version");
        callback?.(q);
    });
}

export function deleteQuestion(questionId, callback = null) {
    if (checkNull(questionId, callback)) return;
    if (!checkInt(questionId, "delete", "question", callback)) return;
    deleteRequest(`/questions/${questionId}`).then((q) => {
        q = checkError(q, "delete", "question", true);
        callback?.(q);
    });
}

export function getAllDrills(callback = null) {
    getRequest("/drills").then((drills) => {
        drills = checkError(drills, "get", "all drills", true);
        callback?.(drills);
    });
}

export function getAllDrillsAndAnswered(callback = null) {
    getRequest("/drills/answered").then((drills) => {
        drills = checkError(drills, "get", "all drills and answered", true);
        callback?.(drills);
    });
}

export function getDrill(drillId, callback = null) {
    if (checkNull(drillId, callback)) return;
    if (!checkInt(drillId, "get", "drill", callback)) return;
    getRequest(`/drills/${drillId}`).then((d) => {
        d = checkError(d, "get", "drill");
        callback?.(d);
    });
}

export function addDrill(drill, callback = null) {
    if (checkNull(drill, callback)) return;
    postRequest("/drills", drill).then((d) => {
        d = checkError(d, "add", "drill");
        callback?.(d);
    });
}

export function updateDrill(drill, callback = null) {
    if (checkNull(drill, callback)) return;
    postRequest(`/drills/${drill.id}`, drill).then((d) => {
        d = checkError(d, "update", "drill");
        callback?.(d);
    });
}

export function deleteDrill(drillId, callback = null) {
    if (checkNull(drillId, callback)) return;
    if (!checkInt(drillId, "delete", "drill", callback)) return;
    deleteRequest(`/drills/${drillId}`).then((d) => {
        d = checkError(d, "delete", "drill");
        callback?.(d);
    });
}

// not used
export function getAllTraineeDrills(callback = null) {
    getRequest("/traineeDrills").then((drills) => {
        drills = checkError(drills, "get", "all trainee drills", true);
        callback?.(drills);
    });
}

// not used
export function getTraineeDrill(traineeDrillId, callback = null) {
    if (checkNull(traineeDrillId, callback)) return;
    if (!checkInt(traineeDrillId, "get", "trainee drill", callback)) return;
    getRequest(`/traineeDrills/${traineeDrillId}`).then((d) => {
        d = checkError(d, "get", "trainee drill");
        callback?.(d);
    });
}

export function getDrillByTrainee(callback = null) {
    // infers trainee id from logged in user
    getRequest("/traineeDrills/trainee").then((d) => {
        d = checkError(d, "get", "drills by trainee", true);
        callback?.(d);
    });
}

export function addTraineeDrill(drillCode, callback = null) {
    // infers trainee id from logged in user
    if (checkNull(drillCode, callback)) return;
    postRequest("/traineeDrills", { drillCode }).then((d) => {
        checkError(d, "add", "trainee drill");
        callback?.(d);
    });
}

export function traineeDrillProgress(traineeDrillId, callback = null) {
    if (checkNull(traineeDrillId, callback)) return;
    if (!checkInt(traineeDrillId, "update", "trainee drill", callback)) return;
    postRequest(`/traineeDrills/${traineeDrillId}/increment`).then((d) => {
        d = checkError(d, "update", "trainee drill");
        callback?.(d);
    });
}

export function deleteTraineeDrill(traineeDrillId, callback = null) {
    if (checkNull(traineeDrillId, callback)) return;
    if (!checkInt(traineeDrillId, "delete", "trainee drill", callback)) return;
    deleteRequest(`/traineeDrills/${traineeDrillId}`).then((d) => {
        d = checkError(d, "delete", "trainee drill");
        callback?.(d);
    });
}

export function getAllAnswered(callback = null) {
    getRequest("/answered").then((answered) => {
        answered = checkError(answered, "get", "all answered", true);
        callback?.(answered);
    });
}

export function getAnswered(answeredId, callback = null) {
    if (checkNull(answeredId, callback)) return;
    if (!checkInt(answeredId, "get", "answered", callback)) return;
    getRequest(`/answered/${answeredId}`).then((q) => {
        q = checkError(q, "get", "answered");
        callback?.(q);
    });
}

export function getTraineeAnswered(callback = null) {
    // infers trainee id from logged in user
    getRequest("/answered/trainee").then((answered) => {
        answered = checkError(answered, "get", "answered for trainee", true);
        callback?.(answered);
    });
}

export function getAssessorGraded(callback = null) {
    // infers assessor id from logged in user
    getRequest("/answered/assessor").then((graded) => {
        graded = checkError(graded, "get", "graded for assessor", true);
        callback?.(graded);
    });
}

export function getAssessorUngraded(callback = null) {
    // infers assessor id from logged in user
    getRequest("/answered/ungraded").then((ungraded) => {
        ungraded = checkError(ungraded, "get", "ungraded answered", true);
        callback?.(ungraded);
    });
}

export function addAnswered(question, callback = null) {
    if (checkNull(question, callback)) return;
    postRequest("/answered", question).then((q) => {
        q = checkError(q, "add", "answered");
        callback?.(q);
    });
}

export function updateAnswered(question, callback = null) {
    // infers assessor id from logged in user
    if (checkNull(question, callback)) return;
    const answeredId = question.id;
    postRequest(`/answered/${answeredId}`, question).then((q) => {
        checkError(q, "update", "answered");
        callback?.(q);
    });
}

export function deleteAnswered(answeredId, callback = null) {
    if (checkNull(answeredId, callback)) return;
    if (!checkInt(answeredId, "delete", "answered", callback)) return;
    deleteRequest(`/answered/${answeredId}`).then((q) => {
        q = checkError(q, "delete", "answered");
        callback?.(q);
    });
}
