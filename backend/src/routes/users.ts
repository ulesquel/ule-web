import { UsersController } from '@/controllers/users.js'
import authorization from '@/middlewares/authorization.js'
import { Router } from 'express'

const router = Router()

router.post('/register', authorization, UsersController.register)

router.post('/refresh', authorization, UsersController.refreshToken)

router.post('/login', UsersController.login)

router.get('/logout', UsersController.logout)

router.get('/', authorization, UsersController.getAllUsers)

router.get('/dashboard', authorization, UsersController.renderDashboard)

export default router
