import got from 'got'
import { writeFile } from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class DownloadSponsors extends BaseCommand {
  static commandName = 'download:sponsors'
  static description = 'Downloads sponsors from "thetutlage/static" repo'

  static options: CommandOptions = {}

  outputPath = this.app.makePath('content/sponsors/db.json')
  sponsorsSource =
    'https://raw.githubusercontent.com/thetutlage/static/main/sponsorkit/sponsors.json'

  async run() {
    const contents = await got(this.sponsorsSource).json()
    await writeFile(this.outputPath, JSON.stringify(contents))
    this.logger.log('Downloaded sponsors')
  }
}
