const Template = require('./template')
const { fromPairs, toPairs, escape } = require('./util')


class Query {

    toString() {
        return this.sql
    }

    run(adapter) {
        return adapter.run(this.sql)
    }
}

exports.Query = Query

exports.SimpleQuery = class SimpleQuery extends Query {

    constructor(template) {
        super()
        this.template = new Template(template)
    }

    vars(vars) {
        this._vars = vars
        return this
    }

    get sql() {
        return this.template.render(fromPairs(toPairs(this._vars).map(([key, value]) => [key, escape(value)])))
    }

}
