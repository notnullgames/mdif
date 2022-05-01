# Markdown Interactive Fiction

This is a dialog/interactive fiction engine (for nodejs) that lets you describe conversations and games. It uses a subset of [markdown](https://www.markdownguide.org/basic-syntax/) to define your dialogs, and [mustache](http://mustache.github.io/mustache.5.html) to express light logic/formatting. It can be used in any sort of game/app that has dialog with (or without) logic.

## example usage

In your own project:

```sh
npm i mdif
```

```js
import { promises as fs } from 'node:fs'
import { runDialog } from 'mdif'

const md = (await fs.readFile('example.md'))

// get the first line of dialog from "start"
const variables = {
  player: { name: 'Peter' },
  konsumer: { scared: false }
}
let screen = runDialog(md, 'start', variables)

// increment to the next page
screen = runDialog(md, 'start', variables, 1)

console.log(screen)
```


## try it out here

```sh
git clone https://github.com/konsumer/mdif.git
cd mdif
npm i      # install deps & tools

npm start  # run examples/cli demo
npm test   # run unit-tests in test.js, that also have some usage info
```

