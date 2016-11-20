const trim = require('lodash.trim')
const toPairs = require('lodash.topairs')
const fromPairs = require('lodash.frompairs')
const { escape } = require('sqlstring')
const assert = require('assert')

exports.escape = escape
exports.trim = trim
exports.toPairs = toPairs
exports.fromPairs = fromPairs
exports.flatten = array => [].concat(...array)

const mapcat = (fn, list) => [].concat(...list.map(fn))

const notEmpty = x => !!x
exports.notEmpty = notEmpty

const quote = x => {
    if (x === '*' || x.indexOf('(') !== -1 || x.indexOf(' ') !== -1) {
        return x
    } if (x.indexOf('.') !== -1) {
        return x.split('.').map(x => '`' + x + '`').join('.')
    } else {
        return '`' + x + '`'
    }
}
exports.quote = quote

const buildSingleCriteria = (criteria) =>
	toPairs(criteria).map(([key, val]) => {
		if (val === undefined)
            return undefined
        if (val === null)
            return `${quote(key)} IS NULL`
        if (Array.isArray(val))
            return `${quote(key)} IN (${val.map(escape).join(', ')})`
        if (typeof val === 'object') {
            for (let op of Object.keys(val)) {
                let v = val[op]
                if (v === undefined)
                    return undefined
                if (op === 'contains')
                    return `${quote(key)} LIKE '%${trim(escape(v), "'")}%'`
                if (op === 'between') {
                    if (!Array.isArray(v))
                        throw Error `Array expected for ${key}`
                    let [left, right] = v
                    return `${quote(key)} BETWEEN ${escape(left)} AND ${escape(right)}`
                }
                return `${quote(key)} ${op} ${escape(v)}`
            }
        }
        return `${quote(key)} = ${escape(val)}`
    }).filter(notEmpty).join(' AND ')

const buildCriteria = (criteria) => {
    if ('$or' in criteria) {
        assert(Array.isArray(criteria.$or), 'OR expected an Array')
        return criteria.$or.map(x => x.$or ? `(${buildCriteria(x)})` : buildCriteria(x)).filter(notEmpty).join(' OR ')
    }
    if ('$and' in criteria) {
        assert(Array.isArray(criteria.$and), 'AND expected an Array')
        return criteria.$and.map(x => x.$or ? `(${buildCriteria(x)})` : buildCriteria(x)).filter(notEmpty).join(' AND ')
    }
    return buildSingleCriteria(criteria)
}

exports.buildCriteria  = buildCriteria

exports.buildOrderBy = (orderBy) => trim(mapcat(x => {
    if (x === 'ASC' || x === 'DESC')
        return x + ',' 
    else if (x.charAt(0) === '-')
        return [quote(x.substr(1)), 'DESC,']
    return quote(x)
}, orderBy).join(' '), ',')

exports.promised = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (err, result) => err ? reject(err) : resolve(result)))
