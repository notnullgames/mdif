/* global describe, test, expect */

import { promises as fs } from 'node:fs'
import { textToId, getASTInfo, getConversations, getAllSections, getSection, getDialog, runDialog } from './index.js'

const md = (await fs.readFile('example.md'))

describe('mdif', () => {
  // this tests that ID function can handle any arbitrary header-text
  describe('textToId', () => {
    test(`I'm Here`, () => {
      expect(textToId(`I'm Here`)).toEqual("im_here")
    })
    
    test(`Cool. Story. Bro!`, () => {
      expect(textToId(`Cool. Story. Bro!`)).toEqual("cool_story_bro")
    })
    
    test(`What Do You Mean?`, () => {
      expect(textToId(`What Do You Mean?`)).toEqual("what_do_you_mean")
    })
    
    test(`EPIC`, () => {
      expect(textToId(`EPIC`)).toEqual("epic")
    })

    test(`spaces  should     collapse`, () => {
      expect(textToId(`spaces  should     collapse`)).toEqual("spaces_should_collapse")
    })

    test(`Lot's of [WeIrD]!@$#!!**.,??(ok)`, () => {
      expect(textToId(`Lot's of [WeIrD]!@$#!!**.,??(ok)`)).toEqual("lots_of_weird_ok")
    })
  })

  // this tests internal parsing functions to make sure they are working right
  describe('parsing', () => {
    test('get meta-info', () => {
      expect(getASTInfo(md).info).toEqual({
        "description": "A land of rolling hills rising to low mountains in the south. It is predominantly forested except for marshlands in the north. The country is bordered on the east by the Eastern Ocean, on the west by a great mountain range, on the north by the River Shribble, and on the south by Archenland.",
        "name": "Narnia",
      })
    })
    
    test('get all conversaton IDs', () => {
      expect(getConversations(md)).toEqual([
        "start",
        "thats_my_name",
        "no_promises",
        "scare_konsumer",
        "lie_about_name",
        "take_sword",
        "goodbye",
      ])
    })

    test('get a single section AST, by ID', () => {
      const section = getSection(md, 'start')
      expect(section.id).toBe('start')
      expect(section.children.length).toBe(4)
      expect(section.children.map(c => c.type)).toEqual([
        "paragraph",
        "paragraph",
        "blockquote",
        "list",
      ])
    })

    test('suggest a nice ID for bad input', () => {
      expect(() => {
        const section = getSection(md, 'statr')
      }).toThrow('Dialog ID "statr" not found. Did you mean "start"?')

      expect(() => {
        const section = getSection(md, 'No Promises')
      }).toThrow('Dialog ID "No Promises" not found. Did you mean "no_promises"?')
    })

    test('get a complete dialog by ID', () => {
      const dialog = getDialog(md, 'start', {  player: { name: 'Lucy' } })
      expect(Object.keys(dialog)).toEqual(['code', 'conversation', 'options'])
      expect(dialog.conversation[0].text).toBe('Hi, yer name is Lucy, right?')
      expect(dialog.conversation[0].who).toBe('konsumer')
    })
  })

  // this illustrates more typical usage
  describe.skip('usage', () => {
    test('konsumer is not scared', () => {
      const variables = {
        player: { name: 'Peter' },
        konsumer: { scared: false }
      }
    
      // get the first screen
      let screen = runDialog(md, 'start', variables)
      console.log(screen)

      // simulate user pressing "next" button: return options
      screen = runDialog(md, 'start', variables, 1)
      console.log(screen)
    })

    test('konsumer is scared', () => {
      const variables = {
        player: { name: 'Peter' },
        konsumer: { scared: true }
      }
    
      // get the first screen
      let screen = runDialog(md, 'start', variables)
      console.log(screen)

      // simulate user pressing "next" button: END
      screen = runDialog(md, 'start', variables, 1)
      console.log(screen)
    })
  })
})
