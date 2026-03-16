const { DataSource } = require('typeorm')
const config = require("./ormconfig")

const AppDataSource = new DataSource(config)
 
module.exports = AppDataSource