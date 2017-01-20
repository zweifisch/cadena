const test = require('tape')
const cadena = require('./index')

const { select, update, query, upsert, create, insert, del, desc, and, or, sql } = cadena


test('select *', ({equal, end}) => {
    equal(select().from('tbl').sql, 'SELECT * FROM `tbl`')
    end()
})

test('select fields', ({equal, end}) => {
    equal(select(['id', 'created_at']).from('tbl').sql,
          'SELECT `id`, `created_at` FROM `tbl`')
    equal(select('id', 'created_at').from('tbl').sql,
          'SELECT `id`, `created_at` FROM `tbl`')
    equal(select('count(*) as total').from('tbl').sql,
          'SELECT count(*) as total FROM `tbl`')
    equal(select('a as b').from('tbl').sql,
          'SELECT a as b FROM `tbl`')
    end()
})

test('criteria general', ({equal, end}) => {
    equal(select().from('tbl').where({id: 9}).sql,
          'SELECT * FROM `tbl` WHERE `id` = 9')
    equal(select().from('tbl').where({cat: 'II', deleted: 0}).sql,
          "SELECT * FROM `tbl` WHERE `cat` = 'II' AND `deleted` = 0")
    end()
})

test('criteria between', ({equal, end}) => {
    equal(select().from('tbl').where({created: {between: ['2016-01-01', '2017-01-01']}}).sql,
          "SELECT * FROM `tbl` WHERE `created` BETWEEN '2016-01-01' AND '2017-01-01'")
    end()
})

test('criteria contains', ({equal, end}) => {
    equal(select().from('tbl').where({name: {contains: 'foo'}}).sql,
          "SELECT * FROM `tbl` WHERE `name` LIKE '%foo%'")
    end()
})

test('criteria array', ({equal, end}) => {
    equal(select().from('tbl').where({size: ['XL', 'XXL']}).sql,
          "SELECT * FROM `tbl` WHERE `size` IN ('XL', 'XXL')")
    end()
})

test('criteria nested', ({equal, end}) => {
    equal(select().from('tbl').where(and(
        or({ n: 1 }, { n: 2 }),
        { k: 1 })).sql,
          "SELECT * FROM `tbl` WHERE (`n` = 1 OR `n` = 2) AND `k` = 1")
    equal(select().from('tbl').where(and(
        or({ n: 1 }, { n: 2 }, {n: 3, a: 1}),
        { k: 1 })).sql,
          "SELECT * FROM `tbl` WHERE (`n` = 1 OR `n` = 2 OR `n` = 3 AND `a` = 1) AND `k` = 1")
    equal(select().from('tbl').where(or(
        or({ n: 1 }, { n: 2 }, and({ n: 3 }, or({ a: 1 }, { a: 2 }))),
        { k: 1 })).sql,
          "SELECT * FROM `tbl` WHERE (`n` = 1 OR `n` = 2 OR `n` = 3 AND (`a` = 1 OR `a` = 2)) OR `k` = 1")
    end()
})

test('criteria undefined values', ({equal, end}) => {
    equal(select().from('tbl').where({key: undefined}).sql,
          'SELECT * FROM `tbl`')
    equal(select().from('tbl').where({key: undefined, key2: 'value'}).sql,
          "SELECT * FROM `tbl` WHERE `key2` = 'value'")
    equal(select().from('tbl').where({key: undefined}).or({key2: 'value'}).sql,
          "SELECT * FROM `tbl` WHERE `key2` = 'value'")
    equal(select().from('tbl').where({id: null}).sql,
          'SELECT * FROM `tbl` WHERE `id` IS NULL')
    end()
})

test('order by', ({equal, end}) => {
    equal(select().from('tbl')
          .orderBy('created').sql,
          "SELECT * FROM `tbl` ORDER BY `created`")
    equal(select().from('tbl')
          .orderBy('created', desc).orderBy('updated').sql,
          "SELECT * FROM `tbl` ORDER BY `created` DESC, `updated`")
    equal(select().from('tbl')
          .orderBy('created').desc()
          .orderBy('updated').asc().sql,
          "SELECT * FROM `tbl` ORDER BY `created` DESC, `updated` ASC")
    equal(select().from('tbl')
          .orderBy('updated', desc, 'created', desc).sql,
          "SELECT * FROM `tbl` ORDER BY `updated` DESC, `created` DESC")
    equal(select().from('tbl')
          .orderBy(['updated', desc], ['created', desc]).sql,
          "SELECT * FROM `tbl` ORDER BY `updated` DESC, `created` DESC")
    equal(select().from('tbl')
          .orderBy('-updated', 'created').sql,
          "SELECT * FROM `tbl` ORDER BY `updated` DESC, `created`")
    end()
})

test('subquery', ({equal, end}) => {
    let tbl = select('name', 'id').from('tbl')
    equal(select().from(tbl).sql, "SELECT * FROM (SELECT `name`, `id` FROM `tbl`)")
    end()
})

