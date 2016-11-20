# cadena

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

cadena helps you to write safer SQL

- supports parameterized query
- `run()` returns promise
- supports mysql and and sqlite3

## usage

```sh
npm install --save cadena
```

```js
const { select, connect, query } = require('cadena')
const db = connect('mysql', 'mysql://guest:guest@127.0.0.1/test')

select('name', 'id')
    .from('players')
    .where({score: { '>=': 90 }})
    .limit(0, 10)
    .orderBy('score').desc().run(db)

// just get SQL as string
select().from('players').toString()

query("select * from tbl where id={id}", {
    id: '33b27b80-bee3-4d1b-aa9a-231bf250f344'
})
// select * from tbl where id='33b27b80-bee3-4d1b-aa9a-231bf250f344'
```

### select

```js
select(['name', 'id']) // SELECT name, id

select() // SELECT *
```

#### where

```js
where({key: 'value'}) // WHERE `key` = 'value'

where({
    score: {between: [80, 90]},
    name: {contains: 'alberto'}
    group: ['A', 'B']
}) // WHERE `score` BETWEEN (80, 90) AND `name` LIKE '%alberto%' AND `group` IN ('A', 'B')

where({key: {'<': min}}).or({key: {'>': max}}) // WHERE `key` < min OR `key` > max
```

undefined values are ignored

```js
where({key: undefined}) // not output
where({key: undefined, key2: 'value'}) // WHERE `key2` = 'value'
where({key: undefined}).or({key2: 'value'}) // WHERE `key2` = 'value'
```

nested and/or

```js
where(and(
    or({ n: 1 }, { n: 2 }),
    { k: 1 }))
// WHERE (`n` = 1 OR `n` = 2) AND `k` = 1
```

a more verbose form

```js
where({
    $and: [
        { $or: [{n: 1}, {n: 2}] },
        { k: 1 }
    ]
})
```

#### orderBy

```js
orderBy('field1', 'field2') // ORDER BY `field1`, `field2`

orderBy(['field1', 'field2']) // ORDER BY `field1`, `field2`
orderBy(['-field1', 'field2']) // ORDER BY `field1` DESC, `field2`

orderBy('field1', 'asc', 'field2', 'desc') // ORDER BY `field1` ASC, `field2` DESC

orderBy('field1').desc().orderBy('field2').asc() // ORDER BY `field1` DESC, `field2` ASC
```

#### join

```js
select('name', 'id').from('tbl').leftJoin('tbl2').on({tbl.id: "tbl2.tblId"})
```

### subquery

```js
let tbl = select('name', 'id').from('tbl')
select().from(tbl) // SELECT * FROM (SELECT `name`, `id` FROM `tbl`)
```

### insert

```js
insert({name: 'foo', score: 1}).into('players')
insert(['name', 'score'], [['foo', 1], ['bar', 2]]).into('players')
```

### upsert

```js
upsert({name: 'foo', score: 1}).into('players')
```

### update

```js
update('players').set({name: 'foo', score: 1}).where({id: 1})
```

```js
update('players').set('name', 'foo').set('score', 1).limit(1)
```

### delete

```js
del('players').where({id: 1})
```

```js
del('players').where({name: {contains: 'alberto'}}).limit(1)
```

### parameterized query

```js
query("insert into tbl set {row} on duplicate key update {row}",
    {row: {id: 1, name: 'first'}})
```

### mysql

```js
const db = cadena.connect('mysql', 'mysql://root:@127.0.0.1/test')
select().from('players').run(db)
```

### sqlite3

```js
const db = cadena.connect('sqlite3', ':memory:')
select().from('players').run(db)
```

[npm-image]: https://img.shields.io/npm/v/cadena.svg?style=flat
[npm-url]: https://npmjs.org/package/cadena
[travis-image]: https://img.shields.io/travis/zweifisch/cadena.svg?style=flat
[travis-url]: https://travis-ci.org/zweifisch/cadena
