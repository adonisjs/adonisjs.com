import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type codeExamples from '../../content/code_examples/db.json'

export type CodeExample = (typeof codeExamples)[number]

/**
 * Represents a collection of code examples that can be rendered
 * individually inside the templates.
 */
export default class CodeExamples extends BaseCollection<CodeExample> {
  uid: keyof CodeExample = 'uid'
  dbFilePath: string = app.makePath('content/code_examples/db.json')

  /**
   * Returns codeblocks list for the hero section
   */
  async getHeroList() {
    const examples = await this.load()
    return examples.filter((example) => {
      return example.uid.startsWith('hero:')
    })
  }

  /**
   * Returns codeblocks list for the testing
   * section
   */
  async getTestingList() {
    const examples = await this.load()
    return examples.filter((example) => {
      return example.uid.startsWith('testing:')
    })
  }
}
