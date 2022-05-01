import r from 'raylib'
import { promises as fs } from 'node:fs'
import { runDialog } from '../index.js' // 'mdif'

// TODO: mixed hardcode & derived sizes. Pick one.

const md = (await fs.readFile('example.md')).toString()

function drawDialog (text, config = {}) {
  const {
    speed = 2,
    fontSize = 12,
    color = r.WHITE,
    more,
    texture,
    patch,
    position,
    who,
    whoImage
  } = config

  r.DrawTextureNPatch(
    texture,
    patch,
    position,
    { x: 0, y: 0 },
    0,
    color
  )

  // TODO: implement something like
  // https://github.com/raysan5/raylib/blob/master/examples/text/text_rectangle_bounds.c
  // instead of this hacky wordwrap
  r.DrawText(wrap(text, 30), position.x + 10, position.y + 15, fontSize, color)

  if (who) {
    r.DrawText(who, position.x + 10 - 2, position.y - 35 - 2, fontSize, r.BLACK)
    r.DrawText(who, position.x + 10, position.y - 35, fontSize, color)
  }

  if (whoImage) {
    r.DrawTexture(whoImage, position.x + position.width - whoImage.width - 10, position.y - whoImage.height, r.WHITE)
  }

  if (more && Math.floor(r.GetTime() * speed) % 2 === 0) {
    r.DrawRectangle(position.x + position.width - 15, position.y + position.height - 15, 5, 5, color)
  }
}

function drawOptions(options, config = {}) {
  const {
    currentOption = 0,
    position,
    fontSize = 12,
    color = r.WHITE,
  } = config

  for (const o in options) {
    const { text } = options[o]
    r.DrawText(wrap(text, 30), position.x + 40, position.y + ((fontSize + 3) * 2) + (o * (fontSize + 4)), fontSize, color)
  }

  r.DrawRectangle(position.x + 10, position.y + ((fontSize + 4) * currentOption) + 80, 15, 15, color)
}

const wrap = (s, w) => s.replace(
  new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
)

const screenWidth = 640
const screenHeight = 480

r.InitWindow(screenWidth, screenHeight, 'raylib - dialog')

r.SetTargetFPS(60)

const texture = r.LoadTexture('examples/images/ninepatch.png')
const patch = { source: { x: 0, y: 192, height: 64, width: 64 }, left: 6, top: 6, right: 6, bottom: 6, layout: r.NPATCH_NINE_PATCH }
const position = { x: 10, y: screenHeight / 2, width: screenWidth - 20, height: (screenHeight / 2) - 20 }
const fontSize = 32
const who = 'konsumer'

const people = {
  konsumer: r.LoadTexture('examples/images/konsumer.png'),
  Simon: r.LoadTexture('examples/images/Simon.png')
}

const state = {
  player: { name: 'Simon', inventory: [] },
  konsumer: { scared: false }
}

let currentDialog = 'start'
let screen = runDialog (md, currentDialog, state)
// track the current position in dialog
let dialogPosition = 0
let currentOption = 0

const text = 'Alcohol free-market papier-mache fetishism rain tower modem chrome crypto-network sub-orbital realism drugs.'
while (!r.WindowShouldClose()) {
  r.BeginDrawing()
  r.ClearBackground(r.LIGHTGRAY)
  if (Array.isArray(screen)) {

  } else {
    drawDialog(screen.text, { texture, patch, position, fontSize, who: screen.who, whoImage: people[screen.who], more: screen.ending !== 'prompt' })
    if (screen.ending === 'prompt') {
      const options = runDialog (md, currentDialog, state, dialogPosition + 1)
      if (r.IsKeyPressed(r.KEY_UP)) {
        currentOption -= 1
      }
      if (r.IsKeyPressed(r.KEY_DOWN)) {
        currentOption += 1
      }
      if (r.IsKeyPressed(r.KEY_SPACE)) {
        currentDialog = options[currentOption].dialog.replace(/^#/, '')
        if (currentDialog === 'END') {
          break
        }
        currentOption = 0
        screen = runDialog (md, currentDialog, state)
      }
      if (currentOption < 0) {
        currentOption = options.length - 1
      }
      if (currentOption >= options.length) {
        currentOption = 0
      }
      drawOptions(options, { position, currentOption, fontSize })
    } else {
      if (r.IsKeyPressed(r.KEY_SPACE)) {
        dialogPosition += 1
      }
      screen = runDialog (md, currentDialog, state, dialogPosition)
    }
  }

  r.EndDrawing()
}

r.CloseWindow()
