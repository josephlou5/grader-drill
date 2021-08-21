"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Drills", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            numQuestions: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            dueDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
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
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Drills");
    },
};
