"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Answered extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static add(question) {
            // `question` has all the combined fields of
            // an Answered and a Question, so we can use the
            // `questionType` field to figure out which fields to keep
            // and to auto-grade multiple choice questions
            const fields = [
                "questionId",
                "version",
                "traineeId",
                "traineeDrillId",
                "highlights",
                "maxPoints",
            ];
            if (question.hasCodeField) {
                fields.push("code");
            }
            switch (question.questionType) {
                case "Comment":
                // fall through
                case "Highlight":
                    fields.push("rubric");
                    question.rubric = question.rubric.map(() => false);
                    break;
                case "Multiple Choice":
                    fields.push("answer", "autograded", "graded", "score");
                    const { correct, answer } = question;
                    Object.assign(question, {
                        autograded: true,
                        graded: true,
                        score: correct === answer ? 1 : 0,
                        maxPoints: 1,
                    });
                    break;
                default:
                    break;
            }
            return Answered.create(question, { fields });
        }

        // for the "reset" route in `server.js`
        static addRaw(question) {
            const fields = [
                "autograded",
                "graded",
                "score",
                "assessorId",
                "questionId",
                "version",
                "traineeId",
                "traineeDrillId",
                "graded",
                "highlights",
                "maxPoints",
            ];
            if (question.hasCodeField) {
                fields.push("code");
            }
            switch (question.questionType) {
                case "Comment":
                // fall through
                case "Highlight":
                    fields.push("rubric");
                    question.rubric = question.rubric.map(() => false);
                    break;
                case "Multiple Choice":
                    fields.push("answer", "score");
                    question.maxPoints = 1;
                    break;
                default:
                    break;
            }
            return Answered.create(question, { fields });
        }

        static async updateById(answeredId, answered) {
            const num = await Answered.update(answered, {
                where: { id: answeredId },
            });
            if (num === 0) return null;
            return await Answered.findByPk(answeredId);
        }

        static async delete(answeredId) {
            const answered = await Answered.findByPk(answeredId);
            if (!answered) return null;
            await answered.destroy();
            return answered;
        }
    }
    Answered.init(
        {
            questionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            autograded: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            graded: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            score: {
                type: DataTypes.INTEGER,
            },
            // the highlights array as a JSON string
            highlights: {
                type: DataTypes.TEXT,
                get() {
                    const val = this.getDataValue("highlights");
                    if (val == null) return null;
                    return JSON.parse(val);
                },
                set(value) {
                    this.setDataValue("highlights", JSON.stringify(value));
                },
            },
            // the rubric checked array as a JSON string
            rubric: {
                type: DataTypes.TEXT,
                get() {
                    const val = this.getDataValue("rubric");
                    if (val == null) return null;
                    return JSON.parse(val);
                },
                set(value) {
                    this.setDataValue("rubric", JSON.stringify(value));
                },
            },
            maxPoints: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            answer: {
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            modelName: "Answered",
            tableName: "Answered",
            validate: {
                checkGraded() {
                    if (!this.graded) return;
                    if (!this.autograded && this.assessorId == null) {
                        throw new Error(
                            "A graded question must have an assessor."
                        );
                    }
                    if (this.score == null) {
                        throw new Error("A graded question must have a score.");
                    }
                },
            },
        }
    );
    return Answered;
};
