const assert = require('assert')
const { Query } = require('./query')
const { flatten, notEmpty, buildCriteria, buildOrderBy, quote } = require('./util')

exports.Select = class Select extends Query {

    constructor() {
        super()
        this.orders = []
        this.joins = []
    }

    select(fields) {
        this.fields = fields.length ? flatten(fields): ["*"]
        return this
    }

    where(criteria) {
        this.criteria = [criteria]
        return this
    }

    or(criteria) {
        this.criteria.push(criteria)
        return this
    }

    from(table) {
        this.table = 'string' === typeof table ? table : `(${table})`
        return this
    }

    leftJoin(table) {
        this.joins.push(['LEFT', table])
        return this
    }

    rightJoin(table) {
        this.joins.push(['RIGHT', table])
        return this
    }

    innerJoin(table) {
        this.joins.push(['INNER', table])
        return this
    }

    on(condition) {
        assert(this.joins.length, `No join specified`)
        this.joins[this.joins.length - 1][2] = condition
        return this
    }

    groupBy(field) {
        this.groupByField = field
        return this
    }

    limit(...limit) {
        this.limits = limit
        return this
    }

    orderBy(...fields) {
        this.orders = this.orders.concat(...fields)
        return this
    }

    order(order) {
        assert(order === 'ASC' || order === 'DESC', `Unexpected order ${order}`)
        this.orders.push(order)
        return this
    }

    asc() {
        return this.order('ASC')
    }

    desc() {
        return this.order('DESC')
    }

    count(alias) {
        this.countAs = alias || 'total'
        return this
    }

    toSql(escape) {
        let joins = this.joins.map(([type, tbl, condition]) => {
            condition = buildCriteria(condition, escape).replace(/'/g, '')
            assert(condition, 'Join condition not set')
            return `${type} JOIN ${tbl} ON ${condition}`
        }).join(' ')
        let criteria
        if (this.criteria) {
            criteria = this.criteria.length > 1 ? buildCriteria({$or: this.criteria}, escape) : buildCriteria(this.criteria[0], escape)
        }
        return [
            'SELECT',
            this.countAs ? `COUNT(*) AS \`${this.countAs}\`` : this.fields.map(quote).join(', '),
            'FROM',
            quote(this.table),
            joins,
            criteria && `WHERE ${criteria}`,
            this.groupByField && `GROUP BY ${this.groupByField}`,
            !this.countAs && this.orders.length && `ORDER BY ${buildOrderBy(this.orders)}`,
            !this.countAs && this.limits && `LIMIT ${this.limits.join(',')}`
        ].filter(notEmpty).join(' ')
    }

    getOne(adapter) {
        return adapter.getOne(this.sql)
    }

    getAll(adapter) {
        return adapter.getAll(this.sql)
    }
}
