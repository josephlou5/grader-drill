const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

app.use(express.static(path.resolve("..", "client", "build")));

const data = {
    questionIdCounter: 3,
    questions: {
        1: {
            id: 1,
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
        2: {
            id: 2,
            hasCodeField: false,
            hasAnswerField: true,
            questionType: "Multiple Choice",
            questionText:
                "What would you say to a student who uses `Integer` where they should use `int`?",
            answerChoices: [
                "You should use `int` because it's shorter to type.",
                "`Integer` is a wrapper object and is not necessary for all cases.",
                "Always use `Integer` because it's an object.",
            ],
            correct: 1,
        },
    },
    answered: [
        {
            id: 1,
            trainee: "trainee1",
            hasCodeField: true,
            hasAnswerField: true,
            questionType: "Comment",
            questionText: "What's wrong with this `code`?",
            code: 'public class Question {\n    public static void main(String[] args) {\n        System.out.println("Hello world");\n    }\n}\nmore lines\nmore\n\nlines\n!\n!\nthis is a really long line for testing purposes to see if the scroll bar will show up here properly or not',
            highlights: [
                {
                    startLine: 0,
                    startChar: 14,
                    endLine: 1,
                    endChar: 5,
                    byUser: false,
                    text: "this is existing text",
                },
                {
                    startLine: 1,
                    startChar: 8,
                    endLine: 1,
                    endChar: 11,
                    byUser: true,
                },
            ],
            answers: ["this is highlight 1", "this is another highlight"],
            rubric: [
                {
                    points: 1,
                    text: "Says that nothing is wrong with the code",
                    checked: false,
                },
            ],
            graded: false,
        },
        {
            id: 2,
            assessor: "Auto-graded",
            trainee: "trainee2",
            hasCodeField: false,
            hasAnswerField: true,
            questionType: "Multiple Choice",
            questionText:
                "What would you say to a student who uses `Integer` where they should use `int`?",
            answerChoices: [
                "You should use `int` because it's shorter to type.",
                "`Integer` is a wrapper object and is not necessary for all cases.",
                "Always use `Integer` because it's an object.",
            ],
            correct: 1,
            answer: 0,
            score: 0,
            graded: true,
        },
        {
            id: 1,
            trainee: "trainee3",
            hasCodeField: true,
            hasAnswerField: false,
            questionType: "Highlight",
            questionText: "Highlight all the variables in the code.",
            code: 'public class Question {\n    public static void main(String[] args) {\n        int x = 5;\n        System.out.println(x);\n        String end = "This is the end of the program";\n    }\n}',
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

// TODO: update with database
function getQuestions() {
    return data.questions;
}

// TODO: update with database
function getAnswered() {
    return data.answered;
}

// Routes

app.get("/api/getAllQuestions", (req, res) => {
    res.json(getQuestions());
});

app.get("/api/getQuestion/:questionId", (req, res) => {
    const { questionId } = req.params;
    const question = getQuestions()[questionId] || null;
    res.json(question);
});

// TODO: update with database
app.post("/api/updateQuestion", (req, res) => {
    const question = req.body;
    if (question.id == null) {
        question["id"] = data.questionIdCounter++;
    }
    data.questions[question.id] = question;
    res.end();
});

app.get("/api/deleteQuestion/:questionId", (req, res) => {
    const { questionId } = req.params;
    const question = data.questions[questionId];
    if (!question) {
        res.json("Invalid question id");
        return;
    }
    delete data.questions[questionId];
    res.json(question);
});

app.get("/api/getAllAnswered", (req, res) => {
    res.json(getAnswered());
});

app.get("/api/getAnswered/:trainee/:questionId", (req, res) => {
    let { trainee, questionId } = req.params;
    questionId = parseInt(questionId);
    const answered = getAnswered();
    const question =
        answered.find((q) => q.trainee === trainee && q.id === questionId) ||
        // change to `null` because `undefined` throws a SyntaxError
        null;
    res.json(question);
});

// TODO: update with database
app.post("/api/updateAnswered", (req, res) => {
    const question = req.body;
    let found = false;
    let answered = data.answered.map((q) => {
        if (q.trainee === question.trainee && q.id === question.id) {
            found = true;
            return question;
        }
        return q;
    });
    if (!found) {
        return;
    }
    data.answered = answered;
    res.end();
});

// all other get requests
app.get("*", (req, res) => {
    res.sendFile(path.resolve("..", "client", "build", "index.html"));
});

// Listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
