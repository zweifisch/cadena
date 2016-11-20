const { Query } = require('./query')
const { notEmpty, buildCriteria } = require('./util')

exports.Delete = class Delete extends Query {

    delete(table) {
        this.tableName = table
        return this
    }

    where(criteria) {
        this.criteria = buildCriteria(criteria)
        return this
    }

    limit(limit) {
        this._limit = limit
        return this
    }

    get sql() {
        let where = this.criteria && `WHERE ${this.criteria}`
        let limit = this._limit && `LIMIT ${this._limit}`
        return ['DELETE FROM', this.tableName, where, limit].filter(notEmpty).join(' ')
    }
}
