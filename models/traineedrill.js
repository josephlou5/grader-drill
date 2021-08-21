"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class TraineeDrill extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static add(drill) {
            return TraineeDrill.create(drill);
        }

        static delete(options) {
            return TraineeDrill.findAll(options).then((drills) => {
                if (drills.length === 0)
                    return new Promise((resolve) => resolve(null));
                return TraineeDrill.destroy(options).then(() => drills);
            });
        }
    }
    TraineeDrill.init(
        {
            progress: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            completedAt: {
                type: DataTypes.DATE,
            },
            completedDate: {
                type: DataTypes.VIRTUAL,
                get() {
                    const completedAt = this.getDataValue("completedAt");
                    return completedAt
                        ? completedAt.toISOString().slice(0, 10)
                        : "N/A";
                },
            },
        },
        {
            sequelize,
            modelName: "TraineeDrill",
            paranoid: true,
        }
    );
    return TraineeDrill;
};
