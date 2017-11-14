import setup, { defaultRoutes, log } from '../__test-helpers__/rudySetup'
import { NOT_FOUND } from '../src'
import createScene from '../src/createScene'
import formatRoutes from '../src/utils/formatRoutes'

test('createScene', async () => {
  const tools = setup(undefined, undefined, { scene: 'SCENE', logExports: true })
  const { store, firstRoute, types, actions, exportString, routes } = tools
  let action = firstRoute()
  console.log(routes)
  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/FIRST')

  res = await store.dispatch(actions.second())
  console.log(actions.second())
  expect(store.getState().location.type).toEqual('SCENE/SECOND')

  action = actions.third((req, type) => ({ testReq: req.getTitle(), type }))
  res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/THIRD')

  action = actions.fourth('baz')
  res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/FOURTH')
  expect(res).toEqual({ type: 'SCENE/FOURTH_COMPLETE', payload: 'onComplete' })

  expect(store.getState().location.payload).toEqual({ foo: 'baz' })

  res = await store.dispatch(actions.second({ payload: { foo: 'bar' } }))
  expect(store.getState().location.type).toEqual('SCENE/SECOND')
  expect(store.getState().location.payload).toEqual({ foo: 'bar' })

  res = await store.dispatch(actions.third({ type: 'WRONG' }))
  expect(store.getState().location.type).toEqual('SCENE/SECOND')

  res = await store.dispatch(actions.thirdError(new Error('fail')))
  expect(store.getState().location.type).toEqual('SCENE/SECOND')
  expect(store.getState().location.error).toEqual(new Error('fail'))
  expect(store.getState().location.errorType).toEqual('SCENE/THIRD_ERROR')

  res = await store.dispatch(actions.thirdComplete({ foo: 'bar' }))
  expect(res.type).toEqual('SCENE/THIRD_COMPLETE')
  expect(res.payload).toEqual({ foo: 'bar' })

  res = await store.dispatch(actions.plain('bar'))
  expect(res.type).toEqual('SCENE/PLAIN')
  expect(res.payload).toEqual({ foo: 'bar' })

  log(store)

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})

test('NOT_FOUND', async () => {
  const tools = setup(undefined, undefined, { scene: 'SCENE', logExports: true })
  const { store, firstRoute, types, actions, exportString, routes } = tools
  let action = firstRoute()

  console.log(routes)

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/FIRST')

  action = actions.notFound({ foo: 'bar' }, 'cat')
  res = await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SCENE/@@rudy/NOT_FOUND')

  expect(action).toMatchSnapshot()
  expect(store.getState().location).toMatchSnapshot()
})


test('double createScene', async () => {
  const { routes: r } = createScene(defaultRoutes, { scene: 'scene' })
  const { types, actions, routes: r2, exportString } = createScene(r, { scene: 'double', logExports: true })
  const routes = formatRoutes(r2)

  console.log(routes)
  console.log(types)
  console.log(actions)
  console.log('EXPORTS', exportString)
})