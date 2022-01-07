"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.addColumn("Questions", "maxPoints", {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
            queryInterface.addColumn("Answered", "maxPoints", {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.removeColumn("Questions", "maxPoints"),
            queryInterface.removeColumn("Answered", "maxPoints"),
        ]);
    },
};
