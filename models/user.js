"use strict";
const { Model } = require("sequelize");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

function hash(password, salt) {
    // Hashes a password with a given salt.
    return crypto
        .pbkdf2Sync(password.normalize(), salt, 10000, 64, "sha512")
        .toString("hex");
}

function hashPassword(password) {
    // Generates a random salt and returns the salt and hashed password.
    const salt = crypto.randomBytes(32).toString("hex");
    return { salt, hash: hash(password, salt) };
}

async function createRoles(user) {
    const userId = user.id;
    await Promise.all(
        user.roles.map((role) => {
            const create = user[`create${role}`];
            if (!create) return null;
            return create
                .bind(user)({ userId })
                .catch(() => null);
        })
    );
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

        static async add(user) {
            const { password } = user;
            delete user.password;
            if (password) {
                Object.assign(user, hashPassword(password));
            }
            const u = await User.create(user);
            await createRoles(u);
            return u;
        }

        static async updateRoles(userId, roles) {
            const num = await User.update({ roles }, { where: { id: userId } });
            if (num === 0) return null;
            const user = await User.findByPk(userId);
            await createRoles(user);
            return user.noPass();
        }

        noPass() {
            const user = this.toJSON();
            delete user.salt;
            delete user.hash;
            return user;
        }

        checkPassword(password) {
            return this.hash === hash(password, this.salt);
        }

        async resetPassword() {
            const password = nanoid(16);
            const user = await this.update(hashPassword(password));
            const response = user.noPass();
            response.password = password;
            return response;
        }

        async changePassword(password) {
            const user = await this.update(hashPassword(password));
            return user.noPass();
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
            roles: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "[]",
                get() {
                    return JSON.parse(this.getDataValue("roles"));
                },
                set(value) {
                    this.setDataValue("roles", JSON.stringify(value));
                },
            },
        },
        {
            sequelize,
            modelName: "User",
            validate: {
                validRoles() {
                    if (this.roles.length === 0) {
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
