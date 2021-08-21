"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface
            .createTable("Questions", {
                id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                },
                version: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                questionType: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                hasCodeField: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                },
                hasAnswerField: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                },
                questionText: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                code: {
                    type: Sequelize.TEXT,
                },
                highlights: {
                    type: Sequelize.TEXT,
                },
                rubric: {
                    type: Sequelize.TEXT,
                },
                answerChoices: {
                    type: Sequelize.TEXT,
                },
                correct: {
                    type: Sequelize.INTEGER,
                },
                tags: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    defaultValue: "",
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                deletedAt: {
                    type: Sequelize.DATE,
                },
            })
            .then(() =>
                queryInterface.addConstraint("Questions", {
                    type: "primary key",
                    fields: ["id", "version"],
                    name: "Questions_pkey",
                })
            );
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Questions");
    },
};
