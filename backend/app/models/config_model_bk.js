const db    = require("../models");

db.sequelize.sync();

module.exports = db;