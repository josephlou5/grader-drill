"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.addColumn("TraineeDrills", "drillId", {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Drills",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
            queryInterface.addColumn("TraineeDrills", "traineeId", {
                type: Sequelize.INTEGER,
                references: {
                    model: "Trainees",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
            queryInterface.addColumn("Answered", "traineeDrillId", {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "TraineeDrills",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        ]);
        await queryInterface.addConstraint("TraineeDrills", {
            fields: ["drillId", "traineeId"],
            type: "unique",
            name: "TraineeDrills_drill_trainee_unique",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            "TraineeDrills",
            "TraineeDrills_drill_trainee_unique"
        );
        await Promise.all([
            queryInterface.removeColumn("TraineeDrills", "drillId"),
            queryInterface.removeColumn("TraineeDrills", "traineeId"),
            queryInterface.removeColumn("Answered", "traineeDrillId"),
        ]);
    },
};
