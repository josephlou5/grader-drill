const path = require("path");
const express = require("express");
const { sequelize, Sequelize, ...models } = require("./models/index.js");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "client/build")));

const sess = {
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // set the max age to 100 days
        maxAge: 100 * 24 * 60 * 60 * 1000,
    },
};
// in production, use secure cookies
// doesn't work with heroku (need to enable some proxy thing)
// if (process.env.NODE_ENV === "production") {
//     sess.cookie.secure = true;
// }
app.use(require("express-session")(sess));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        (email, password, done) => {
            console.log("authenticating:", email);
            models.User.Pass.findOne({ where: { email } }).then((user) => {
                // invalid email
                if (!user) {
                    return done(null, false);
                }
                // check password
                if (!user.checkPassword(password)) {
                    return done(null, false);
                }
                console.log(email, "authenticated");
                // don't pass the password info
                user = user.noPass();
                if (user.roles.length === 1) {
                    user.role = user.roles[0];
                }
                return done(null, user);
            });
        }
    )
);

passport.serializeUser((user, done) => {
    // only include basic information
    const cookie = {
        id: user.id,
        email: user.email,
        roles: user.roles,
    };
    if (user.role) {
        cookie.role = user.role;
    }
    done(null, cookie);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// for debugging: reset the database
if (process.env.NODE_ENV !== "production") {
    const data = {
        drills: [
            {
                name: "COS126",
                numQuestions: 3,
                dueDate: "2021-09-01",
                tags: "course:126",
            },
            {
                name: "COS226",
                numQuestions: 3,
                dueDate: "2021-09-01",
                tags: "course:226",
            },
        ],
        traineeDrills: [
            {
                drillId: 1,
                traineeId: 1,
                progress: 0,
            },
            {
                drillId: 1,
                traineeId: 2,
                progress: 1,
            },
            {
                drillId: 1,
                traineeId: 3,
                progress: 1,
            },
            {
                drillId: 1,
                traineeId: 4,
                progress: 1,
            },
        ],
        questions: [
            {
                id: 1,
                version: 1,
                hasCodeField: true,
                hasAnswerField: true,
                questionType: "Comment",
                questionText: "What's wrong with this code?",
                code: 'public class Question {\n    public static void main(String[] args) {\n        System.out.println("Hello world");\n    }\n}',
                highlights: [
                    // { startLine: 0, startChar: 14, endLine: 1, endChar: 5, byUser: false },
                    // { startLine: 1, startChar: 8, endLine: 1, endChar: 11, byUser: false },
                ],
                rubric: [
                    {
                        points: 1,
                        text: "Says that nothing is wrong with the code",
                    },
                ],
            },
            {
                id: 1,
                version: 2,
                hasCodeField: true,
                hasAnswerField: true,
                questionType: "Comment",
                questionText: "this is the question text",
                code: "this is the code",
                highlights: [],
                rubric: [
                    {
                        points: 1,
                        text: "Says everything is wrong with the code",
                    },
                ],
            },
            {
                id: 2,
                version: 1,
                hasCodeField: false,
                hasAnswerField: true,
                questionType: "Multiple Choice",
                questionText:
                    "What would you say to a student who uses `Integer` where they should use `int`?",
                highlights: [],
                answerChoices: [
                    "You should use `int` because it's shorter to type.",
                    "`Integer` is a wrapper object and is not necessary for all cases.",
                    "Always use `Integer` because it's an object.",
                ],
                correct: 1,
            },
            {
                id: 3,
                version: 1,
                hasCodeField: true,
                hasAnswerField: false,
                questionType: "Highlight",
                questionText: "Highlight all the variables in the code.",
                code: 'public class Question {\n    public static void main(String[] args) {\n        int x = 5;\n        System.out.println(x);\n        String end = "This is the end of the program";\n    }\n}',
                rubric: [
                    {
                        points: 1,
                        text: "Highlights `x`",
                    },
                    {
                        points: 1,
                        text: "Highlights `end`",
                    },
                ],
            },
        ],
        answered: [
            {
                questionId: 1,
                version: 1,
                traineeId: 2,
                traineeDrillId: 2,
                assessorId: 1,
                score: 0,
                questionType: "Comment",
                highlights: [
                    {
                        startLine: 0,
                        startChar: 14,
                        endLine: 1,
                        endChar: 5,
                        byUser: false,
                        text: "this is existing text",
                        answer: "this is highlight 1",
                    },
                    {
                        startLine: 1,
                        startChar: 8,
                        endLine: 1,
                        endChar: 11,
                        byUser: true,
                        answer: "this is another highlight",
                    },
                ],
                rubric: [
                    {
                        points: 1,
                        text: "Says that nothing is wrong with the code",
                        checked: false,
                    },
                ],
                graded: true,
            },
            {
                questionId: 2,
                version: 1,
                autograded: true,
                traineeId: 3,
                traineeDrillId: 3,
                questionType: "Multiple Choice",
                highlights: [],
                answer: 0,
                score: 0,
                graded: true,
            },
            {
                questionId: 3,
                version: 1,
                traineeId: 4,
                traineeDrillId: 4,
                questionType: "Highlight",
                highlights: [
                    {
                        startLine: 2,
                        startChar: 12,
                        endLine: 2,
                        endChar: 13,
                        byUser: true,
                    },
                    {
                        startLine: 4,
                        startChar: 15,
                        endLine: 4,
                        endChar: 18,
                        byUser: true,
                    },
                ],
                rubric: [
                    {
                        points: 1,
                        text: "Highlights `x`",
                    },
                    {
                        points: 1,
                        text: "Highlights `end`",
                    },
                ],
                graded: false,
            },
        ],
    };

    async function clearTables() {
        const response = {};
        await Promise.all(
            Object.values(models).map(async (model) => {
                if (model.name === "TraineeDrill") {
                    model = model.All;
                }
                await model
                    .destroy({ where: {}, truncate: false, force: true })
                    .then(
                        (numRows) =>
                            (response[model.name] = `${numRows} rows deleted`)
                    )
                    .catch(
                        () => (response[model.name] = "Failed to delete rows")
                    );
                // reset the id sequence for users and answered
                const tableName = model.getTableName();
                if (
                    !["Users", "Answered", "Drills", "TraineeDrills"].includes(
                        tableName
                    )
                )
                    return;
                const sequence = tableName + "_id_seq";
                await sequelize
                    .query(`ALTER SEQUENCE "${sequence}" RESTART WITH 1;`)
                    .then(() => (response[sequence] = "Reset to 1"))
                    .catch(() => (response[sequence] = "Failed to reset to 1"));
            })
        );
        return response;
    }

    app.get("/clear", async (req, res) => {
        const response = await clearTables();
        res.json(response);
    });

    app.get("/reset", async (req, res) => {
        // clear all the tables
        const response = await clearTables();
        // add new data
        await models.User.add({
            email: "assessor@test.com",
            password: "password",
            roles: ["Admin", "Assessor", "Trainee"],
        });
        for (let num = 1; num <= 3; num++) {
            await models.User.add({
                email: `trainee${num}@test.com`,
                password: "password",
                roles: ["Trainee"],
            });
        }
        for (const d of data.drills) {
            await models.Drill.add(d);
        }
        for (const d of data.traineeDrills) {
            await models.TraineeDrill.add(d);
        }
        for (const q of data.questions) {
            await models.Question.add(q);
        }
        for (const q of data.answered) {
            await models.Answered.add_raw(q);
        }
        res.json(response);
    });
}

// Authentication Routes

// sign up
app.post("/api/users", (req, res) => {
    const user = req.body;
    console.log("signing up:", user.email);
    models.User.add(user)
        .then((user) => {
            user = user.noPass();
            if (user.roles.length === 1) {
                user.role = user.roles[0];
            }
            console.log("created user:", user);
            req.login(user, (err) => res.json(err || user));
        })
        .catch((err) => {
            const response = { error: true, msg: [], message: [] };
            for (const error of err.errors) {
                response.message.push(error.message);
                switch (error.type) {
                    case "notNull Violation":
                        if (error.path === "email") {
                            response.msg.push("email is null");
                            response.email_violation = true;
                        } else if (
                            error.path === "salt" ||
                            error.path === "hash"
                        ) {
                            if (!response.password_violation) {
                                response.msg.push("password is null");
                                response.password_violation = true;
                            }
                        }
                        response.null_violation = true;
                        break;
                    case "unique violation":
                        response.msg.push(
                            `email "${user.email}" is not unique`
                        );
                        response.unique_violation = true;
                        break;
                    case "Validation error":
                        if (error.validatorKey === "isEmail") {
                            response.msg.push(
                                `"${user.email}" is not a valid email`
                            );
                            response.email_violation = true;
                            break;
                        } else if (error.validatorKey === "validRoles") {
                            response.msg.push("user must have a role");
                            response.role_violation = true;
                            break;
                        }
                    // fall through
                    default:
                        console.log("unknown error:", error);
                        break;
                }
            }
            res.json(response);
        });
});

// log in
app.post("/api/users/login", passport.authenticate("local"), (req, res) => {
    const { user } = req;
    console.log("Logged in:", user);
    res.json(user);
});

// log out
app.post("/api/users/logout", (req, res) => {
    req.logout();
    console.log("Logged out user");
    res.json({ success: true });
});

// the user currently logged in
app.get("/api/users/loggedin", (req, res) => {
    res.json(req.isAuthenticated() ? req.user : null);
});

// API Routes

function checkAuth(req, res) {
    if (req.isAuthenticated()) {
        return true;
    }
    console.log("not authenticated");
    res.json({
        error: true,
        msg: "not authenticated",
        notAuthenticated: true,
    });
    return false;
}

function checkRole(req, res, role) {
    if (!checkAuth(req, res)) return false;
    if (req.user.roles.includes(role)) return true;
    console.log("doesn't have proper role");
    res.json({
        error: true,
        msg: `needs role "${role}" for permission`,
        insufficientRole: true,
    });
    return false;
}

// set role in cookie
app.post("/api/users/role", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { role } = req.body;
    if (role) {
        req.session.passport.user.role = role;
        console.log("Set user role as", role);
    } else {
        delete req.session.passport.user.role;
        console.log("Removed user role");
    }
    res.json({ success: true });
});

// get all users
app.get("/api/users", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    models.User.findAll({ order: [["id", "ASC"]] }).then((users) =>
        res.json(users)
    );
});

