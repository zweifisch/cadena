const { Query } = require('./query')
const { notEmpty, buildCriteria } = require('./util')

exports.Delete = class Delete extends Query {

    delete(table) {
        this.tableName = table
        return this
    }

    where(criteria) {
        this.criteria = criteria
        return this
    }

    limit(limit) {
        this._limit = limit
        return this
    }

    toSql(escape) {
        let criteria = this.criteria && buildCriteria(this.criteria, escape)
        let where = criteria && `WHERE ${criteria}`
        let limit = this._limit && `LIMIT ${this._limit}`
        return ['DELETE FROM', this.tableName, where, limit].filter(notEmpty).join(' ')
    }
}
