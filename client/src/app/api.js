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

function checkNull(arg) {
    return arg == null;
}

function getMsg(requestType, resource) {
    const actions = {
        login: "logged in",
        get: "got",
        add: "added",
        update: "updated",
        import: "imported",
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
        import: "importing",
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

function checkInt(arg, requestType, resource, checking = "id") {
    if (arg == null || isNaN(arg)) {
        if (CONSOLE)
            console.log(
                getErrMsg(requestType, resource),
                `Invalid ${checking} "${arg}"`
            );
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

export async function logOutUser() {
    const data = await postRequest("/users/logout");
    if (CONSOLE) console.log("logged out user");
    return data;
}

export async function setRoleCookie(role) {
    return postRequest("/users/role", { role });
}

export async function isLoggedIn() {
    return getRequest("/users/loggedin");
}

// API

export async function getAllUsers() {
    const users = await getRequest("/users");
    return checkError(users, "get", "all users", true);
}

// not used
export async function getUser(userId) {
    if (!checkInt(userId, "get", "user")) return null;
    const user = await getRequest(`/users/${userId}`);
    return checkError(user, "get", "user");
}

export async function updateUserRoles(user) {
    if (checkNull(user)) return null;
    const userId = user.id;
    const updated = await postRequest(`/users/${userId}/roles`, user);
    checkError(updated, "update", "user");
    return updated;
}

export async function addUser(username) {
    if (checkNull(username)) return null;
    const added = await postRequest("/users", { username });
    checkError(added, "add", "user");
    return added;
}

export async function getAllQuestions() {
    const questions = await getRequest("/questions");
    return checkError(questions, "get", "all questions", true);
}

export async function getQuestion(questionId) {
    if (!checkInt(questionId, "get", "question")) return null;
    const question = await getRequest(`/questions/${questionId}`);
    return checkError(question, "get", "question");
}

export async function getQuestionVersions(questionId) {
    if (!checkInt(questionId, "get", "question versions")) return null;
    const versions = await getRequest(`/questions/${questionId}/versions`);
    // purposely return null instead of [] in case of error
    return checkError(versions, "get", "question versions");
}

export async function getQuestionVersion(questionId, version) {
    if (!checkInt(questionId, "get", "question version")) return null;
    if (!checkInt(version, "get", "question version", "version")) return null;
    const question = await getRequest(`/questions/${questionId}/${version}`);
    return checkError(question, "get", "question version");
}

export async function addQuestion(question) {
    if (checkNull(question)) return null;
    const added = await postRequest("/questions", question);
    return checkError(added, "add", "question");
}

export async function updateQuestion(question) {
    if (checkNull(question)) return null;
    const questionId = question.id;
    const updated = await postRequest(`/questions/${questionId}`, question);
    return checkError(updated, "update", "question");
}

export async function updateQuestionVersion(question) {
    if (checkNull(question)) return null;
    const { id: questionId, version } = question;
    const updated = await postRequest(
        `/questions/${questionId}/${version}`,
        question
    );
    return checkError(updated, "update", "question version");
}

export async function importQuestions(questions, callback = null) {
    if (checkNull(questions, callback)) return;
    const data = postRequest("/questions/import", questions);
    return checkError(data, "import", "questions");
}

export async function deleteQuestion(questionId) {
    if (!checkInt(questionId, "delete", "question")) return null;
    const deleted = await deleteRequest(`/questions/${questionId}`);
    return checkError(deleted, "delete", "question", true);
}

export async function getAllDrills() {
    const drills = await getRequest("/drills");
    return checkError(drills, "get", "all drills", true);
}

export async function getAllDrillsAndAnswered() {
    const drills = await getRequest("/drills/answered");
    return checkError(drills, "get", "all drills and answered", true);
}

export async function getDrill(drillId) {
    if (!checkInt(drillId, "get", "drill")) return null;
    const drill = await getRequest(`/drills/${drillId}`);
    return checkError(drill, "get", "drill");
}

export async function addDrill(drill) {
    if (checkNull(drill)) return null;
    const added = await postRequest("/drills", drill);
    return checkError(added, "add", "drill");
}

export async function updateDrill(drill) {
    if (checkNull(drill)) return null;
    const updated = await postRequest(`/drills/${drill.id}`, drill);
    return checkError(updated, "update", "drill");
}

export async function importDrills(drills) {
    if (checkNull(drills)) return null;
    const data = await postRequest("/drills/import", drills);
    return checkError(data, "import", "drills");
}

export async function deleteDrill(drillId) {
    if (!checkInt(drillId, "delete", "drill")) return null;
    const deleted = await deleteRequest(`/drills/${drillId}`);
    return checkError(deleted, "delete", "drill");
}

// not used
export async function getAllTraineeDrills() {
    const drills = await getRequest("/traineeDrills");
    return checkError(drills, "get", "all trainee drills", true);
}

// not used
export async function getTraineeDrill(traineeDrillId) {
    if (!checkInt(traineeDrillId, "get", "trainee drill")) return null;
    const drill = await getRequest(`/traineeDrills/${traineeDrillId}`);
    return checkError(drill, "get", "trainee drill");
}

export async function getDrillsByTrainee() {
    // infers trainee id from logged in user
    const drills = await getRequest("/traineeDrills/trainee");
    return checkError(drills, "get", "drills by trainee", true);
}

export async function addTraineeDrill(drillCode) {
    // infers trainee id from logged in user
    if (checkNull(drillCode)) return null;
    const added = await postRequest("/traineeDrills", { drillCode });
    checkError(added, "add", "trainee drill");
    return added;
}

export async function traineeDrillProgress(traineeDrillId) {
    if (!checkInt(traineeDrillId, "update", "trainee drill")) return null;
    const updated = await postRequest(
        `/traineeDrills/${traineeDrillId}/increment`
    );
    return checkError(updated, "update", "trainee drill");
}

export async function deleteTraineeDrill(traineeDrillId) {
    if (!checkInt(traineeDrillId, "delete", "trainee drill")) return null;
    const deleted = await deleteRequest(`/traineeDrills/${traineeDrillId}`);
    return checkError(deleted, "delete", "trainee drill");
}

export async function getAllAnswered() {
    const answered = await getRequest("/answered");
    return checkError(answered, "get", "all answered", true);
}

export async function getAnswered(answeredId) {
    if (!checkInt(answeredId, "get", "answered")) return null;
    const answered = await getRequest(`/answered/${answeredId}`);
    return checkError(answered, "get", "answered");
}

export async function getQuestionAnswered(questionId) {
    if (!checkInt(questionId, "get", "question answered")) return null;
    const answered = await getRequest(`/answered/question/${questionId}`);
    return checkError(answered, "get", "question answered", true);
}

export async function getTraineeAnswered() {
    // infers trainee id from logged in user
    const answered = await getRequest("/answered/trainee");
    return checkError(answered, "get", "answered for trainee", true);
}

export async function getAssessorGraded() {
    // infers assessor id from logged in user
    const graded = await getRequest("/answered/assessor");
    return checkError(graded, "get", "graded for assessor", true);
}

export async function getAssessorUngraded() {
    // infers assessor id from logged in user
    const ungraded = await getRequest("/answered/ungraded");
    return checkError(ungraded, "get", "ungraded answered", true);
}

export async function addAnswered(question) {
    if (checkNull(question)) return null;
    const added = await postRequest("/answered", question);
    return checkError(added, "add", "answered");
}

export async function updateAnswered(question) {
    // infers assessor id from logged in user
    if (checkNull(question)) return null;
    const answeredId = question.id;
    const updated = await postRequest(`/answered/${answeredId}`, question);
    checkError(updated, "update", "answered");
    return updated;
}

export async function deleteAnswered(answeredId) {
    if (!checkInt(answeredId, "delete", "answered")) return null;
    const deleted = await deleteRequest(`/answered/${answeredId}`);
    return checkError(deleted, "delete", "answered");
}