// change user password
app.post("/api/users/password", (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = req.user.id;
    const { oldPass, newPass } = req.body;
    models.User.Pass.findByPk(userId).then((user) => {
        if (!user) {
            // shouldn't happen because user is logged in
            res.json({
                error: true,
                msg: `user ${userId} does not exist`,
                dne: true,
            });
        } else if (!user.checkPassword(oldPass)) {
            res.json({
                error: true,
                msg: "wrong password",
                passwordIncorrect: true,
            });
        } else if (newPass === oldPass) {
            res.json({
                error: true,
                msg: "same password",
                samePassword: true,
            });
        } else {
            user.changePassword(newPass).then((u) => res.json(u));
        }
    });
});

// get user by id
// not used
app.get("/api/users/:userId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { userId } = req.params;
    models.User.findByPk(userId).then((user) => {
        if (!user) {
            res.json({
                error: true,
                msg: `user ${userId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(user);
        }
    });
});

// update user roles
app.post("/api/users/:userId/roles", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { userId } = req.params;
    const { roles } = req.body;
    models.User.updateRoles(userId, roles).then((u) => {
        if (!u) {
            res.json({
                error: true,
                msg: `user ${userId} does not exist`,
                dne_error: true,
            });
        } else {
            console.log("updated user:", u);
            res.json(u);
        }
    });
});

// reset user password
app.post("/api/users/:userId/password", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { userId } = req.params;
    models.User.findByPk(userId).then((user) => {
        if (!user) {
            res.json({
                error: true,
                msg: `user ${userId} does not exist`,
                dne_error: true,
            });
        } else {
            user.resetPassword().then((u) => res.json(u));
        }
    });
});

// get all questions and all versions
// not used & not in api
app.get("/api/questions/all", (req, res) => {
    if (!checkAuth(req, res)) return;
    models.Question.findAll({
        order: [
            ["id", "ASC"],
            ["version", "ASC"],
        ],
    }).then((questions) => res.json(questions));
});

// get final versions of all questions
app.get("/api/questions", (req, res) => {
    if (!checkAuth(req, res)) return;
    models.Question.findAll({
        order: [
            ["id", "ASC"],
            ["version", "DESC"],
        ],
    }).then((questions) => {
        let prevId = 0;
        // get the final versions of each question
        const finalVersions = questions.flatMap((question) => {
            const questionId = question.id;
            if (questionId === prevId) return [];
            prevId = questionId;
            return [question];
        });
        res.json(finalVersions);
    });
});

// get question by id (final version)
app.get("/api/questions/:questionId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { questionId } = req.params;
    models.Question.findOne({
        where: { id: questionId },
        order: [["version", "DESC"]],
    }).then((question) => {
        if (!question) {
            res.json({
                error: true,
                msg: `question ${questionId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(question);
        }
    });
});

// get question by id and version
app.get("/api/questions/:questionId/:version", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { questionId, version } = req.params;
    models.Question.findOne({
        where: { id: questionId, version },
        // search through deleted questions as well
        paranoid: false,
    }).then((question) => {
        if (!question) {
            res.json({
                error: true,
                msg: `question ${questionId} version ${version} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(question);
        }
    });
});

// helper method to add a new question version
function addQuestion(question, res) {
    return models.Question.add(question).catch((err) => {
        // TODO: test and fix
        console.log(err);
        const response = { error: true, msg: [], message: [] };
        for (const error of err.errors) {
            response.message.push(error.message);
            switch (error.type) {
                case "notNull Violation":
                    // response.msg = "something is null";
                    response.null_violation = true;
                    break;
                default:
                    console.log("unknown error:", error);
                    break;
            }
        }
        res.json(response);
    });
}

// add new question
app.post("/api/questions", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const question = req.body;
    // get the next id
    models.Question.max("id", { paranoid: false })
        .then((id) => (id ? id + 1 : 1))
        .then((id) => {
            Object.assign(question, { id, version: 1 });
            addQuestion(question, res).then((q) => res.json(q));
        });
});

// update question (add new version)
app.post("/api/questions/:questionId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { questionId } = req.params;
    const question = req.body;
    // get the next version number
    models.Question.max("version", {
        where: { id: questionId },
        paranoid: false,
    }).then((version) => {
        if (!version) {
            res.json({
                error: true,
                msg: `question ${questionId} does not exist`,
                dne_error: true,
            });
            return;
        }
        Object.assign(question, { id: questionId, version: version + 1 });
        addQuestion(question, res).then((q) => res.json(q));
    });
});

// update question version
app.post("/api/questions/:questionId/:version", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { questionId, version } = req.params;
    const question = req.body;
    models.Question.updateById(questionId, version, question).then((q) => {
        if (!q) {
            res.json({
                error: true,
                msg: `question ${questionId} version ${version} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(q);
        }
    });
});

// delete question (all versions)
app.delete("/api/questions/:questionId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { questionId } = req.params;
    models.Question.delete(questionId).then((questions) => {
        if (!questions) {
            res.json({
                error: true,
                msg: `question ${questionId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(questions);
        }
    });
});

// get all drills
app.get("/api/drills", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    models.Drill.findAll().then((drills) => res.json(drills));
});

// get drill by id
app.get("/api/drills/:drillId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { drillId } = req.params;
    models.Drill.IncludeDrill.findByPk(drillId).then((drill) => {
        if (!drill) {
            res.json({
                error: true,
                msg: `drill ${drillId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(drill);
        }
    });
});

// add new drill
app.post("/api/drills", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const drill = req.body;
    models.Drill.add(drill)
        .then((d) => res.json(d))
        .catch((err) => {
            const response = { error: true, msg: [], message: [] };
            for (const error of err.errors) {
                response.message.push(error.message);
                switch (error.type) {
                    case "notNull Violation":
                        if (error.path === "name") {
                            response.msg.push("name is null");
                            response.nameViolation = true;
                        } else if (error.path === "numQuestions") {
                            response.msg.push("numQuestions is null");
                            response.numQuestionsViolation = true;
                        } else if (error.path === "dueDate") {
                            response.msg.push("dueDate is null");
                            response.dueDateViolation = true;
                        }
                        response.null_violation = true;
                        break;
                    case "unique violation":
                        response.msg.push(
                            "generated code was not unique; please try again"
                        );
                        response.uniqueViolation = true;
                        break;
                    default:
                        console.log("unknown error:", error);
                        break;
                }
            }
            res.json(response);
        });
});

// update drill
app.post("/api/drills/:drillId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { drillId } = req.params;
    const drill = req.body;
    models.Drill.updateById(drillId, drill).then((d) => {
        if (!d) {
            res.json({
                error: true,
                msg: `drill ${drillId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(d);
        }
    });
});

// delete drill
app.delete("/api/drills/:drillId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Admin")) return;
    const { drillId } = req.params;
    models.Drill.delete(drillId).then((drill) => {
        if (!drill) {
            res.json({
                error: true,
                msg: `drill ${drillId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(drill);
        }
    });
});

// get all trainee drills
// not used
app.get("/api/traineeDrills", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { drillId } = req.query;
    const where = {};
    if (drillId) {
        where.drillId = drillId;
    }
    models.TraineeDrill.findAll({ where }).then((drills) => res.json(drills));
});

// get all trainee drills by logged in trainee
app.get("/api/traineeDrills/trainee", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const traineeId = req.user.id;
    models.TraineeDrill.IncludeDrill.findAll({ where: { traineeId } }).then(
        (drills) => res.json(drills)
    );
});

// get trainee drill by id
// not used
app.get("/api/traineeDrills/:traineeDrillId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { traineeDrillId } = req.params;
    models.TraineeDrill.findByPk(traineeDrillId).then((drill) => {
        if (!drill) {
            res.json({
                error: true,
                msg: `trainee drill ${traineeDrillId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(drill);
        }
    });
});

// add trainee drill by drill code
app.post("/api/traineeDrills", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const traineeId = req.user.id;
    const code = req.body.drillCode;
    models.Drill.findOne({ where: { code } }).then((drill) => {
        if (!drill) {
            res.json({
                error: true,
                msg: `drill with code "${code}" does not exist`,
                dne_error: true,
            });
            return;
        }
        if (drill.expired) {
            res.json({
                error: true,
                msg: `drill with code "${code}" is expired`,
                expiredError: true,
            });
            return;
        }
        const drillId = drill.id;
        models.TraineeDrill.All.findOrCreate({
            where: { drillId, traineeId },
            paranoid: false,
        })
            .then(([d, created]) => {
                if (created) {
                    res.json(d);
                    return;
                }
                if (!d.deletedAt) {
                    // trainee already in drill
                    res.json({
                        error: true,
                        msg: `trainee ${traineeId} already in drill ${drillId}`,
                        uniqueViolation: true,
                    });
                    return;
                }
                // trainee was in drill before; need to restore
                models.TraineeDrill.restore({ where: { id: d.id } }).then(() =>
                    res.json(d)
                );
            })
            .catch((err) => {
                console.log("error:", err);
                const response = { error: true, msg: [], message: [] };
                for (const error of err.errors) {
                    response.message.push(error.message);
                    switch (error.type) {
                        case "notNull Violation":
                            if (error.path === "drillId") {
                                response.msg.push("drillId is null");
                            } else if (error.path === "traineeId") {
                                response.msg.push("traineeId is null");
                            }
                            response.null_violation = true;
                            break;
                        default:
                            console.log("unknown error:", error);
                            break;
                    }
                }
                res.json(response);
            });
    });
});

// increment progress for trainee drill
app.post("/api/traineeDrills/:traineeDrillId/increment", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const { traineeDrillId } = req.params;
    const where = { where: { id: traineeDrillId } };
    models.TraineeDrill.increment("progress", where).then(([[rows, num]]) => {
        // a little strange that it returns [[rows, num affected rows]]
        // instead of [rows, num affected rows], which is what i expected
        if (num === 0) {
            res.json({
                error: true,
                msg: `trainee drill ${traineeDrillId} does not exist`,
                dne_error: true,
            });
            return;
        }
        const traineeDrill = rows[0];
        models.Drill.findByPk(traineeDrill.drillId, { paranoid: false }).then(
            (drill) => {
                if (traineeDrill.progress < drill.numQuestions) {
                    res.json(traineeDrill);
                    return;
                }
                models.TraineeDrill.complete(traineeDrillId).then((d) =>
                    res.json(d)
                );
            }
        );
    });
});

app.delete("/api/traineeDrills/:traineeDrillId", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const { traineeDrillId } = req.params;
    models.TraineeDrill.delete(traineeDrillId).then((drill) => {
        if (!drill) {
            res.json({
                error: true,
                msg: `trainee drill ${traineeDrillId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(drill);
        }
    });
});

// get all answered
app.get("/api/answered", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Assessor")) return;
    models.Answered.IncludeUsers.findAll().then((answered) =>
        res.json(answered)
    );
});

// get all answered by logged in trainee
app.get("/api/answered/trainee", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const traineeId = req.user.id;
    models.Answered.IncludeDrill.findAll({ where: { traineeId } }).then(
        (answered) => res.json(answered)
    );
});

// get all graded by logged in assessor
app.get("/api/answered/assessor", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Assessor")) return;
    const assessorId = req.user.id;
    models.Answered.IncludeTraineeDrill.findAll({
        where: { assessorId, graded: true },
        order: [["updatedAt", "ASC"]],
    }).then((answered) => res.json(answered));
});

// get all ungraded by logged in assessor
app.get("/api/answered/ungraded", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Assessor")) return;
    const assessorId = req.user.id;
    models.Answered.IncludeTraineeDrill.findAll({
        where: {
            // ungraded
            graded: false,
            // don't grade your own questions
            traineeId: { [Sequelize.Op.ne]: assessorId },
        },
        order: [
            ["questionId", "ASC"],
            ["version", "ASC"],
            ["id", "ASC"],
        ],
    }).then((answered) => res.json(answered));
});

// get answered by id
app.get("/api/answered/:answeredId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { answeredId } = req.params;
    models.Answered.IncludeUsers.findByPk(answeredId).then((question) => {
        if (!question) {
            res.json({
                error: true,
                msg: `answered ${answeredId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(question);
        }
    });
});

// add new answered
app.post("/api/answered", (req, res) => {
    if (!checkAuth(req, res)) return;
    if (!checkRole(req, res, "Trainee")) return;
    const traineeId = req.user.id;
    const question = req.body;
    // set trainee
    question.traineeId = traineeId;
    models.Answered.add(question)
        .then((q) => res.json(q))
        .catch((err) => {
            // TODO: test and fix
            console.log(err);
            const response = { error: true, msg: [], message: [] };
            for (const error of err.errors) {
                response.message.push(error.message);
                switch (error.type) {
                    case "notNull Violation":
                        // response.msg = "something is null";
                        response.null_violation = true;
                        break;
                    default:
                        console.log("unknown error:", error);
                        break;
                }
            }
            res.json(response);
        });
});

// update answered (it's been graded)
app.post("/api/answered/:answeredId", (req, res) => {
    if (!checkAuth(req, res)) return;
    // only update answered when grading
    if (!checkRole(req, res, "Assessor")) return;
    const { answeredId } = req.params;
    const answered = req.body;
    // set assessor id
    answered.assessorId = req.user.id;
    // set graded
    answered.graded = true;
    models.Answered.updateById(answeredId, answered).then((question) => {
        if (!question) {
            res.json({
                error: true,
                msg: `answered ${answeredId} does not exist`,
                dne_error: true,
            });
        } else {
            res.json(question);
        }
    });
});

// all other get requests (frontend)
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client/build/index.html"));
    });
}

// listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
