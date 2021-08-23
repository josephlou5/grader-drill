"use strict";
const crypto = require("crypto");
const password = "password";
const salt = crypto.randomBytes(32).toString("hex");
const hash = crypto
    .pbkdf2Sync(password.normalize(), salt, 10000, 64, "sha512")
    .toString("hex");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Users", [
            {
                id: 1,
                email: "admin@test.com",
                salt,
                hash,
                roles: JSON.stringify(["Admin"]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Users", { id: 1 });
    },
};
