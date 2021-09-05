"use strict";
const { nanoid } = require("nanoid");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Drills", [
            {
                id: 1,
                code: nanoid(10),
                name: "COS126",
                numQuestions: 3,
                dueDate: "2021-09-01",
                tags: JSON.stringify(["course:126 old"]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Drills", { id: 1 });
    },
};
