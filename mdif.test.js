import { readFile } from 'node:fs/promises'
import { describe, test } from 'node:test'
import { strict as assert } from 'node:assert'
import mdif from './index.js'

const source = await readFile('example.md', 'utf8')

describe('basic operation', () => {
	test('load', () => {
		const d = mdif(source)
		assert.equal(3, d.dialogs.size)
		const hello = d.dialogs.get('hello')
		assert.equal(1, hello.lines.length)
		assert.equal("konsumer", hello.lines[0].speaker)
		assert.equal(3, hello.choices.length)
		
		const simon_says = d.dialogs.get('simon-says')
		assert.equal(2, simon_says.lines.length)
		assert.equal("Simon", simon_says.lines[0].speaker)
		assert.equal(2, simon_says.choices.length)

		const simon_confused = d.dialogs.get('simon-confused')
		assert.equal(3, simon_confused.lines.length)
		assert.equal(2, simon_confused.choices.length)

	})
})