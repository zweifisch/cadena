const { Query } = require('./query')
const { notEmpty } = require('./util')

exports.Schema = class Schema extends Query {

    constructor() {
        super()
        this.columns = []
    }

    table(table) {
        this.tableName = table
        return this
    }

    int(name, length) {
        this.columns.push([name, {type: 'INT', length: length}])
        return this
    }

    varchar(name, length) {
        this.columns.push([name, {type: 'VARCHAR', length: length}])
        return this
    }

    char(name, length) {
        this.columns.push([name, {type: 'CHAR', length: length}])
        return this
    }

    blob(name) {
        this.columns.push([name, {type: 'BLOB'}])
        return this
    }

    primary() {
        this.columns[this.columns.length - 1][1].primary = true
        return this
    }

    get sql() {
        return this.toSql()
    }

    toSql() {
        let fields = this.columns.map(([name, {type, length, primary}]) => {
            let len = length ? `(${length})` : ''
            return [`\`${name}\``, `${type}${len}`, primary ? 'PRIMARY KEY': null].filter(notEmpty).join(' ')
        }).join(',\n')
        return `CREATE TABLE IF NOT EXISTS ${this.tableName}\n(${fields})`
    }
}
