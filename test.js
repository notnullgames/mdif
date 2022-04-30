/* global describe, test, expect */

import { promises as fs } from 'node:fs'
import { parse } from './index.js'

describe('mdif', () => {
  test('should have tests', () => {
    expect(1 + 1).toBe(2)
  })

  test('parse', async () => {
    const md = (await fs.readFile('example.md')).toString()
    const dialog = await parse(md)
    expect(dialog).toMatchSnapshot()
    await fs.writeFile('example.json', JSON.stringify(dialog, null, 2))
  })
})
