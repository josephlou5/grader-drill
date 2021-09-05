"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Questions", [
            {
                id: 1,
                version: 1,
                questionType: "Comment",
                hasCodeField: true,
                hasAnswerField: true,
                questionText:
                    "What feedback would you give a student about the following code?",
                code: "public boolean isTrue(boolean x) {\n    if (x == true) {\n        return true;\n    }\n    else {\n        return false;\n    }\n}",
                highlights: JSON.stringify([
                    {
                        startLine: 1,
                        startChar: 8,
                        endLine: 1,
                        endChar: 17,
                        byUser: false,
                    },
                ]),
                rubric: JSON.stringify([
                    {
                        points: 1,
                        text: "Says to replace code with `return x;`",
                    },
                    {
                        points: 1,
                        text: 'Provides good explanation including "boolean"',
                    },
                    { points: -1, text: "Lacks clarity / vague / imprecise" },
                ]),
                tags: JSON.stringify(["course:126", "course:126 old"]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        await queryInterface.bulkInsert("Questions", [
            {
                id: 2,
                version: 1,
                questionType: "Comment",
                hasCodeField: true,
                hasAnswerField: true,
                questionText:
                    "What feedback would you give a student who declares all their variables as instance variables when some should be local?",
                code: 'public class Test {\n    private String message = "Hello world";\n    public static void main(String[] args) {\n        StdOut.println(message);\n    }\n}',
                highlights: JSON.stringify([
                    {
                        startLine: 3,
                        startChar: 23,
                        endLine: 3,
                        endChar: 30,
                        byUser: false,
                    },
                ]),
                rubric: JSON.stringify([
                    {
                        points: 1,
                        text: "Explains difference between instance and local variables",
                    },
                    {
                        points: 1,
                        text: "Explains what to change and why",
                    },
                    {
                        points: -1,
                        text: "Lacks clarity / vague / imprecise / too high-level",
                    },
                ]),
                tags: JSON.stringify(["course:126", "course:126 old"]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        await queryInterface.bulkInsert("Questions", [
            {
                id: 3,
                version: 1,
                questionType: "Comment",
                hasCodeField: true,
                hasAnswerField: true,
                questionText:
                    "What feedback would you give a student who uses an object of type `ST<String, Integer[]>` when an object of type `ST<String, int[]>` would do just as well?",
                code: "ST map = new ST<String, Integer[]>;",
                highlights: JSON.stringify([
                    {
                        startLine: 0,
                        startChar: 24,
                        endLine: 0,
                        endChar: 33,
                        byUser: false,
                    },
                ]),
                rubric: JSON.stringify([
                    {
                        points: 1,
                        text: "Explains that `Integer` is an object / wrapper type",
                    },
                    {
                        points: 1,
                        text: "Explains the inefficiency of using `Integer` when unnecessary",
                    },
                    {
                        points: 1,
                        text: "Explains that `int[]` is already an object",
                    },
                    {
                        points: 1,
                        text: "Says to replace `Integer[]` with `int[]`",
                    },
                ]),
                tags: JSON.stringify(["course:126", "course:126 old"]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Questions", { id: [1, 2, 3] });
    },
};
