/* global describe, test, expect */

import { promises as fs } from 'node:fs'
import { parse, run } from './index.js'

const md = (await fs.readFile('example.md')).toString()
let dialog

describe('mdif', () => {
  test('should have tests', () => {
    expect(1 + 1).toBe(2)
  })

  test('parse', async () => {
    dialog = parse(md)
    expect(dialog).toMatchSnapshot()
    await fs.writeFile('example.json', JSON.stringify(dialog, null, 2))
  })

  test('run', async () => {
    const player = {
      name: 'Johnny',
      inventory: []
    }
    const konsumer = {
      scared: false
    }

    const convo = run(dialog, { player, konsumer })

    convo.get('start')

  })
})
