import { promises as fs } from 'node:fs'
import { runDialog } from '../index.js' // 'mdif'

class Dialog {
  constructor (filename, state = {}) {
    this.filename = filename
    this.state = state
  }

  async md () {
    if (!this._md) {
      this._md = (await fs.readFile(this.filename, 'utf8'))
    }
    return this._md
  }

  async draw () {
    const screen = runDialog(await this.md(), currentDialog, this.state)
  }
}

// example

const dialog = new Dialog('example.md')
dialog.draw()
