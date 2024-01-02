/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const BlogController = () => import('#controllers/blog_controller')
const HomeController = () => import('#controllers/home_controller')
const AboutController = () => import('#controllers/about_controller')
const CaseStudiesController = () => import('#controllers/case_studies_controller')
const SupportProgramController = () => import('#controllers/support_program_controller')

router.get('/', [HomeController])
router.get('/support_program', [SupportProgramController])
router.get('/about', [AboutController])
router.get('/case_studies', [CaseStudiesController])
router.resource('blog', BlogController).params({ blog: 'slug' }).only(['index', 'show'])
