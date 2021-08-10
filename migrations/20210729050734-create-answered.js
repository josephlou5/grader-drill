"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Answered", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            questionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            version: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            autograded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            graded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            score: {
                type: Sequelize.INTEGER,
            },
            highlights: {
                type: Sequelize.TEXT,
            },
            rubric: {
                type: Sequelize.TEXT,
            },
            answer: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Answered");
    },
};
