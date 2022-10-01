# Markdown Interactive Fiction

This is a dialog/interactive fiction engine (for javascript) that lets you describe conversations and games. It uses a subset of [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) to define your dialogs, and [mustache](http://mustache.github.io/mustache.5.html) to express light logic/formatting. It can be used in any sort of game/app that has dialog with (or without) logic.

## usage

In your own project:

```sh
npm i mdif
```

```js
import { promises as fs } from 'fs'
import { runDialog, getASTInfo } from 'mdif'

const md = await fs.readFile('example.md')

// read some info
console.log(getASTInfo(md).info)


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

npm i          # install deps & tools

npm start      # run examples/react demo
npm run cli    # run examples/cli demo
npm run raylib # run examples/raylib demo
npm test       # run unit-tests in mdif.test.js, that also have some usage info
```

## story reference

Essentially, you can use [mustache](http://mustache.github.io/mustache.5.html) for all logic, and [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) for the dialogs, which are made up of `conversation`, `options`, and `code`.

### markdown

- An h2 (`##`) defines a new dialog.
- a blockquote (`>`) defines something someone is saying. Optionally, wrap "who" in italic: `*Feindish Guy* Oh hey, my fellow feind`
- a list of links is options available at the end. It looks like this:

```md
- [hmm?](#start)
- [yes](#thats_my_name)
- [no](#lie_about_name)
- [wait, how do you know my name?](#lie_about_name)
```

The URLs should be `#id` (to link to other dialogs) or `file#id` (to load a different conversation-collection.) This library doesn't manage that at all, so you will have to parse the url, in your code:

```js

let md = await fs.readFile('example.md')

// user has progressed to page 1, which in this case has a menu (it's an id not in conversation lines)
let dialog = runDialog(md, 'start', variables, 1) 

// is this a menu or a line of text
if (Array.isArray(dialog)) {
  // ... show options and get user-selection here

  const [file, hash] = dialog[SELECTION].url.split('#')

  // it's another file, so set that to be the main md
  if (file) {
    md = await fs.readFile(file)
  }

  // load next dialog
  dialog = runDialog(md, hash, variables)
}

// do other stuff in loop, like show current dialog, allow user to progress, etc

```


#### code

Code is pulled out of codeblocks, like this (surround with 3 backticks, and set language):


```js
player.happy = true
```

It is run when the individual dialog first loads. Currently, the only supported language is `js`, but we may support more later.


## frontmatter

You can use [frontmatter](https://gohugo.io/content-management/front-matter/) to define any meta-information for the whole file. It goes at the top, and can be used externally with `getASTInfo(md).info`. We support TOML & YAML.

**YAML**:
```md
---
name: My Cool World
friendly: true
---
```

**TOML**:
```md
+++
preferred_language = 'TOML'
name = 'My Cool World'
+++
```

### mustache

Go read  [the docs](http://mustache.github.io/mustache.5.html) for more about how to use it, but essentially mustache is parsed before the dialog section is run, so you can insert logic based on your variables, like substitution, loops, condtionals, etc.


