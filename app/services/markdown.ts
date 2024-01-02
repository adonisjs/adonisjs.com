import { map } from 'unist-util-map'
import app from '@adonisjs/core/services/app'
import { MarkdownFile } from '@dimerapp/markdown'
import { toHtml } from '@dimerapp/markdown/utils'
import { Shiki, codeblocks } from '@dimerapp/shiki'

/**
 * Configuring shiki to prettify codeblocks
 */
const shiki = new Shiki()
shiki.useTheme(app.makeURL('resources/themes/night_owl.json'))
await shiki.boot()

/**
 * Converts from markdown contents to HTML
 */
export default class MarkdownService {
  #contents: string
  #filePath: string

  constructor(contents: string, filePath: string) {
    this.#contents = contents
    this.#filePath = filePath
  }

  async toHTML() {
    const md = new MarkdownFile(this.#contents, {
      filePath: this.#filePath,
      allowHtml: true,
      generateToc: true,
      enableDirectives: true,
    })
    md.transform(codeblocks, shiki)
    md.transform(() => {
      return (tree) => {
        map(tree, (node) => {
          if (node.type === 'containerDirective') {
            node.data = node.data || {}

            if (node.data.hName === 'pre') {
              node.data.hProperties = node.data.hProperties || {}
              const properties = node.data.hProperties as Record<string, any>
              properties.className = properties.className || []
              properties.className.push('dark')
            }
          }
          return node
        })
      }
    })

    await md.process()
    return toHtml(md)
  }
}
