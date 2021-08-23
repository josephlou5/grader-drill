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

        static async updateById(drillId, drill) {
            const num = await Drill.update(drill, { where: { id: drillId } });
            if (num === 0) return null;
            return Drill.findByPk(drillId);
        }

        static async delete(drillId) {
            const num = await Drill.destroy({ where: { id: drillId } });
            if (num === 0) return null;
            const drill = await Drill.findByPk(drillId, { paranoid: false });
            const traineeDrills = await drill.getTraineeDrills();
            await Promise.all(traineeDrills.map((d) => d.destroy()));
            return drill;
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
            expired: {
                type: DataTypes.VIRTUAL,
                get() {
                    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
                    const today = Date.now();
                    // on the day of the due date, still valid
                    const dueDate =
                        Date.parse(this.getDataValue("dueDate")) +
                        MILLISECONDS_PER_DAY * 1;
                    return today > dueDate;
                },
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
