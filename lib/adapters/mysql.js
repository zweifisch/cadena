const { promised } = require('../util')
const { escape } = require('sqlstring')

class Adapter {

    constructor(url) {
        const mysql = require('mysql')
        this.pool = mysql.createPool(url)
        this.query = this.pool.query.bind(this.pool)
    }

    run(sql, values) {
        return promised(this.query, sql, values)
    }

    getOne(sql, values) {
        return promised(this.query, sql, values).then(([x]) => x)
    }

    getAll(sql, values) {
        return promised(this.query, sql, values)
    }

    end() {
        return promised(this.pool.end.bind(this.pool))
    }

    escape(value) {
        return escape(value)
    }
}

exports.Adapter = Adapter
exports.flavor = 'mysql'
