#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import createDialog from '../index.js'

const source = await readFile(new URL('../example.md', import.meta.url), 'utf8')
const dialog = createDialog(source)

function formatLine({ speaker, text }) {
  return speaker ? `\x1b[1m${speaker}:\x1b[0m ${text}` : text
}

// In non-TTY mode, buffer all stdin lines upfront
let lineBuffer = []
let rl

if (process.stdin.isTTY) {
  rl = readline.createInterface({ input, output })
} else {
  const lines = []
  for await (const line of readline.createInterface({ input })) {
    lines.push(line)
  }
  lineBuffer = lines
}

async function ask(prompt = '') {
  if (!process.stdin.isTTY) {
    return lineBuffer.shift() ?? null
  }
  try {
    return await rl.question(prompt)
  } catch {
    return null
  }
}

dialog.open('hello')

while (dialog.isOpen) {
  if (dialog.current) {
    console.log(formatLine(dialog.current))
    dialog.advance()
  } else if (dialog.choices.length > 0) {
    console.log()
    dialog.choices.forEach((c, i) => console.log(`  \x1b[33m${i + 1}.\x1b[0m ${c.label}`))
    console.log()

    let idx = -1
    while (idx < 0 || idx >= dialog.choices.length) {
      const answer = await ask('Choice> ')
      if (answer === null) { dialog.close(); break }
      idx = parseInt(answer, 10) - 1
      if (idx < 0 || idx >= dialog.choices.length) {
        console.log(`Enter 1–${dialog.choices.length}`)
      }
    }
    if (dialog.isOpen) dialog.choose(idx)
  } else {
    break
  }
}

console.log('\n[end]')
if (rl) rl.close()
