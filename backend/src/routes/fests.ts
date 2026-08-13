import { FestController } from '@/controllers/fests.js'
import authorization from '@/middlewares/authorization.js'
import { upload } from '@/middlewares/multer.js'
import { Router } from 'express'

const router = Router()

router.get('/', FestController.getAll)

router.get('/:id', FestController.get)

router.post('/', upload, authorization, FestController.save)

router.delete('/:id', authorization, FestController.delete)

export default router
