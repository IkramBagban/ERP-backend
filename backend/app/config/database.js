require("dotenv").config();
module.exports = {
    HOST        : process.env.MYSQL_DB_HOST_NAME || 'localhost',
    USER        : process.env.MYSQL_DB_USER_NAME || 'root',
    PASSWORD    : process.env.MYSQL_DB_PASSWORD || '',
    DB          : process.env.MYSQL_DB_NAME || process.env.APP_NAME,
    dialect     : "mysql",
    pool        : {
        max     : 5,
        min     : 0,
        acquire : 30000,
        idle    : 10000
    }
};