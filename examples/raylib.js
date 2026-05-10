#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import r from 'raylib'
import createDialog from '../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(__dirname, 'images')

const SCREEN_W = 480
const SCREEN_H = 270
const FONT_SIZE = 12
const LINE_H = 16
const PAD = 10
const PORTRAIT_H = 64  // portraits scaled to this height

const NPATCH = {
  source: { x: 0, y: 192, width: 64, height: 64 },
  left: 6, top: 6, right: 6, bottom: 6,
  layout: r.NPATCH_NINE_PATCH
}

r.InitWindow(SCREEN_W, SCREEN_H, 'mdif dialog demo')
r.SetTargetFPS(60)

const panelTex = r.LoadTexture(join(ASSETS, 'ninepatch.png'))

// Load portrait per speaker name (case-sensitive filename match)
const portraitFiles = { konsumer: 'konsumer.png', Simon: 'Simon.png' }
const portraits = Object.fromEntries(
  Object.entries(portraitFiles).map(([name, file]) => [name, r.LoadTexture(join(ASSETS, file))])
)

const source = readFileSync(join(__dirname, '../example.md'), 'utf8')
const dialog = createDialog(source)

function wrapText(text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word
    if (r.MeasureText(candidate, FONT_SIZE) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawDialog(menuIndex) {
  if (!dialog.isOpen) return

  const inChoiceMode = dialog.choices.length > 0
  const speaker = !inChoiceMode && dialog.current?.speaker ? dialog.current.speaker : null
  const portrait = speaker ? portraits[speaker] : null
  const portraitScale = portrait ? PORTRAIT_H / portrait.height : 1
  const portraitDrawW = portrait ? Math.round(portrait.width * portraitScale) : 0
  const portraitW = portrait ? portraitDrawW + PAD : 0
  const innerW = SCREEN_W - PAD * 4 - portraitW

  const contentLines = []

  if (inChoiceMode) {
    const prefix = '> '
    const indent = '  '
    const prefixW = r.MeasureText(prefix, FONT_SIZE)
    for (let i = 0; i < dialog.choices.length; i++) {
      const selected = i === menuIndex
      const color = selected ? r.YELLOW : r.WHITE
      for (const [j, line] of wrapText(dialog.choices[i].label, innerW - prefixW).entries()) {
        contentLines.push({ text: (j === 0 ? (selected ? prefix : indent) : indent) + line, color })
      }
    }
  } else if (dialog.current) {
    for (const line of wrapText(dialog.current.text, innerW)) {
      contentLines.push({ text: line, color: r.WHITE })
    }
  }

  const hasHint = !inChoiceMode && dialog.current
  const textH = contentLines.length * LINE_H
  const contentH = Math.max(textH, portrait ? PORTRAIT_H : 0)
  const speakerH = speaker ? LINE_H : 0
  const boxH = contentH + PAD * 2 + (hasHint ? LINE_H : 0)
  const boxX = PAD
  const boxY = SCREEN_H - boxH - PAD - speakerH
  const boxW = SCREEN_W - PAD * 2

  if (speaker) {
    r.DrawText(speaker, boxX + PAD, boxY, FONT_SIZE, r.YELLOW)
  }

  r.DrawTextureNPatch(panelTex, NPATCH, { x: boxX, y: boxY + speakerH, width: boxW, height: boxH }, { x: 0, y: 0 }, 0, r.WHITE)

  if (portrait) {
    const portraitY = boxY + speakerH + PAD + Math.round((contentH - PORTRAIT_H) / 2)
    r.DrawTexturePro(
      portrait,
      { x: 0, y: 0, width: portrait.width, height: portrait.height },
      { x: boxX + PAD, y: portraitY, width: portraitDrawW, height: PORTRAIT_H },
      { x: 0, y: 0 }, 0, r.WHITE
    )
  }

  // vertically center text within contentH
  const textOffsetY = Math.round((contentH - textH) / 2)
  for (let i = 0; i < contentLines.length; i++) {
    const { text, color } = contentLines[i]
    r.DrawText(text, boxX + PAD + portraitW, boxY + speakerH + PAD + textOffsetY + i * LINE_H, FONT_SIZE, color)
  }

  if (hasHint) {
    const hint = '[Z] next'
    const hintW = r.MeasureText(hint, FONT_SIZE)
    r.DrawText(hint, boxX + boxW - PAD - hintW, boxY + speakerH + boxH - PAD - FONT_SIZE, FONT_SIZE, r.GRAY)
  }
}

let menuIndex = 0
dialog.open('hello')

while (!r.WindowShouldClose()) {
  if (dialog.isOpen) {
    if (dialog.choices.length > 0) {
      if (r.IsKeyPressed(r.KEY_UP))    menuIndex = (menuIndex - 1 + dialog.choices.length) % dialog.choices.length
      if (r.IsKeyPressed(r.KEY_DOWN))  menuIndex = (menuIndex + 1) % dialog.choices.length
      if (r.IsKeyPressed(r.KEY_Z) || r.IsKeyPressed(r.KEY_ENTER)) {
        dialog.choose(menuIndex)
        menuIndex = 0
      }
    } else if (dialog.current) {
      if (r.IsKeyPressed(r.KEY_Z) || r.IsKeyPressed(r.KEY_ENTER)) dialog.advance()
    }
  } else {
    // restart on any key after dialog ends
    if (r.IsKeyPressed(r.KEY_Z) || r.IsKeyPressed(r.KEY_ENTER)) {
      menuIndex = 0
      dialog.open('hello')
    }
  }

  r.BeginDrawing()
  r.ClearBackground(r.BLACK)
  drawDialog(menuIndex)
  if (!dialog.isOpen) {
    const msg = '[Z] restart'
    r.DrawText(msg, (SCREEN_W - r.MeasureText(msg, FONT_SIZE)) / 2, SCREEN_H / 2, FONT_SIZE, r.GRAY)
  }
  r.EndDrawing()
}

r.UnloadTexture(panelTex)
for (const tex of Object.values(portraits)) r.UnloadTexture(tex)
r.CloseWindow()
