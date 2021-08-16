"use strict";
const { Model } = require("sequelize");
const crypto = require("crypto");

function hash(password, salt) {
    // Hashes a password with a given salt.
    return crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");
}

function hashPassword(password) {
    // Generates a random salt and returns the salt and hashed password.
    const salt = crypto.randomBytes(32).toString("hex");
    return { salt, hash: hash(password, salt) };
}

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static add(user) {
            const { password } = user;
            delete user.password;
            if (password) {
                Object.assign(user, hashPassword(password.normalize()));
            }
            return User.create(user).then(async (u) => {
                if (u.isTrainee) {
                    await u.createTrainee({ userId: u.id });
                }
                if (u.isAssessor) {
                    await u.createAssessor({ userId: u.id });
                }
                return new Promise((resolve) => resolve(u));
            });
        }

        checkPassword(password) {
            return this.hash === hash(password.normalize(), this.salt);
        }
    }
    User.init(
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            salt: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            hash: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            isTrainee: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isAssessor: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "User",
            validate: {
                validRoles() {
                    if (!this.isAssessor && !this.isTrainee) {
                        throw new Error("User must have a role.");
                    }
                },
            },
            scopes: {
                noPass: {
                    attributes: { exclude: ["salt", "hash"] },
                },
            },
        }
    );
    return User;
};
