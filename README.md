# Markdown Interactive Fiction

This is a dialog/interactive fiction engine (for javascript) that lets you describe conversations and games. It uses a subset of [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) to define your dialogs.

## usage

In your own project:

```sh
npm i mdif
```

```js
import { promises as fs } from 'fs'
import createDialog from 'mdif'

const md = await fs.readFile('example.md')

// read some info
console.log(md)

// set callbacks
md.onChoice = choice => {
  console.log('CHOICE', choice)
}
md.onClose = () => {
  console.log('CLOSE')
}
md.onLine = line => {
  console.log('LINE', line)
}
md.onChoices = choices => {
  console.log('CHOICES', choices)
}

// get the first line of dialog from "start"
dialog.open('start')

console.log(dialog.current)

```


## try it out here

```sh
git clone https://github.com/konsumer/mdif.git
cd mdif

npm i          # install deps & tools

npm run cli    # run examples/cli demo
npm run raylib # run examples/raylib demo
npm test       # run unit-tests in mdif.test.js, that also have some usage info
```
