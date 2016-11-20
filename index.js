const assert = require('assert')
const { Select } = require('./lib/select')
const { Schema } = require('./lib/schema')
const { Insert } = require('./lib/insert')
const { SimpleQuery } = require('./lib/query')
const { Update } = require('./lib/update')
const { Delete } = require('./lib/delete')
const { fromPairs, escape } = require('./lib/util')


exports.create = (table) => (new Schema()).table(table)

exports.select = (...fields) => (new Select()).select(fields)

exports.insert = (fields, data) => (new Insert()).insert(fields, data)

exports.query = (template, values) => (new SimpleQuery(template)).vars(values)

exports.update = (table) => (new Update()).update(table)

exports.delete = (table) => (new Delete()).delete(table)
exports.del = (table) => (new Delete()).delete(table)

exports.upsert = (table, row) => {
    let expanded = escape(row)
    let sql = ['INSERT INTO', table, 'SET',  expanded, 'ON DUPLICATE KEY UPDATE', expanded].join(' ')
    return new SimpleQuery(sql)
}


const sqlite3 = require("./lib/sqlite3")
const mysql = require("./lib/mysql")
const adapters = fromPairs([sqlite3, mysql].map(({Adapter, flavor}) => [flavor, Adapter]))

exports.connect = (flavor, url) => {
    assert(flavor in adapters, `Unsupported flavor ${flavor}`)
    return new adapters[flavor](url)
}

exports.asc = 'ASC'
exports.desc = 'DESC'

exports.and = (...args) => ({ $and: args })
exports.or = (...args) => ({ $or: args })
