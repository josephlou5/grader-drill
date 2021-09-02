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

// drills
db.Drill.hasMany(db.TraineeDrill, {
    foreignKey: "drillId",
    allowNull: false,
});
db.TraineeDrill.belongsTo(db.Drill, {
    foreignKey: "drillId",
    allowNull: false,
});
db.Trainee.hasMany(db.TraineeDrill, {
    foreignKey: "traineeId",
    allowNull: false,
});
db.TraineeDrill.belongsTo(db.Trainee, {
    foreignKey: "traineeId",
    allowNull: false,
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
db.TraineeDrill.hasMany(db.Answered, {
    foreignKey: "traineeDrillId",
    allowNull: false,
});
db.Answered.belongsTo(db.TraineeDrill, {
    foreignKey: "traineeDrillId",
    allowNull: false,
});
db.Assessor.hasMany(db.Answered, {
    foreignKey: "assessorId",
});
db.Answered.belongsTo(db.Assessor, {
    foreignKey: "assessorId",
});

// ordered scopes
Object.values(db).forEach((model) =>
    model.addScope("ordered", { order: [["id", "ASC"]] })
);

db.Answered = db.Answered.scope("ordered");

// eager loading scopes
db.User.addScope("include", {
    attributes: {
        exclude: ["createdAt", "updatedAt"],
    },
});
db.User.Include = db.User.scope("include");
db.Trainee.addScope("include", {
    attributes: {
        exclude: ["createdAt", "updatedAt"],
    },
    include: db.User.Include,
});
db.Trainee.Include = db.Trainee.scope("include");
db.Assessor.addScope("include", {
    attributes: {
        exclude: ["createdAt", "updatedAt"],
    },
    include: db.User.Include,
});
db.Assessor.Include = db.Assessor.scope("include");
db.Drill.addScope("include", {
    attributes: {
        exclude: ["createdAt", "updatedAt"],
    },
    paranoid: false,
});
db.Drill.Include = db.Drill.scope("include");
db.TraineeDrill.addScope("include", {
    attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt"],
    },
});
db.TraineeDrill.Include = db.TraineeDrill.scope("include");

db.TraineeDrill.addScope("ongoing", {
    where: { completedAt: null },
});
db.TraineeDrill.addScope("includeTrainee", {
    include: db.Trainee.Include,
});
db.TraineeDrill.addScope("includeDrill", {
    include: db.Drill.Include,
});
db.TraineeDrill.IncludeTrainee = db.TraineeDrill.scope(
    "include",
    "includeTrainee"
);
db.TraineeDrill.IncludeDrill = db.TraineeDrill.scope(
    "ordered",
    "include",
    "includeDrill"
);
db.Drill.addScope("includeDrill", {
    include: {
        model: db.TraineeDrill.IncludeTrainee,
        include: db.Answered,
    },
});
db.Drill.IncludeDrill = db.Drill.scope("includeDrill");
db.Answered.addScope("includeTrainee", {
    include: db.Trainee.Include,
});
db.Answered.addScope("includeAssessor", {
    include: db.Assessor.Include,
});
db.Answered.addScope("includeDrill", {
    include: {
        model: db.TraineeDrill.IncludeDrill,
        paranoid: false,
    },
});
db.Answered.IncludeAll = db.Answered.scope(
    "ordered",
    "includeTrainee",
    "includeAssessor",
    "includeDrill"
);
db.Answered.IncludeUsers = db.Answered.scope(
    "ordered",
    "includeTrainee",
    "includeAssessor"
);
db.Answered.IncludeDrill = db.Answered.scope("ordered", "includeDrill");
db.Answered.IncludeTraineeDrill = db.Answered.scope(
    "ordered",
    "includeTrainee",
    "includeDrill"
);

// other scopes

// default is uncompleted
db.TraineeDrill.All = db.TraineeDrill;
db.TraineeDrill = db.TraineeDrill.scope("ongoing");

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
