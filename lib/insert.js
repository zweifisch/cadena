const { Query } = require('./query')

exports.Insert = class Insert extends Query {

    insert(fields, data) {
        this.fields = fields
        this.data = data
        return this
    }

    into(table) {
        this.table = table
        return this
    }

    toSql(escape) {
        if (!this.data) {
            let fields = this.fields
            this.fields = Object.keys(this.fields)
            this.data = [this.fields.map(field => fields[field])]
        }
        let data = this.data.map(row => `(${row.map(escape).join(', ')})`).join(',\n')
        let fields = `(${this.fields.join(', ')})`
        return ['INSERT INTO', this.table, fields, 'VALUES', data].join(' ')
    }
}
