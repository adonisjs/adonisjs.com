import dayjs from 'dayjs'
import { klona } from 'klona/json'
import { inspect } from 'node:util'
import { dirname, resolve } from 'node:path'
import app from '@adonisjs/core/services/app'
import vite from '@adonisjs/vite/services/main'
import logger from '@adonisjs/core/services/logger'
import { readFile, writeFile } from 'node:fs/promises'
import { RuntimeException } from '@adonisjs/core/exceptions'

import MarkdownService from '../services/markdown.js'

type ContentHtml = Awaited<ReturnType<MarkdownService['toHTML']>>

/**
 * Base collection abstract the logic of reading contents
 * from the database into a JavaScript collection
 */
export default abstract class BaseCollection<Entry> {
  abstract dbFilePath: string
  abstract uid: keyof Entry & string

  /**
   * Properties to process to resolve their values
   */
  inlineAssets?: (keyof Entry & string)[]
  viteAssets?: (keyof Entry & string)[]
  dates?: (keyof Entry & string)[]

  /**
   * Loaded reference of the database
   */
  db?: Entry[]

  /**
   * Refrence to the original database contents without
   * any mutation
   */
  originalDb?: any[]

  protected makePath(fileRelativePath: string) {
    return resolve(dirname(this.dbFilePath), fileRelativePath)
  }

  /**
   * Processes an entry by inlining its content and assets
   */
  protected async processEntry(entry: unknown) {
    if (entry && typeof entry === 'object') {
      const entryRecord = entry as Record<string, any>

      /**
       * Inline svg files
       */
      if (this.inlineAssets) {
        for (let asset of this.inlineAssets) {
          if (entryRecord[asset]) {
            const assetPath = this.makePath(entryRecord[asset])
            entryRecord[asset] = await readFile(assetPath, 'utf-8')
          }
        }
      }

      /**
       * Resolve vite assets
       */
      if (this.viteAssets) {
        for (let asset of this.viteAssets) {
          if (entryRecord[asset]) {
            const assetPath = this.makePath(entryRecord[asset])
            entryRecord[asset] = vite.assetPath(app.relativePath(assetPath))
          }
        }
      }

      /**
       * Converting dates to dayjs instances
       */
      if (this.dates) {
        for (let dateField of this.dates) {
          if (entryRecord[dateField]) {
            entryRecord[dateField] = dayjs(entryRecord[dateField])
          }
        }
      }

      /**
       * Read contents and converting markdown to HTML
       */
      if (entryRecord.content_path) {
        const contentPath = this.makePath(entryRecord.content_path)
        entryRecord.content = await readFile(contentPath, 'utf-8')
        entryRecord.contentHtml = await new MarkdownService(
          entryRecord.content,
          contentPath
        ).toHTML()
      }

      return
    }

    throw new RuntimeException(
      `Invalid database entry "${inspect(entry)}" in "${this.dbFilePath}" file`
    )
  }

  /**
   * Returns everything from the database
   */
  async all() {
    return this.load() as Promise<(Entry & ContentHtml)[]>
  }

  /**
   * Returns a specific entry from the database
   */
  async find(value: string): Promise<(Entry & ContentHtml) | null> {
    const db = await this.load()
    return db.find((entry) => entry[this.uid] === value) || null
  }

  /**
   * Loads collection and its contents from the database
   * file
   */
  async load() {
    if (this.db) {
      return this.db
    }

    const dbContents = await readFile(this.dbFilePath, 'utf-8')
    logger.debug('loading collection db %s', this.dbFilePath)

    const db = JSON.parse(dbContents)
    if (!Array.isArray(db)) {
      throw new RuntimeException(
        `Invalid database contents exported from "${this.dbFilePath}" file. Value must be an array`
      )
    }

    this.originalDb = klona(db)
    await Promise.all(db.map((entry) => this.processEntry(entry)))
    this.db = db
    return db
  }

  /**
   * Refresh collection content
   */
  async refresh() {
    this.db = undefined
    this.originalDb = undefined
    await this.load()
  }

  /**
   * Persists a new entry to the entries collection
   */
  async create(entry: Entry, prepend: boolean = false) {
    await this.load()
    this.originalDb = this.originalDb || []

    if (prepend) {
      this.originalDb.unshift(entry)
    } else {
      this.originalDb.push(entry)
    }

    const contentPath = (entry as any).content
    if (contentPath) {
      await writeFile(this.makePath(contentPath), '')
    }

    await writeFile(this.dbFilePath, JSON.stringify(this.originalDb, null, 2))
  }

  /**
   * Persists a new entry to the entries collection
   */
  async update(entry: Entry) {
    await this.load()
    this.originalDb = this.originalDb || []

    const matchingIndex = this.originalDb.findIndex(
      (originalEntry) => originalEntry[this.uid] === entry[this.uid]
    )
    if (matchingIndex > -1) {
      this.originalDb[matchingIndex] = entry
    }

    await writeFile(this.dbFilePath, JSON.stringify(this.originalDb, null, 2))
  }
}
