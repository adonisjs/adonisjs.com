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
      enableDirectives: true,
    })
    md.transform(codeblocks, shiki)

    await md.process()
    return toHtml(md)
  }
}
