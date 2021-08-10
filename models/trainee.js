"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Trainee extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Trainee.init(
        {
            score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: "Trainee",
        }
    );
    Trainee.removeAttribute("id");
    return Trainee;
};
