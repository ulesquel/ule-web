import { FestController } from '@/controllers/fests.js'
import { upload } from '@/middlewares/multer.js'
import { Router } from 'express'

const router = Router()

router.get('/', FestController.getAll)

router.get('/:id', FestController.get)

router.post('/', upload, FestController.save)

router.delete('/:id', FestController.delete)

export default router
