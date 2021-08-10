"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface
                .addColumn("Trainees", "userId", {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Users",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                })
                .then(() => {
                    return queryInterface.addConstraint("Trainees", {
                        type: "primary key",
                        fields: ["userId"],
                        name: "Trainees_pkey",
                    });
                }),
            queryInterface
                .addColumn("Assessors", "userId", {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Users",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                })
                .then(() => {
                    return queryInterface.addConstraint("Assessors", {
                        type: "primary key",
                        fields: ["userId"],
                        name: "Assessors_pkey",
                    });
                }),
        ]);
        await Promise.all([
            queryInterface.addColumn("Answered", "traineeId", {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Trainees",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
            queryInterface.addColumn("Answered", "assessorId", {
                type: Sequelize.INTEGER,
                references: {
                    model: "Assessors",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.removeColumn("Answered", "traineeId"),
            queryInterface.removeColumn("Answered", "assessorId"),
        ]);
        await Promise.all([
            queryInterface.removeColumn("Trainees", "userId"),
            queryInterface.removeColumn("Assessors", "userId"),
        ]);
    },
};