test('join', ({equal, end}) => {
    equal(select('product.id', 'tags.name').from('products')
          .leftJoin('tags').on({'products.id': 'tags.product_id'}).sql,
          "SELECT `product`.`id`, `tags`.`name` FROM `products` LEFT JOIN tags ON `products`.`id` = tags.product_id")
    end()
})

test('update', ({equal, end}) => {
    let expected = "\
UPDATE tbl2 \
SET `size` = 209732 \
WHERE `name` = '.vimrc' \
LIMIT 1"
    let generated = update('tbl2').set({size: 209732}).where({name: '.vimrc'}).limit(1).sql
    equal(generated, expected)

    expected = "\
UPDATE tbl2 \
SET `size` = '209732'"
    generated = update('tbl2').set("size", '209732').sql
    equal(generated, expected)

    end()
})

test('delete', ({equal, end}) => {
    equal(cadena.delete('tbl').sql, `DELETE FROM tbl`)
    equal(del('tbl').where({id: 2}).sql, "DELETE FROM tbl WHERE `id` = 2")
    equal(del('tbl').where({id: 2}).limit(1).sql, "DELETE FROM tbl WHERE `id` = 2 LIMIT 1")
    end()
})

test('insert', ({equal, end}) => {
    equal(insert({key: "value"}).into('tbl').sql, `INSERT INTO tbl (key) VALUES ('value')`)
    equal(insert(['name', 'score'], [['foo', 1], ['bar', 2]]).into('tbl').sql,
          `INSERT INTO tbl (name, score) VALUES ('foo', 1),
('bar', 2)`)
    end()
})

test('upsert', ({equal, end}) => {
    equal("INSERT INTO tbl SET `id` = 1, `name` = 'first' ON DUPLICATE KEY UPDATE `id` = 1, `name` = 'first'",
          upsert("tbl", {id: 1, name: 'first'}).sql)
    end()
})

test('prepare', ({equal, deepEqual, end}) => {
    let values = {id: 1, name: 'first'}
    equal("insert into tbl set `id` = 1, `name` = 'first' on duplicate key update `id` = 1, `name` = 'first'",
          sql`insert into tbl set ${values} on duplicate key update ${values}`.sql)

    deepEqual(["insert into tbl set `id` = ?, `name` = ? on duplicate key update `id` = ?, `name` = ?",
           [1, 'first', 1, 'first']],
          sql`insert into tbl set ${values} on duplicate key update ${values}`.prepare())
    end()
})

test('table', ({equal, end}) => {
    let expected = `CREATE TABLE IF NOT EXISTS users
(\`id\` INT PRIMARY KEY,
\`name\` VARCHAR(50),
\`age\` INT)`
    equal(create('users')
          .int('id').primary()
          .varchar('name', 50)
          .int('age').sql
          , expected)
    end()
})

const testDB = (db, {deepEqual, end}) => {
    return sql`drop table if exists users`.run(db)
        .then(() => create('users').int('id').primary().varchar('name', 64).run(db))
        .then(() => insert({id: 1, name: 'foo'}).into('users').run(db))
        .then(() => select().from('users').getOne(db))
        .then(row => deepEqual(row, {id: 1, name: 'foo'}))
        .then(() => insert(['id', 'name'], [[2, 'bar'], [3, 'foobar']]).into('users').run(db))
        .then(() => select().from('users').limit(1).getAll(db))
        .then(row => deepEqual(row, [{id: 1, name: 'foo'}]))
        .then(() => sql`insert into users (id, name) values(${4}, ${'four'})`.run(db))
        .then(() => select().from('users').limit(1).orderBy('id').desc().getOne(db))
        .then(row => deepEqual(row, {id: 4, name: 'four'}))
        .then(() => sql`select * from users where name=${'bar'}`.getOne(db))
        .then(row => deepEqual(row, {id: 2, name: 'bar'}))
        .then(() => sql`update users set ${{name: 'five'}} where id=${4}`.run(db))
        .then(() => sql`select name from users where id=${4}`.getOne(db))
        .then(row => deepEqual(row, {name: 'five'}))
}

test('sqlite3', (t) => {
    let db = cadena.connect('sqlite3', ':memory:')
    let end = (x) => db.end().then(t.end(x))
    testDB(db, t).then(end, end)
})

test('mysql', (t) => {
    let db = cadena.connect('mysql', 'mysql://root:@127.0.0.1/test')
    let end = (x) => db.end().then(t.end(x))
    testDB(db, t).then(end, end)
})

test('example', ({equal, end}) => {
    equal(select('name', 'id')
          .from('players')
          .where({score: { '>=': 90 }})
          .limit(0, 10)
          .orderBy('score').desc().sql,
          "SELECT `name`, `id` FROM `players` WHERE `score` >= 90 ORDER BY `score` DESC LIMIT 0,10")
    let id = '33b27b80-bee3-4d1b-aa9a-231bf250f344'
    equal(sql`select * from tbl where id=${id}`.toString(),
          "select * from tbl where id='33b27b80-bee3-4d1b-aa9a-231bf250f344'")
    end()
})
