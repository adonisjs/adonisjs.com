import app from '@adonisjs/core/services/app'
import { BaseCommand } from '@adonisjs/core/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import router from '@adonisjs/core/services/router'
import HomeController from '#controllers/home_controller'
import BlogController from '#controllers/blog_controller'
import AboutController from '#controllers/about_controller'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { HttpContextFactory } from '@adonisjs/core/factories/http'
import SupportProgramController from '#controllers/support_program_controller'
import CaseStudiesController from '#controllers/case_studies_controller'

export default class BuildStatic extends BaseCommand {
  static commandName = 'build:static'
  static description = 'Creates a static build of the website. Run this command after vite build'
  static options: CommandOptions = {
    startApp: true,
  }

  /**
   * Creates a static copy of the home page
   */
  protected async buildHomePage() {
    const ctx = new HttpContextFactory().create()
    const html = await new HomeController().handle(ctx)
    await writeFile(app.makePath('dist/index.html'), html)
    this.logger.success('created dist/index.html')
  }

  /**
   * Creates a static copy of the about page
   */
  protected async buildAboutPage() {
    const ctx = new HttpContextFactory().create()
    const html = await new AboutController().handle(ctx)
    await writeFile(app.makePath('dist/about.html'), html)
    this.logger.success('created dist/about.html')
  }

  /**
   * Creates a static copy of the support program page
   */
  protected async buildSupportProgramPage() {
    const ctx = new HttpContextFactory().create()
    const html = await new SupportProgramController().handle(ctx)
    await writeFile(app.makePath('dist/support_program.html'), html)
    this.logger.success('created dist/support_program.html')
  }

  /**
   * Creates a static copy of the blog listing and
   * individual blog posts.
   */
  protected async buildBlog() {
    const blogController = new BlogController()
    const ctx = new HttpContextFactory().create()
    await mkdir(app.makePath('dist/blog'), { recursive: true })

    /**
     * Create post listing page
     */
    const list = await blogController.index(ctx)
    await writeFile(app.makePath('dist/blog/index.html'), list)
    this.logger.success('created dist/blog/index.html')

    /**
     * Get posts list as JSON
     */
    const posts = await blogController.list()

    /**
     * Create static page for each blog post
     */
    for (let post of posts) {
      const postCtx = new HttpContextFactory().create()
      postCtx.params = { slug: post.slug }

      const html = await blogController.show(postCtx)
      if (typeof html === 'string') {
        await writeFile(app.makePath(`dist/blog/${post.slug}.html`), html)
        this.logger.success(`created dist/blog/${post.slug}.html`)
      }
    }
  }

  /**
   * Creates a static copy of the case studies listing and
   * individual case studies.
   */
  protected async buildCaseStudies() {
    const caseStudiesController = new CaseStudiesController()
    const ctx = new HttpContextFactory().create()
    await mkdir(app.makePath('dist/case_studies'), { recursive: true })

    /**
     * Create case studies listing page
     */
    const list = await caseStudiesController.index(ctx)
    await writeFile(app.makePath('dist/case_studies/index.html'), list)
    this.logger.success('created dist/case_studies/index.html')

    /**
     * Get case studies list as JSON
     */
    const caseStudies = await caseStudiesController.list()

    /**
     * Create static page for each case study
     */
    for (let caseStudy of caseStudies) {
      const caseStudyCtx = new HttpContextFactory().create()
      caseStudyCtx.params = { slug: caseStudy.slug }

      const html = await caseStudiesController.show(caseStudyCtx)
      if (typeof html === 'string') {
        await writeFile(app.makePath(`dist/case_studies/${caseStudy.slug}.html`), html)
        this.logger.success(`created dist/case_studies/${caseStudy.slug}.html`)
      }
    }
  }

  async run() {
    router.commit()
    await mkdir(app.makePath('dist'), { recursive: true })
    await this.buildHomePage()
    await this.buildAboutPage()
    await this.buildSupportProgramPage()
    await this.buildBlog()
    // await this.buildCaseStudies()
  }
}
