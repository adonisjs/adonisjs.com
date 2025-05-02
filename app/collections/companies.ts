import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type companiesUsingAdonisJS from '../../content/companies_using_adonisjs/db.json'

export type Company = (typeof companiesUsingAdonisJS)[number]

/**
 * Collection of companies using AdonisJS
 */
export default class Companies extends BaseCollection<Company> {
  uid: keyof Company = 'name'
  viteAssets: (keyof Company)[] = ['logo']
  dbFilePath: string = app.makePath('content/companies_using_adonisjs/db.json')
}
