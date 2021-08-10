"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Assessor extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Assessor.init(
        {},
        {
            sequelize,
            modelName: "Assessor",
        }
    );
    Assessor.removeAttribute("id");
    return Assessor;
};
