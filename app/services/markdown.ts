import { dirname, resolve } from 'node:path'
import { map } from 'unist-util-map'
import app from '@adonisjs/core/services/app'
import vite from '@adonisjs/vite/services/main'
import { MarkdownFile } from '@dimerapp/markdown'
import { toHtml } from '@dimerapp/markdown/utils'
import { Shiki, codeblocks } from '@dimerapp/shiki'
import vsCodeGrammars from '../../vscode_grammars/main.js'

/**
 * Configuring shiki to prettify codeblocks
 */
const shiki = new Shiki()
shiki.useTheme(app.makeURL('resources/themes/night_owl.json'))
vsCodeGrammars.forEach((grammar) => shiki.loadLanguage(grammar))
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
          if (node.type === 'image') {
            const image = node as any
            if (!image.url.startsWith('https://') && !image.url.startsWith('/')) {
              const imageAbsPath = resolve(dirname(this.#filePath), image.url)
              console.log(imageAbsPath)
              image.url = vite.assetPath(app.relativePath(imageAbsPath))
            }
          }

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
              const svgIcon =
                node.data.hName === 'applaud'
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><g fill="#FCEA2B"><path stroke="#FCEA2B" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="m56.352 43.998l-1.061-7.477c-.512-3.022-.828-7.289-1.9-14.274c-2.474-1.815-5.452 1.65-6.204 4.633L44.435 8.96c-.556-3.614-7.134-2.877-6.45 1.574l2.086 14.078l-2.529-16.958c-.598-3.89-7.134-4.274-6.064 2.692c-.533-3.473-7.084-3.423-6.28 1.805l.774 5.431l.101.809l-.221-1.698c-.48-3.129-6.07-2.378-5.45 1.657l1.08 6.431"/><path d="M22.748 27.254c-3.192-3.193 1.689-7.689 4.28-5.098l16.31 16.31l-3.458-3.458c-1.162-2.857-.81-7.424 2.265-7.424c5.01 5.01 8.474 8.934 10.679 11.073c6.226 6.226 6.226 16.321 0 22.548s-16.187 6.258-22.414.031L13.172 43.998c-2.894-2.894 1.179-6.816 3.423-4.572l9.859 10.043l-8.574-8.734l-4.508-4.592c-3.75-3.749 1.515-7.674 4.006-5.183c-4.996-4.996.515-8.562 3.305-5.772l13.39 13.39"/></g><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"><path d="m20.36 18.341l.281 1.83m-5.233-7.261L14.06 6.624m-1.553 11.881l-5.915 2.521m7.061-5.506l-4.439-2.301m45.318 1.278l-.262-6.424m4.466 11.12l6.356.967m-8.21-3.572l3.725-3.336m-30.69 30.491L16.835 30.417m17.239 8.162L20.683 25.188m-7.511 18.81c-2.894-2.894 1.179-6.816 3.422-4.572l9.86 10.043M13.372 36.143c-3.75-3.749 1.515-7.674 4.006-5.183m3.305-5.772c-2.79-2.79-8.3.776-3.305 5.772m35.446 7.697c-2.205-2.14-5.669-6.062-10.679-11.072c-3.074 0-3.427 4.566-2.266 7.423l3.458 3.458l-16.31-16.31c-2.59-2.591-7.47 1.905-4.279 5.098m-9.376 8.889l4.508 4.592m34.944-2.078c6.226 6.226 6.226 16.321 0 22.548s-16.187 6.258-22.414.031M13.172 43.998L30.41 61.236m2.977-37.53L31.348 9.559m8.731 15.06l-2.536-17M20.36 18.342c-.621-4.045 4.983-4.798 5.464-1.662l.222 1.702m-.878-6.255c-.805-5.24 5.761-5.29 6.296-1.81"/><path d="M37.543 7.619c-.599-3.9-7.152-4.284-6.079 2.699m23.871 26.239c-.513-3.03-.83-7.306-1.905-14.31c-2.479-1.818-5.464 1.655-6.218 4.645l-2.76-17.964c-.556-3.622-7.15-2.884-6.465 1.578m-12.819 1.621l.776 5.445m-5.584.769l.281 1.83m-5.233-7.261L14.06 6.624m-1.553 11.881l-5.915 2.521m7.061-5.506l-4.439-2.301m45.318 1.278l-.262-6.424m4.466 11.12l6.356.967m-8.21-3.572l3.725-3.336"/></g></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`

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
                      value: svgIcon,
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
