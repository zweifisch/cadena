function zipmap(keys, values) {
    let ret = {}
    for (let i = 0; i < keys.length; i++) {
        ret[keys[i]] = values[i]
    }
    return ret
}

class Adapter {

    constructor(url) {
        const {Client} = require('rqlite-client')
        this.client = new Client(url)
    }

    run(sql, values) {
        return this.client.exec(sql)
    }

    getOne(sql, values) {
        return this.client.query(sql).then(({columns, values}) => values && values.length && zipmap(columns, values[0]))
    }

    getAll(sql, values) {
        return this.client.query(sql).then(({columns, values}) => values && values.length && values.map(x => zipmap(columns, x)))
    }

    end() {
        return Promise.resolve()
    }
}

exports.Adapter = Adapter
exports.flavor = "rqlite"
