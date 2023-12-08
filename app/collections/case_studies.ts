import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type caseStudies from '../../content/case_studies/db.json'

export type CaseStudy = (typeof caseStudies)[number]

export default class CaseStudies extends BaseCollection<CaseStudy> {
  uid: keyof CaseStudy = 'slug'
  inlineAssets: (keyof CaseStudy)[] = ['logo']
  dbFilePath: string = app.makePath('content/case_studies/db.json')
}
