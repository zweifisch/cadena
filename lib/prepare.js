const { Query } = require('./query')
const { escape } = require('./util')


exports.sql = (strings, ...values) => [strings.join('?'), values]

exports.Prepare = class Prepare extends Query {

    constructor(strings, ...values) {
        super()
        this.strings = strings
        this.values = values
    }

    get sql() {
        return this.strings.map((str, idx) => idx < this.values.length ? str + escape(this.values[idx]) : str).join('')
    }

    prepare () {
        let strings = []
        let values = []
        for (let i = 0; i < this.strings.length; i ++) {
            if (i < this.values.length) {
                if (typeof this.values[i] === 'object') {
                    let keys = Object.keys(this.values[i])
                    strings.push(this.strings[i] + keys.map(key => `\`${key}\` = ?`).join(', '))
                    values = values.concat(keys.map(key => this.values[i][key]))
                } else {
                    strings.push(this.strings[i] + '?')
                    values.push(this.values[i])
                }
            } else {
                strings.push(this.strings[i])
            }
        }
        return [strings.join(''), values]
    }

    run(adapter) {
        return adapter.run(...this.prepare())
    }

    getOne(adapter) {
        return adapter.getOne(...this.prepare())
    }

    getAll(adapter) {
        return adapter.getAll(...this.prepare())
    }
}
