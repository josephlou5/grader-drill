"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
        );
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        );
        db[model.name] = model;
    });

// Object.keys(db).forEach((modelName) => {
//     if (db[modelName].associate) {
//         db[modelName].associate(db);
//     }
// });

// associations (in specific order)

// users
db.User.hasOne(db.Trainee, { foreignKey: "userId" });
db.Trainee.belongsTo(db.User, {
    foreignKey: { name: "userId", primaryKey: true },
});
db.User.hasOne(db.Assessor, { foreignKey: "userId" });
db.Assessor.belongsTo(db.User, {
    foreignKey: { name: "userId", primaryKey: true },
});

// answered
db.Trainee.hasMany(db.Answered, {
    foreignKey: "traineeId",
    allowNull: false,
});
db.Answered.belongsTo(db.Trainee, {
    foreignKey: "traineeId",
    allowNull: false,
});
db.Assessor.hasMany(db.Answered, {
    foreignKey: "assessorId",
});
db.Answered.belongsTo(db.Assessor, {
    foreignKey: "assessorId",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
