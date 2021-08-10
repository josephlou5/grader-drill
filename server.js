const express = require("express");
const path = require("path");
const { sequelize, Sequelize, ...models } = require("./models/index.js");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "client/build")));

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

// Routes

// for debugging: reset the database
if (process.env.NODE_ENV !== "production") {
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
            isAssessor: true,
            isTrainee: true,
        });
        for (let num = 1; num <= 3; num++) {
            await models.User.add({
                email: `trainee${num}@test.com`,
                isAssessor: false,
                isTrainee: true,
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

// get all users
app.get("/api/users", (req, res) => {
    models.User.findAll({ order: [["id", "ASC"]] }).then((users) =>
        res.json(users)
    );
});

// get user by id
app.get("/api/users/:userId", (req, res) => {
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

// add user
app.post("/api/users", (req, res) => {
    // const user = req.body;
    const user = {
        email: "jdlou+trainee@princeton.edu",
        isAssessor: false,
        isTrainee: true,
    };

    models.User.add(user)
        .then((user) => res.json(user))
        .catch((err) => {
            const error = err.errors[0];
            let response = { error: true, message: error.message };
            switch (error.type) {
                case "notNull Violation":
                    response.msg = "email is null";
                    response.null_violation = true;
                    break;
                case "unique violation":
                    response.msg = `email "${user.email}" is not unique`;
                    response.unique_violation = true;
                    break;
                default:
                    break;
            }
            res.json(response);
        });
});

// get all questions and all versions
app.get("/api/questions/all", (req, res) => {
    models.Question.findAll({
        order: [
            ["id", "ASC"],
            ["version", "ASC"],
        ],
    }).then((questions) => res.json(questions));
});

// get final versions of all questions
app.get("/api/questions", (req, res) => {
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

// all other get requests
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
