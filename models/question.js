"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Question extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static add(question) {
            let fields = [
                "id",
                "version",
                "questionType",
                "hasCodeField",
                "hasAnswerField",
                "questionText",
                "tags",
            ];
            if (question.hasCodeField) {
                fields.push("code", "highlights");
            }
            switch (question.questionType) {
                case "Comment":
                // fall through
                case "Highlight":
                    fields.push("rubric");
                    break;
                case "Multiple Choice":
                    fields.push("answerChoices", "correct");
                    break;
                default:
                    break;
            }
            return Question.create(question, { fields });
        }

        static updateById(questionId, version, question) {
            const options = { where: { id: questionId, version } };
            return Question.update(question, options).then((num) => {
                if (num === 0) return null;
                return Question.findOne(options);
            });
        }

        static delete(questionId) {
            const where = { id: questionId };
            return Question.destroy({ where }).then((num) => {
                if (num === 0) return null;
                return Question.findAll({
                    where,
                    order: [["deletedAt", "DESC"]],
                    limit: num,
                    paranoid: false,
                });
            });
        }
    }
    Question.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            version: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            questionType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            hasCodeField: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            hasAnswerField: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            questionText: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            code: {
                type: DataTypes.TEXT,
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
            // the rubric array as a JSON string
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
            // the answer choices array as a JSON string
            answerChoices: {
                type: DataTypes.TEXT,
                get() {
                    const val = this.getDataValue("answerChoices");
                    if (val == null) return null;
                    return JSON.parse(val);
                },
                set(value) {
                    this.setDataValue("answerChoices", JSON.stringify(value));
                },
            },
            correct: {
                type: DataTypes.INTEGER,
            },
            tags: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "",
            },
        },
        {
            sequelize,
            modelName: "Question",
            paranoid: true,
        }
    );
    return Question;
};
