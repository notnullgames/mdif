// this is a simple demo of a CLI interactive fixtion, using example.md
// You can edit example.md to make a new game!

import { promises as fs } from 'node:fs'
import chalk from 'chalk'
import { runDialog, getASTInfo} from '../../index.js' // 'mdif'

// function sleep for ms
const sleep = time => new Promise(resolve=> setTimeout(resolve, time))

// read a markdown file as a string
const md = (await fs.readFile('example.md')).toString()
const { info } = getASTInfo(md)

process.stdin.setRawMode( true )
process.stdin.resume()
process.stdin.setEncoding('utf8')

// put last input into currentKey, exit on Q
let currentKey
process.stdin.on('data', key => {
  if (key === 'q') {
    process.exit(0)
  }
  if (key === 'd') {
    describe()
  }
  currentKey = key
})

// setup some intiial state
const state = {
  player: { name: 'Simon', inventory: [] },
  konsumer: { scared: false }
}

// each person has a color
const peopleColors = {}
peopleColors[state.player.name] = chalk.green
peopleColors.konsumer = chalk.yellow

// tell the player how to play
process.stdout.write(`
${chalk.bold('Press space to advance through a conversation, or a number to choose something. Press Q to quit. Press D to describe the palce you are in.')}
Let's begin.

${chalk.bold(chalk.underline(info.name))}
${info.description}
`)

let currentDialog = 'start'
let screen = runDialog (md, currentDialog, state)
// track the current position in dialog
let dialogPosition = 1
let lastPrompt = 'start'

// say a sinlge line of dialog, wait for space
async function say(line) {
  if (line.who) {
    process.stdout.write('\n' + chalk.bold(peopleColors[line.who](line.who)) + ': ')
  }
  process.stdout.write(line.text + '\n')

  if (line.ending === 'prompt' || line.ending === 'end') {
    return
  }

  process.stdout.write('\x1b[999G\x1b[2D->')

  // wait for a space
  while(currentKey !== ' '){
    await sleep(100)
  } 
}

// show options, wait for menu input
async function menu(options) {
  if (!options.length) {
    return { dialog: 'END' }
  }
  let menu = '\n'
  for (const i in options) {
    menu += `  ${1 + parseInt(i)}.) ${options[i].text}\n`
  }
  process.stdout.write(menu + '\n? ')
  // wait for a valid option
  while(isNaN(currentKey) || currentKey < 1 || currentKey > options.length){
    await sleep(100)
  }
  const choice = options[currentKey-1]
  process.stdout.write(choice.text + '\n')
  return choice
}

async function runScreen() {
  if (Array.isArray(screen)) {
    currentKey = ''
    const choice = await menu(screen)
    if (choice.dialog === 'END') {
      return false
    }
    currentDialog = choice.dialog.replace(/^#/, '')
    dialogPosition = 0
  } else {
    currentKey = ''
    await say(screen)
    dialogPosition++
  }
  screen = runDialog (md, currentDialog, state, dialogPosition)
  return true
}

while(await runScreen()) {}
console.log('\nThanks for playing.\n')
process.exit()
