var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

//connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('DROP TABLE IF EXISTS `' + dbconfig.database + '`.`' + dbconfig.users_table + '`');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `p_id` VARCHAR(255) NOT NULL, \
    `provider` VARCHAR(32) NOT NULL, \
    `name` VARCHAR(64) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
    `token` VARCHAR(255), \
    `email` CHAR(64), \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `name_UNIQUE` (`name` ASC), \
    UNIQUE INDEX `p_id_UNIQUE` (`p_id` ASC), \
    UNIQUE INDEX `email_UNIQUE` (`email` ASC) \
)');

console.log('Success: Database Created!')

connection.end();