const {escape} = require('sqlstring')

class Query {

    toString() {
        return this.sql
    }

    get sql() {
        return this.toSql(escape)
    }

    run(adapter) {
        return adapter.run(this.toSql(adapter.escape))
    }
}

exports.Query = Query
