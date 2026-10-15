import { FestController } from '@/controllers/fests.js'
import authorization from '@/middlewares/authorization.js'
import { upload } from '@/middlewares/multer.js'
import { Router } from 'express'
import { sqliteModel } from '@/constants.js'

const router = Router()
const festController = new FestController(sqliteModel)

router.get('/', (req, res) => festController.getAll(req, res))

router.get('/:id', (req, res) => festController.get(req, res))

router.post('/', upload, authorization, (req, res) =>
  festController.save(req, res),
)

router.delete('/:id', authorization, (req, res) =>
  festController.delete(req, res),
)

export default router
