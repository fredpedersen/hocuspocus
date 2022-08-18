import test from 'ava'
import { Redis } from '@hocuspocus/extension-redis'
import {
  newHocuspocus, newHocuspocusProvider, sleep, redisConnectionSettings,
} from '../utils'
import {uuidv4} from "lib0/random";
import {retryableAssertion} from "../utils/retryableAssertion";

test.skip('adds and removes connections properly', async t => {
  const server = newHocuspocus({
    extensions: [
      new Redis({
        ...redisConnectionSettings,
        identifier: 'server' + uuidv4(),
        prefix: 'extension-redis/getConnectionCount',
      }),
    ],
  })

  const anotherServer = newHocuspocus({
    extensions: [
      new Redis({
        ...redisConnectionSettings,
        identifier: 'anotherServer' + uuidv4(),
        prefix: 'extension-redis/getConnectionCount',
      }),
    ],
  })

  const providers = [
    newHocuspocusProvider(server),
    newHocuspocusProvider(anotherServer),
  ]

  await retryableAssertion(t, (tt) => {
    tt.is(server.getConnectionsCount(), 2)
  })

  providers.forEach(provider => provider.disconnect())

  await retryableAssertion(t, (tt) => {
    tt.is(server.getConnectionsCount(), 0)
  })
})