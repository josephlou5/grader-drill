"use strict";
const { Model } = require("sequelize");
const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
    class Drill extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static add(drill) {
            return Drill.create({ ...drill, code: nanoid(10) });
        }

        static delete(drillId) {
            return Drill.destroy({ where: { id: drillId } }).then((num) => {
                if (num === 0) return null;
                return Drill.findByPk(drillId, { paranoid: false }).then(
                    (drill) =>
                        drill
                            .getTraineeDrills()
                            .then((drills) =>
                                Promise.all(drills.map((d) => d.destroy()))
                            )
                            .then(() => drill)
                );
            });
        }
    }
    Drill.init(
        {
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            numQuestions: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dueDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            tags: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "",
            },
        },
        {
            sequelize,
            modelName: "Drill",
            paranoid: true,
        }
    );
    return Drill;
};
