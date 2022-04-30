import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import YAML from 'yaml'
import TOML from 'toml'
import tpl from 'template-templates'

// run a single conversation in the dialog
// TODO: actually implement this
export function run (dialog, variables) {
  let currentDialog
  return {
    get (name) {
      currentDialog = dialog.dialogs.find(d => d.id === name)
    }
  }
}

// parse a markdown file into dialog format
export function parse (content) {
  const ast = fromMarkdown(content, {
    extensions: [frontmatter(['yaml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])]
  })

  // add frontmatter
  // this is optional, and removing it will remove the need for other parsers
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

  // find dialogs
  const dialogs = []
  for (let t = 0; t < ast.children.length; t++) {
    const tag = ast.children[t]
    if (tag.type === 'heading' && tag.depth === 2) {
      const id = tag.children.find(tt => tt.type === 'text').value.trim().toLowerCase().replace(/[- .,\\/]/g, '_').replace(/['"?*%$"]/g, '')
      const dialog = {
        id,
        conversation: [],
        options: [],
        code: []
      }

      // find tags between h2's
      for (let h = t + 1; h < ast.children.length; h++) {
        const tag = ast.children[h]
        if (tag.type === 'heading' && tag.depth === 2) {
          break
        }

        if (tag.type === 'code') {
          dialog.code.push({
            langauge: tag.lang,
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
              link: o.children[0].children[0].url,
              text: o.children[0].children[0].children[0].value
            }
          })
        }
      }
      dialogs.push(dialog)
    }
  }

  return { dialogs, info }
}
