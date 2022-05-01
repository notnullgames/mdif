import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import m from 'memoizee'
import YAML from 'yaml'
import TOML from 'toml'
import mustache from 'mustache'
import DidYouMean from 'did-you-mean'

export const textToId = m((text) => text.trim().toLowerCase().replace(/[,&\- \\/]+/g, '_').replace(/[`()+={}[\]#@'!"|.?*%$"]+/g, ''))

// each of these functions memoizes, so they can grab their own data-dependencies (using md/id)

// parse markdown initially to get meta, and info: frontmatter (in toml: +++ or yaml: ---)
export const getASTInfo = m((md) => {
  const ast = fromMarkdown(md, {
    extensions: [frontmatter(['yaml', 'toml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])]
  })

  // get meta
  let info = ast.children.find(c => c.type === 'yaml' || c.type === 'toml')
  if (info) {
    if (info.type === 'yaml') {
      info = YAML.parse(info.value)
    } else {
      info = TOML.parse(info.value)
    }
  } else {
    info = {}
  }

  return { ast, info }
})

// get all conversation IDs
export const getConversations = m(md => {
  const { ast } = getASTInfo(md)
  return ast.children.reduce((out, tag, id) => {
    if (tag.type === 'heading' && tag.depth === 2) {
      const id = textToId(tag.children.find(tt => tt.type === 'text').value)
      return [...out, id]
    }
    return out
  }, [])
})

// get all sections as AST (mdast) keyed by ID
export const getAllSections = m(md => {
  const { ast } = getASTInfo(md)
  const sections = {}
  // find section
  for (let t = 0; t < ast.children.length; t++) {
    const toptag = ast.children[t]
    if (toptag.type === 'heading' && toptag.depth === 2) {
      const id = textToId(toptag.children.find(tt => tt.type === 'text').value)
      // find tags between h2's
      for (let h = t + 1; h < ast.children.length; h++) {
        const tag = ast.children[h]
        if (tag.type === 'heading' && tag.depth === 2) {
          break
        }
        sections[id] = sections[id] || { id, children: [], ast: toptag }
        sections[id].children.push(tag)
      }
    }
  }
  return sections
})

// get a single section as AST (mdast)
export const getSection = m((md, id) => {
  const conversations = getConversations(md)

  if (!conversations.includes(id)) {
    // fancy error suggests a section-ID
    const m = new DidYouMean(conversations.join(' '))
    throw new Error(`Dialog ID "${id}" not found. Did you mean "${m.get(id)}"?`)
  }

  const sections = getAllSections(md)
  return sections[id]
})

// get a single section and turn it into a dialog (code, conversation, options)
export const getDialog = m((md, id, variables) => {
  const section = getSection(md, id)
  const s = section.children.length
  // recreate the section as markdown, but use mustache, then back to ast
  if (s) {
    md = md.toString()
    const source = md.split('\n').slice(section.ast.position.start.line, section.children[s - 1].position.end.line).join('\n').trim()
    const parsed = mustache.render(source, variables)
    const ast = fromMarkdown(parsed)

    const dialog = {
      code: [],
      conversation: [],
      options: []
    }

    for (const tag of ast.children) {
      // code goes straight in
      if (tag.type === 'code') {
        dialog.code.push({
          lang: tag.lang,
          source: tag.value
        })
      }

      // blockquotes are a line of dialog
      if (tag.type === 'blockquote') {
        for (const p of tag.children) {
          dialog.conversation.push({
            who: p.children.find(t => t.type === 'emphasis').children[0].value.trim(),
            text: p.children.find(t => t.type === 'text').value.trim()
          })
        }
      }

      // lists are menu-options
      if (tag.type === 'list') {
        dialog.options = tag.children.map(o => {
          return {
            dialog: o.children[0].children[0].url,
            text: o.children[0].children[0].children[0].value
          }
        })
      }
    }
    return dialog
  }
})

// get the current part of the dialog
export const runDialog = (md, id, variables, position = 0) => {
  // support using dialog for 1st param, instead of markdown
  const dialog = (typeof md === 'string' || md.toString) ? getDialog(md, id, variables) : md

  // run code for this dialog, when it first loads
  if (position === 0) {
    const code = (dialog.code || []).filter(c => c.lang === 'js').map(c => c.source).join('\n')
    if (code) {
      const f = new Function(...Object.keys(variables), code)
      f(...Object.values(variables))
    }
  }

  const line = dialog.conversation[position]

  if (typeof line === 'undefined') {
    return dialog.options
  }

  return line
}
