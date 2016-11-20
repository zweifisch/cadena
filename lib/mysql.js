const mysql = require('mysql')
const { promised } = require('./util')

class Adapter {

    constructor(url) {
        this.pool = mysql.createPool(url)
        this.query = this.pool.query.bind(this.pool)
    }

    run(sql) {
        return promised(this.query, sql)
    }

    getOne(sql) {
        return promised(this.query, sql).then(([x]) => x)
    }

    getAll(sql) {
        return promised(this.query, sql)
    }

    end() {
        return promised(this.pool.end.bind(this.pool))
    }
}

exports.Adapter = Adapter
exports.flavor = "mysql"
