const assert = require('assert')
const { Query } = require('./query')
const { notEmpty, buildCriteria, toPairs, quote } = require('./util')

exports.Update = class Update extends Query {

    constructor() {
        super()
        this.fields = {}
    }

    update(table) {
        this.tableName = table
        return this
    }

    where(criteria) {
        this.criteria = criteria
        return this
    }

    limit(...limit) {
        this.limits = limit
        return this
    }

    set(field, value) {
        if ('object' === typeof field) {
            assert(undefined === value, "Unexpected paramter of type 'object' passed to set()")
            Object.assign(this.fields, field)
        } else {
            this.fields[field] = value
        }
        return this
    }

    toSql(escape) {
        let criteria = this.criteria && buildCriteria(this.criteria, escape)
        let where = criteria && `WHERE ${criteria}`
        let limit = this.limits && `LIMIT ${this.limits.join(',')}`
        let fields = toPairs(this.fields).map(([key, value])=> `${quote(key)} = ${escape(value)}`).join(', ')
        return ['UPDATE', this.tableName, `SET ${fields}`, where, limit].filter(notEmpty).join(' ')
    }
}
