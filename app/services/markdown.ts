import { map } from 'unist-util-map'
import app from '@adonisjs/core/services/app'
import { fromHtml } from 'hast-util-from-html'
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

            if (node.data.hName === 'note' || node.data.hName === 'applaud') {
              const classes = ['alert', `alert-${node.data.hName}`]
              node.data.hName = 'div'
              node.data.hProperties = node.data.hProperties || {}
              const properties = node.data.hProperties as Record<string, any>
              properties.className = properties.className || []
              properties.className.push(...classes)
              const existingChildren = (node as any).children

              const newChildren = [
                {
                  type: 'containerDirective',
                  data: {
                    hName: 'div',
                    hProperties: {
                      className: ['alert_type'],
                    },
                  },
                  children: [
                    {
                      type: 'html',
                      value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
                    },
                  ],
                },
                {
                  type: 'containerDirective',
                  data: {
                    hName: 'div',
                    hProperties: {
                      className: ['alert_contents'],
                    },
                  },
                  children: existingChildren,
                },
              ]

              ;(node as any).children = newChildren
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
