const sqlite3 = require('sqlite3')
const { promised } = require('./util')

class Adapter {
    constructor (filename) {
        this.db = new sqlite3.Database(filename)
    }

    serialize () {
        if (!this.serialized) {
            let db = this.db
            this.serialized = new Promise((resolve, reject) => {
                db.serialize(() => resolve(db))
            })
        }
        return this.serialized
    }

    run (sql) {
        return this.serialize().then(db => promised(db.run.bind(db), sql))
    }

    getOne (sql) {
        return this.serialize().then(db => promised(db.get.bind(db), sql))
    }

    getAll (sql) {
        return this.serialize().then(db => promised(db.all.bind(db), sql))
    }

    end() {
        return promised(this.db.close.bind(this.db))
    }
}

exports.Adapter = Adapter
exports.flavor = "sqlite3"
