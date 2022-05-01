# Markdown Interactive Fiction

This is a dialog/interactive fiction engine (for nodejs) that lets you describe conversations and games. It uses a subset of [markdown](https://www.markdownguide.org/basic-syntax/) to define your dialogs, and [mustache](http://mustache.github.io/mustache.5.html) to express light logic/formatting. It can be used in any sort of game that has dialog with (or without) logic. It was originally made for a retro-style 2D RPG (like FF/zelda/etc) but could be used in any kind of game, or even non-games. There no real docs yet, but checkout [example.md](./example.md) or [the unit-test](./test.js) for how to use it.


## example usage

Here is a simple CLI text-adventure game engine, for nodejs:

> **TODO**: this isn't right, yet

```js
import { promises as fs } from 'node:fs'
import { runDialog } from 'mdif'

// function sleep for ms
const sleep = time => new Promsie(resolve=> setTimeout(resolve, time))

// read a markdown file as a string
const md = (await fs.readFile('example.md')).toString()

// tell the user how to play
console.log('Press space to advance through a conversation, or a number to choose something.')

// setup stdin for input
process.stdin.setRawMode( true )
process.stdin.resume()
process.stdin.setEncoding('utf8')

// put last input into currentKey
let currentKey
stdin.on('data', key => {
  currentKey = key
})

// setup some intiial state
const state = {
  player: { name: 'Simon' },
  konsumer: { scared: false }
}

// this will give you the current dialog object or an array of choices
let screen = runDialog (md, 'start', state)

// tells mdif which conversation-line in current dialog to show
let dialogPosition = 0

// runDialog returns "END" when it is time to leave the conversation
while(screen !== 'END'){
  currentKey = ''
  if (Array.isArray(screen)) {
    // display choices, wait for number
    console.log(screen.map((t, i) => `  ${i + 1}.) ${t.label}`).join('\n'))
    
    // wait for a key
    while(currentKey === ''){
      await sleep(100)
    }
    
    // check input & get next screen
    const choice = screen[currentKey]?.id
    if (choice) {
      if (choice === 'END') {
        break
      }
      // reset dialog-position
      dialogPosition = 0
      
      // get next screen
      screen = runDialog (md, choice, state})
    } else {
      console.log('Invalid choice.')
    }
  } else {
    // if there is code, run it on the current state
    if (screen?.code?.length) {
      const code = screen.code.filter(c => c.lang === 'js').map(c => c.source).join('\n')
      const f = new Function(...Object.keys(stata), code)
      f(...Object.values(state))
    }

    const line = screen?.conversation[dialogPosition]

    // check line, if they are outside the bounds, just stop (they didn't make a choice at the end, so maybe there was no choice in last dialog.)
    if (!line) {
      break
    }

    // show the text of current line
    if (line.name) {
      console.log(`${line.name}:`)
    }
    console.log(line.text)

    // wait for a space
    while(currentKey !== ' '){
      await sleep(100)
    } 

    dialogPosition++
  }
}

console.log('Thanks for playing.')

```

At some point I will create a feww interaction-loops for different runtimes (node CLI, node-raylib, browser, etc), so you can use them quickly, as-is.

