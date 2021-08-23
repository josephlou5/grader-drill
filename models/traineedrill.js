"use strict";
const { Model, Op } = require("sequelize");
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

        static complete(traineeDrillId) {
            return TraineeDrill.update(
                { completedAt: new Date() },
                { where: { id: traineeDrillId } }
            ).then((num) => {
                if (num === 0) return null;
                return TraineeDrill.findByPk(traineeDrillId);
            });
        }

        static delete(traineeDrillId) {
            return TraineeDrill.destroy({ where: { id: traineeDrillId } }).then(
                (num) => {
                    if (num === 0) return null;
                    return TraineeDrill.findByPk(traineeDrillId, {
                        paranoid: false,
                    });
                }
            );
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
                    return completedAt?.toISOString().slice(0, 10) || "N/A";
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
