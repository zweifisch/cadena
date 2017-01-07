const assert = require('assert')
const { Query } = require('./query')
const { notEmpty, buildCriteria, toPairs, quote, escape } = require('./util')

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
        this.criteria = buildCriteria(criteria)
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

    get sql() {
        let where = this.criteria && `WHERE ${this.criteria}`
        let limit = this.limits && `LIMIT ${this.limits.join(',')}`
        let fields = toPairs(this.fields).map(([key, value])=> `${quote(key)} = ${escape(value)}`).join(', ')
        return ['UPDATE', this.tableName, `SET ${fields}`, where, limit].filter(notEmpty).join(' ')
    }
}
