
function escape(value) {
    if (value === null || value === undefined) {
        return 'NULL'
    }

    if (typeof value === 'number') {
        return `${value}`
    }

    if (value === true) {
        return '1'
    }

    if (value === false) {
        return '0'
    }

    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`
    }

    if (value instanceof Date) {
        return `'${value.toUTCString()}'`
    }

    if (Array.isArray(value)) {
        return value.map(x => Array.isArray(x) ? `(${escape(x)})` : escape(x)).join(', ')
    }

    if (typeof value.toSqlString === 'function') {
        return value.toSqlString()
    }

    if (typeof value === 'object') {
        return Object.entries(value).map(([key, value]) => `${key} = ${escape(value)}`).join(', ')
    }

    throw Error(`can't escape ${value}`)
}

module.exports = escape
