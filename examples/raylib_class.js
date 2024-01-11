import { promises as fs } from 'node:fs'
import { runDialog } from '../index.js' // 'mdif'
import r from 'raylib'

const wrap = (s, w) => s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')

class Dialog {
  constructor (markdown, patch, state = {}, currentDialog='start') {
    this.markdown = markdown
    this.patch = patch
    this.state = state
    this.currentDialog = currentDialog
    this.open = true

    const screenWidth = r.GetScreenWidth()
    const screenHeight = r.GetScreenHeight()

    this.speed=2
    this.color = r.WHITE
    this.fontSize = 32
    this.position = {
      x: 10,
      y: screenHeight / 2,
      width: screenWidth - 20,
      height: (screenHeight / 2) - 20
    }

    this.setDialog(currentDialog)
  }

  // use this to jump to a specific dialog
  setDialog(currentDialog='start') {
    this.currentDialog = currentDialog
    this.dialogPosition = 0
    this.currentOption = 0
    this.screen = runDialog(this.markdown, this.currentDialog, this.state)
  }

  drawOptions(options) {
    for (const o in options) {
      const { text } = options[o]
      r.DrawText(wrap(text, 30), this.position.x + 40, this.position.y + ((this.fontSize + 3) * 2) + (o * (this.fontSize + 4)), this.fontSize, this.color)
    }
    r.DrawRectangle(this.position.x + 10, this.position.y + ((this.fontSize + 4) * this.currentOption) + 80, 15, 15, this.color)
  }

  drawDialog() {
    if (this.currentDialog === 'END') {
      this.open = false
      return
    }
    const {texture, ...patch} = this.patch
    r.DrawTextureNPatch(
      texture,
      patch,
      this.position,
      { x: 0, y: 0 },
      0,
      this.color
    )
    r.DrawText(wrap(this.screen.text, 30), this.position.x + 10, this.position.y + 15, this.fontSize, this.color)
    if (this.screen.ending === 'prompt') {
      const options = runDialog (this.markdown, this.currentDialog, this.state, this.dialogPosition + 1)
      if (r.IsKeyPressed(r.KEY_UP)) {
        this.currentOption -= 1
      }
      if (r.IsKeyPressed(r.KEY_DOWN)) {
        this.currentOption += 1
      }
      if (r.IsKeyPressed(r.KEY_SPACE)) {
        this.currentDialog = options[this.currentOption].dialog.replace(/^#/, '')
        this.currentOption = 0
        this.dialogPosition = 0
        if (this.currentDialog === 'END') {
          this.open = false
        } else {
          this.screen = runDialog (this.markdown, this.currentDialog, this.state)
        }
      }
      if (this.currentOption < 0) {
        this.currentOption = options.length - 1
      }
      if (this.currentOption >= options.length) {
        this.currentOption = 0
      }
      this.drawOptions(options)
    } else {
      if (r.IsKeyPressed(r.KEY_SPACE)) {
        this.dialogPosition += 1
        this.screen = runDialog (this.markdown, this.currentDialog, this.state, this.dialogPosition)
      }
    }

    if (this.screen.who) {
      r.DrawText(this.screen.who, this.position.x + 10 - 2, this.position.y - 35 - 2, this.fontSize, r.BLACK)
      r.DrawText(this.screen.who, this.position.x + 10, this.position.y - 35, this.fontSize, this.color)
      const whoImage = this.state[this.screen.who]?.icon
      if (whoImage) {
        r.DrawTexture(whoImage, this.position.x + this.position.width - whoImage.width - 10, this.position.y - whoImage.height, r.WHITE)
      }
    }

    if (this.screen.ending !== 'prompt' && Math.floor(r.GetTime() * this.speed) % 2 === 0) {
      r.DrawRectangle(this.position.x + this.position.width - 15, this.position.y + this.position.height - 15, 5, 5, this.color)
    }
  }

  // call this on every frame
  draw () {
    if (!this.open) {
      return
    }
    if (Array.isArray(this.screen)) {
      if (!this.screen.length) {
        this.open = false
        return
      }
      this.drawOptions(this.screen)
    } else {
      this.drawDialog()
    }
  }
}

// example

r.InitWindow(640, 480, 'raylib - dialog')
r.SetTargetFPS(60)

const state = {
  player: {
    name: 'Simon',
    inventory: ['shirt', 'pants', 'shoes']
  },
  konsumer: {
    scared: false,
    gaveSword: false,
    icon: r.LoadTexture('examples/images/konsumer.png')
  },
  Simon: {
    icon: r.LoadTexture('examples/images/Simon.png')
  }
}

const patch = {
  texture: r.LoadTexture('examples/images/ninepatch.png'),
  source: {
    x: 0,
    y: 192,
    height: 64,
    width: 64
  },
  left: 6,
  top: 6,
  right: 6,
  bottom: 6,
  layout: r.NPATCH_NINE_PATCH
}

const dialog = new Dialog(await fs.readFile('example.md', 'utf8'), patch, state)
dialog.open = false

while (!r.WindowShouldClose()) {
  r.BeginDrawing()
  r.ClearBackground(r.LIGHTGRAY)
  r.DrawText("Press space to advance dialog.", 80, 260, 30, r.BLACK)
  
  if (!dialog.open) {
    if (r.IsKeyPressed(r.KEY_SPACE)) {
      dialog.setDialog()
      dialog.open = true
    }
  }

  dialog.draw()

  r.DrawText(`Konsumer: ${dialog.state.konsumer.scared ? 'Scared' : 'Not scared'}`, 10, 10, 20, r.BLACK)

  r.DrawText(`Inventory:`, 10, 40, 20, r.BLACK)
  for (const i in dialog.state.player.inventory) {
    r.DrawText(dialog.state.player.inventory[i], 10, 60 + (i * 22), 20, r.BLACK)
  }

  r.EndDrawing()
}

r.CloseWindow()
