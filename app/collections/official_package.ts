import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type officialPackages from '../../content/official_packages/db.json'

export type OfficialPackage = (typeof officialPackages)[number]

export default class OfficialPackages extends BaseCollection<OfficialPackage> {
  uid: keyof OfficialPackage = 'name'
  dbFilePath: string = app.makePath('content/official_packages/db.json')
}
