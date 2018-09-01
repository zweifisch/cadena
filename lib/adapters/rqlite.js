class Adapter {

    constructor(url) {
        const {Client} = require('rqlite-client')
        this.client = new Client(url)
    }

    run(sql, values) {
        return this.client.exec(sql)
    }

    getOne(sql, values) {
        return this.client.query(sql).then(rows => rows[0])
    }

    getAll(sql, values) {
        return this.client.query(sql)
    }

    end() {
        return Promise.resolve()
    }

    escape(value) {
        return require('./escape')(value)
    }
}

exports.Adapter = Adapter
exports.flavor = 'rqlite'
