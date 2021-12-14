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

        static async generateCode({ num = 1, attempts = 10 } = {}) {
            if (num < 1) return [];
            const codes = new Set(
                (
                    await Drill.findAll({
                        raw: true,
                        attributes: ["code"],
                    })
                ).map((obj) => obj.code)
            );
            let inc = 1;
            if (attempts === -1) {
                // infinite attempts
                attempts = 1;
                inc = 0;
            }
            const created = [];
            for (let i = 0; i < num; i++) {
                let success = false;
                for (let j = 0; j < attempts; j += inc) {
                    const code = nanoid(10);
                    if (!codes.has(code)) {
                        success = true;
                        created.push(code);
                        codes.add(code);
                        break;
                    }
                }
                if (!success) {
                    created.push(null);
                }
            }
            return created;
        }

        static async add(drill) {
            const [code] = await this.generateCode();
            if (!code) {
                console.log("could not generate unique code for drill");
                return null;
            }
            return Drill.create({ ...drill, code });
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
