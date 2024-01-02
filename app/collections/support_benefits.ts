import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type supportBenefits from '../../content/support_benefits/db.json'

export type SupportBenefit = (typeof supportBenefits)[number]

/**
 * Collection of support program benefits
 */
export default class SupportBenefits extends BaseCollection<SupportBenefit> {
  uid: keyof SupportBenefit = 'name'
  dbFilePath: string = app.makePath('content/support_benefits/db.json')
}
