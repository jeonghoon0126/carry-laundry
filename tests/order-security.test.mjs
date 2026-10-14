import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { NextResponse } from 'next/server.js'

const fixtures = [
  { id: 1, user_id: 'user-a', created_at: '2025-01-01' },
  { id: 2, user_id: 'user-b', created_at: '2025-01-02' },
]
function loadRoute(file, { session = null, env = {}, dbError = null, sessionError = false, orders = fixtures } = {}) {
  const calls = []
  const database = orders.map(row => ({ status: 'pending', paid: false, ...row }))
  const client = { from(table) {
    let rows = [...database]
    let patch
    const query = {
      select() { return this },
      eq(column, value) { calls.push(['eq', column, value]); rows = rows.filter(row => String(row[column]) === String(value)); return this },
      order() { return this },
      limit() { return this },
      update(data) { patch = data; return this },
      insert() { calls.push(['insert', table]); return this },
      result(single = false) {
        if (patch && !dbError) { calls.push(['update', table, rows.map(row => row.id)]); rows.forEach(row => Object.assign(row, patch)) }
        const data = rows.map(({ status, paid, ...row }) => file === 'app/api/orders/route.ts' ? row : { ...row, status, paid })
        return { data: single ? data[0] ?? null : data, error: dbError }
      },
      single() { return Promise.resolve(this.result(true)) },
      then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject) },
    }
    return query
  } }
  const getClient = () => { calls.push(['client']); return client }
  const modules = {
    'server-only': {},
    'next/server': { NextResponse },
    'next/navigation': { redirect(path) { throw new Error(`REDIRECT:${path}`) } },
    'next-auth': { getServerSession: async () => { if (sessionError) throw new Error('private session error'); return session } },
    '@/app/api/auth/[...nextauth]/route': { authOptions: {} },
    '@/lib/kakao': { geocodeAddress: () => { throw new Error('Unexpected geocoding') } },
    '@supabase/supabase-js': { createClient: getClient },
    '@/lib/supabase-server': { getSupabaseServer: getClient },
  }
  function load(file) {
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText
    const exports = {}
    vm.runInNewContext(source, { exports, process: { env }, console: { log() {}, error() {} }, URL, Buffer,
      fetch: async () => { calls.push(['payment']); return { ok: true, json: async () => ({}) } },
      require(name) {
        if (['@/lib/order-access', '@/lib/utils/orderStatus'].includes(name)) return load(name.replace('@/', '') + '.ts')
        assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`); return modules[name]
      },
    }, { filename: file })
    return exports
  }
  return { route: load(file), calls, database }
}
const ordersPath = 'app/api/orders/route.ts'
const configured = { SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE: 'test-only' }

test('unauthenticated order request is rejected before DB access', async () => {
  const { route, calls } = loadRoute(ordersPath, { env: configured })
  assert.equal((await route.GET()).status, 401)
  assert.deepEqual(calls, [])
})

for (const id of ['user-a', 'user-b']) {
  test(`user ${id} receives only their orders even with forged query parameters`, async () => {
    const { route, calls } = loadRoute(ordersPath, { env: configured, session: { user: { id } } })
    const response = await route.GET(new Request('https://example.invalid/api/orders?user_id=4475158066&admin=true'))
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), fixtures.filter(row => row.user_id === id))
    assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'user_id' && call[2] === id))
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  })
}
for (const user of [{ id: 'outsider', name: 'admin' }, { id: 'outsider', email: 'admin@carry-laundry.com' }, { id: 'outsider', email: 'someone@carry-laundry.com' }, { id: 'outsider', role: 'admin' }]) {
  test(`untrusted profile attributes do not grant all-order access: ${JSON.stringify(user)}`, async () => {
    const { route } = loadRoute(ordersPath, { env: configured, session: { user } })
    assert.deepEqual(await (await route.GET()).json(), [])
  })
}
for (const id of ['4475158066', 4475158066]) {
  test(`existing explicit admin ID retains global read (${typeof id})`, async () => {
    const { route, calls } = loadRoute(ordersPath, { env: configured, session: { user: { id } } })
    assert.deepEqual(await (await route.GET()).json(), fixtures)
    assert.equal(calls.some(call => call[0] === 'eq'), false)
  })
}
for (const id of [undefined, '', ' ', {}, false]) {
  test(`missing or invalid session ID is rejected: ${JSON.stringify(id)}`, async () => {
    const { route, calls } = loadRoute(ordersPath, { env: configured, session: { user: { id } } })
    assert.equal((await route.GET()).status, 401)
    assert.deepEqual(calls, [])
  })
}
test('missing server configuration does not query DB or disclose configuration', async () => {
  const { route, calls } = loadRoute(ordersPath, { session: { user: { id: 'user-a' } } })
  const response = await route.GET()
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Server configuration error' })
  assert.deepEqual(calls, [])
})
test('DB failures return a generic error', async () => {
  const { route } = loadRoute(ordersPath, { env: configured, session: { user: { id: 'user-a' } }, dbError: { message: 'private database detail' } })
  const response = await route.GET()
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Failed to fetch orders' })
})
test('session verification failure fails closed without DB access', async () => {
  const { route, calls } = loadRoute(ordersPath, { env: configured, sessionError: true })
  assert.equal((await route.GET()).status, 500)
  assert.deepEqual(calls, [])
})
for (const NODE_ENV of ['production', 'development', 'test']) {
  test(`test-payment cannot access or update orders in ${NODE_ENV}`, async () => {
    const { route, calls } = loadRoute('app/api/test-payment/route.ts', {
      env: { ...configured, NODE_ENV, SUPABASE_SERVICE_ROLE_KEY: 'test-only' },
    })
    assert.equal((await route.GET()).status, 410)
    assert.deepEqual(calls, [])
  })
}

test('numeric Kakao user ID is normalized for the text ownership column', async () => {
  const { route, calls } = loadRoute(ordersPath, { env: configured, session: { user: { id: 12345 } } })
  assert.equal((await route.GET()).status, 200)
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'user_id' && call[2] === '12345'))
})

const statusPath = 'app/api/orders/[id]/status/route.ts'
const cancelPath = 'app/api/orders/[id]/cancel/route.ts'
const spoofed = [
  { id: 'user-a', name: 'admin' },
  { id: 'user-a', email: 'admin@carry-laundry.com' },
  { id: 'user-a', email: 'someone@carry-laundry.com' },
  { id: 'user-a', role: 'admin' },
]
const statusRequest = () => ({ json: async () => ({ status: 'processing' }) })
const cancelRequest = () => ({ json: async () => ({ reason: 'synthetic test' }) })
const params = id => ({ params: Object.assign(Promise.resolve({ id: String(id) }), { id: String(id) }) })

for (const file of [statusPath, cancelPath]) {
  for (const session of [null, { user: {} }, { user: { id: {} } }]) {
    test(`${file}: invalid session is rejected before DB/payment`, async () => {
      const { route, calls } = loadRoute(file, { session })
      const response = await (route.PUT ?? route.POST)(statusRequest(), params(2))
      assert.equal(response.status, 401)
      assert.deepEqual(calls, [])
    })
  }
}
for (const user of [{ id: 'user-a' }, ...spoofed]) {
  test(`status denies non-admin including spoofed attributes: ${JSON.stringify(user)}`, async () => {
    const { route, calls } = loadRoute(statusPath, { session: { user } })
    assert.equal((await route.PUT(statusRequest(), params(2))).status, 403)
    assert.deepEqual(calls, [])
  })
}
for (const id of ['4475158066', 4475158066]) {
  test(`fixed admin can change status (${typeof id})`, async () => {
    const { route, database } = loadRoute(statusPath, { session: { user: { id } } })
    assert.equal((await route.PUT(statusRequest(), params(2))).status, 200)
    assert.equal(database[1].status, 'processing')
    assert.equal(database[0].status, 'pending')
  })
}
for (const user of [{ id: 'user-a' }, ...spoofed, { id: '4475158066' }]) {
  test(`cancel cannot touch another user's paid order: ${JSON.stringify(user)}`, async () => {
    const { route, calls, database } = loadRoute(cancelPath, { session: { user }, orders: [{ id: 2, user_id: 'user-b', paid: true, payment_id: 'synthetic-payment' }] })
    assert.equal((await route.POST(cancelRequest(), params(2))).status, 404)
    assert.equal(database[0].status, 'pending')
    assert.equal(calls.some(call => ['payment', 'update'].includes(call[0])), false)
  })
}
for (const id of ['user-a', '4475158066', 12345]) {
  test(`own unpaid order cancellation remains available: ${id}`, async () => {
    const { route, calls, database } = loadRoute(cancelPath, { session: { user: { id } }, orders: [{ id: 1, user_id: String(id) }] })
    assert.equal((await route.POST(cancelRequest(), params(1))).status, 200)
    assert.equal(database[0].status, 'cancelled')
    assert.equal(calls.filter(call => call[0] === 'eq' && call[1] === 'user_id').length, 2)
    assert.equal(calls.some(call => call[0] === 'payment'), false)
  })
}

for (const user of [null, { id: 'user-a' }, ...spoofed]) {
  test(`admin page blocks non-admin: ${JSON.stringify(user)}`, async () => {
    const { route } = loadRoute('app/admin/layout.tsx', { session: user ? { user } : null })
    await assert.rejects(() => route.default({ children: 'protected admin content' }), {
      message: user ? 'REDIRECT:/mypage' : 'REDIRECT:/signin',
    })
  })
}
test('admin page admits the existing fixed administrator', async () => {
  const { route } = loadRoute('app/admin/layout.tsx', { session: { user: { id: '4475158066' } } })
  assert.equal(await route.default({ children: 'protected admin content' }), 'protected admin content')
})
test('cancel supports Next.js asynchronous route params', async () => {
  const { route } = loadRoute(cancelPath, { session: { user: { id: 'user-a' } } })
  const response = await route.POST(cancelRequest(), { params: Promise.resolve({ id: '1' }) })
  assert.equal(response.status, 200)
})
test('owner paid cancellation uses only a synthetic payment adapter', async () => {
  const { route, calls, database } = loadRoute(cancelPath, {
    session: { user: { id: 'user-a' } },
    orders: [{ id: 1, user_id: 'user-a', paid: true, payment_id: 'synthetic-only' }],
  })
  assert.equal((await route.POST(cancelRequest(), params(1))).status, 200)
  assert.equal(calls.filter(call => call[0] === 'payment').length, 1)
  assert.equal(database[0].status, 'cancelled')
})

test('admin cancel button predicate only exposes own paid uncancelled orders', () => {
  const source = fs.readFileSync('app/admin/page.tsx', 'utf8')
  const file = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let predicate
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'canCancelOrder') predicate = node.initializer.getText(file)
    ts.forEachChild(node, visit)
  }
  visit(file)
  assert.ok(predicate)
  const script = ts.transpileModule(`exports.check = ${predicate}`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const exports = {}
  vm.runInNewContext(script, { exports, session: { user: { id: '4475158066' } } })
  assert.equal(exports.check({ user_id: 'someone-else', paid: true, status: 'pending' }), false)
  assert.equal(exports.check({ user_id: '4475158066', paid: true, status: 'pending' }), true)
  assert.equal(exports.check({ user_id: '4475158066', paid: false, status: 'pending' }), false)
  assert.equal(exports.check({ user_id: '4475158066', paid: true, status: 'cancelled' }), false)
})
