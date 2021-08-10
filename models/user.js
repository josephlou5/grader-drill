"use strict";
const { Model } = require("sequelize");
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
                validUser() {
                    if (!this.isAssessor && !this.isTrainee) {
                        throw new Error("User must have a role.");
                    }
                },
            },
        }
    );
    return User;
};
