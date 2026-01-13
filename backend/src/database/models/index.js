const dbConfig = require("../../config/db");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  define: {
    timestamps: false,
    freezeTableName: true,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  timezone: "+07:00",
  dialectOptions: { timezone: "+07:00" },
  logging: process.env.NODE_ENV ? false : console.log,
});

const db = {};

db.DataTypes = DataTypes;
db.sequelize = sequelize;

db.roles = require("./roles.model")(sequelize, DataTypes);
db.permissions = require("./permissions.model")(sequelize, DataTypes);
db.users = require("./users.model")(sequelize, DataTypes);
db.user_roles = require("./user_roles.model")(sequelize, DataTypes);
db.role_permissions = require("./role_permissions.model")(sequelize, DataTypes);
db.user_permissions = require("./user_permissions.model")(sequelize, DataTypes);

db.sessions = require("./sessions.model")(sequelize, DataTypes);
db.refresh_tokens = require("./refresh_tokens.model")(sequelize, DataTypes);
db.cookies_trusted_devices = require("./cookies_trusted_devices.model")(sequelize, DataTypes);

db.courses = require("./courses.model")(sequelize, DataTypes);
db.course_versions = require("./course_versions.model")(sequelize, DataTypes);
db.course_lessons = require("./course_lessons.model")(sequelize, DataTypes);
db.lesson_contents = require("./lesson_contents.model")(sequelize, DataTypes);

db.assignments = require("./assignments.model")(sequelize, DataTypes);
db.assignment_submissions = require("./assignment_submissions.model")(sequelize, DataTypes);

db.course_assessments = require("./course_assessments.model")(sequelize, DataTypes);


db.enrollments = require("./enrollments.model")(sequelize, DataTypes);





db.course_instructors = require("./course_instructors.model")(sequelize, DataTypes);

db.audit_event_types = require("./audit_event_types.model")(sequelize, DataTypes);
db.audit_events = require("./audit_events.model")(sequelize, DataTypes);
db.entity_change_logs = require("./entity_change_logs.model")(sequelize, DataTypes);
db.system_logs = require("./system_logs.model")(sequelize, DataTypes);

Object.keys(db).forEach((key) => {
  const model = db[key];
  if (model && typeof model.associate === "function") {
    model.associate(db);
  }
});

module.exports = db;
