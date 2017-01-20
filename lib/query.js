class Query {

    toString() {
        return this.sql
    }

    run(adapter) {
        return adapter.run(this.sql)
    }
}

exports.Query = Query
