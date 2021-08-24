"use strict";
const { Model } = require("sequelize");

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
            const u = await User.create(user);
            await createRoles(u);
            return u;
        }

        static async updateRoles(userId, roles) {
            const num = await User.update({ roles }, { where: { id: userId } });
            if (num === 0) return null;
            const user = await User.findByPk(userId);
            await createRoles(user);
            return user;
        }
    }
    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
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
                validate: {
                    validRoles(roles) {
                        if (typeof roles === "string") {
                            roles = JSON.parse(roles);
                        }
                        if (roles.length === 0) {
                            throw new Error("User must have a role");
                        }
                    },
                },
            },
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
