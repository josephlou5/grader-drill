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

        static async add(drill) {
            // only try 10 times to create drill
            for (let i = 0; i < 10; i++) {
                const code = nanoid(10);
                try {
                    return await Drill.create({ ...drill, code });
                } catch (err) {
                    console.log(`Adding drill with code "${code}" failed`);
                    let retry = false;
                    for (const error of err.errors) {
                        if (error.type === "unique violation") {
                            // generated code was not unique; try again
                            retry = true;
                            break;
                        }
                    }
                    if (!retry) throw err;
                }
            }
            return null;
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
                    const now = new Date();
                    // today's date in current time zone
                    const today = new Date(
                        // timezone offset is in minutes; convert to ms
                        now.getTime() - now.getTimezoneOffset() * 60 * 1000
                    )
                        .toISOString()
                        .slice(0, 10);
                    const dueDate = this.getDataValue("dueDate");
                    return today > dueDate;
                },
            },
            // the tags array as a JSON string
            tags: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "[]",
                get() {
                    return JSON.parse(this.getDataValue("tags"));
                },
                set(value) {
                    // remove empty tags
                    const tags = value.flatMap((val) => {
                        const tag = val.trim();
                        if (tag === "") return [];
                        return [tag];
                    });
                    this.setDataValue("tags", JSON.stringify(tags));
                },
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
