import { UsersController } from '@/controllers/users.js'
import authorization from '@/middlewares/authorization.js'
import { sqliteModel } from '@/constants.js'
import { Router } from 'express'

const router = Router()

const usersController = new UsersController(sqliteModel)

router.post('/register', authorization, (req, res) =>
  usersController.register(req, res),
)

router.get('/refresh', authorization, (req, res) =>
  usersController.refreshToken(req, res),
)

router.post('/login', (req, res) => usersController.login(req, res))

router.get('/logout', (req, res) => usersController.logout(req, res))

router.get('/', authorization, (req, res) =>
  usersController.getAllUsers(req, res),
)

router.get('/dashboard', authorization, (req, res) =>
  usersController.renderDashboard(req, res),
)

export default router
