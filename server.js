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
        maxAge: null,
    },
};
// in production, use secure cookies
if (process.env.NODE_ENV === "production") {
    sess.cookie.secure = true;
}
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
            models.UserPass.findOne({ where: { email } }).then((user) => {
                if (!user) {
                    return done(null, false, { message: "Invalid email." });
                }
                // check password
                if (!user.checkPassword(password)) {
                    return done(null, false, { message: "Invalid password." });
                }
                console.log(email, "authenticated");
                // don't pass the password info
                user = user.toJSON();
                delete user.salt;
                delete user.hash;
                return done(null, user);
            });
        }
    )
);

passport.serializeUser((user, done) => {
    // only include basic information
    done(null, {
        id: user.id,
        email: user.email,
        roles: user.roles,
    });
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// for debugging: reset the database
if (process.env.NODE_ENV !== "production") {
    const data = {
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

    app.get("/reset", async (req, res) => {
        let response = {};
        await Promise.all(
            Object.values(models).map(async (model) => {
                if (model.name === "Associations") return;
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
                if (!(tableName === "Users" || tableName === "Answered"))
                    return;
                const sequence = tableName + "_id_seq";
                await sequelize
                    .query(`ALTER SEQUENCE "${sequence}" RESTART WITH 1;`)
                    .then(() => (response[sequence] = "Reset to 1"))
                    .catch(() => (response[sequence] = "Failed to reset to 1"));
            })
        );
        await models.User.add({
            email: "assessor@test.com",
            password: "password",
            roles: ["Trainee", "Assessor"],
        }).catch((err) => console.log(err));
        for (let num = 1; num <= 3; num++) {
            await models.User.add({
                email: `trainee${num}@test.com`,
                password: "password",
                roles: ["Trainee"],
            });
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
            // don't pass the password info
            user = user.toJSON();
            delete user.salt;
            delete user.hash;
            console.log("created user:", user);
            req.login(user, (err) => res.json(err || user));
        })
        .catch((err) => {
            const response = { error: true, msg: [], message: [] };
            for (const error of err.errors) {
                response.message.push(err.message);
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

// set role
app.post("/api/users/role", (req, res) => {
    if (!req.isAuthenticated()) {
        res.json({ success: false });
        return;
    }
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

// get all users
// not used
app.get("/api/users", (req, res) => {
    if (!checkAuth(req, res)) return;
    models.User.findAll({ order: [["id", "ASC"]] }).then((users) =>
        res.json(users)
    );
});

// get user by id
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
    if (!req.isAuthenticated()) {
        console.log("not authenticated");
        res.json({
            error: true,
            message: "not authenticated",
            not_authenticated: true,
        });
        // res.json([]);
        return;
    }
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
function addQuestion(question) {
    return models.Question.add(question).catch((err) => {
        const error = err.errors[0];
        let response = { error: true, message: error.message };
        // TODO: test and fix
        switch (error.type) {
            case "notNull Violation":
                response.msg = "something is null";
                response.null_violation = true;
                break;
            default:
                break;
        }
        res.json(response);
    });
}

// add new question
app.post("/api/questions", (req, res) => {
    if (!checkAuth(req, res)) return;
    let question = req.body;
    // get the next id
    models.Question.max("id", { paranoid: false }).then((id) => {
        question["id"] = id ? id + 1 : 1;
        question["version"] = 1;
        addQuestion(question).then((q) => res.json(q));
    });
});

// update question (add new version)
app.post("/api/questions/:questionId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { questionId } = req.params;
    let question = req.body;
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

        question["id"] = questionId;
        question["version"] = version + 1;
        addQuestion(question).then((q) => res.json(q));
    });
});

// update question version
app.post("/api/questions/:questionId/:version", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { questionId, version } = req.params;
    let question = req.body;
    models.Question.update(question, {
        where: { id: questionId, version },
    }).then((num) => {
        if (num === 1) {
            res.json(question);
        } else {
            res.json({
                error: true,
                msg: `question ${questionId} version ${version} does not exist`,
                dne_error: true,
            });
        }
    });
});

// delete question (all versions)
app.delete("/api/questions/:questionId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { questionId } = req.params;
    models.Question.delete({ where: { id: questionId } }).then((questions) => {
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

// get all answered
app.get("/api/answered", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { traineeId, assessorId } = req.query;
    let where = {};
    if (traineeId) {
        where["traineeId"] = traineeId;
    }
    if (assessorId) {
        where["assessorId"] = assessorId;
    }
    models.Answered.findAll({ where, order: [["id", "ASC"]] }).then(
        (answered) => res.json(answered)
    );
});

// get answered by id
app.get("/api/answered/:answeredId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { answeredId } = req.params;
    models.Answered.findByPk(answeredId).then((question) => {
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
    const question = req.body;
    models.Answered.add(question)
        .then((q) => res.json(q))
        .catch((err) => {
            const error = err.errors[0];
            let response = { error: true, message: error.message };
            // TODO: test and fix
            switch (error.type) {
                case "notNull Violation":
                    // response.msg = "something is null";
                    response.null_violation = true;
                    break;
                default:
                    break;
            }
            res.json(response);
        });
});

// update answered
app.post("/api/answered/:answeredId", (req, res) => {
    if (!checkAuth(req, res)) return;
    const { answeredId } = req.params;
    const question = req.body;
    models.Answered.update(question, { where: { id: answeredId } }).then(
        (num) => {
            if (num == 1) {
                res.json(question);
            } else {
                res.json({
                    error: true,
                    msg: `answered ${answeredId} does not exist`,
                    dne_error: true,
                });
            }
        }
    );
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
