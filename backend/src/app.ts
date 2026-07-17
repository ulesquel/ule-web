import express, { type Response } from 'express'
import cors from 'cors'
import path from 'node:path'
import { SqliteModel } from '@/model/sqlite.js'
import { upload } from '@/middlewares/multer.js'
import cloudinaryConfig from '@/middlewares/cloudinary.js'
import morgan from 'morgan'
import {
  BadRequestError,
  DatabaseConnectionError,
  NotFoundError,
} from '@/errors/errors.js'
import type { Type } from '@/types/types.js'

const PORT = 3000
const app = express()
const __dirname = path.resolve()
const isOnDev = process.env?.['DEV'] ?? false

const handleErrors = (res: Response, error: unknown) => {
  if (NotFoundError.isError(error))
    return res.status(404).json({
      message: error.message,
    })
  else if (BadRequestError.isError(error))
    return res.status(400).json({
      message: error.message,
    })
  else if (DatabaseConnectionError.isError(error))
    return res.status(503).json({
      message: error.message,
    })
  else
    return res.status(500).json({
      message:
        'Ocurrió un error inesperado, estamos trabajando para arreglarlo',
    })
}

app.disable('x-powered-by')

app.use(morgan('dev'))
app.use(
  cors({
    // TODO: Set the origin to the ULE page
    origin: '*',
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cloudinaryConfig)

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/fests', (req, res) => {
  try {
    const { fest } = req.query
    const fests = SqliteModel.getAllFests((fest as Type) ?? '')
    return res.json(fests)
  } catch (error) {
    return handleErrors(res, error)
  }
})

app.get('/fests/:id', (req, res) => {
  try {
    const { id } = req.params
    const fests = SqliteModel.getFest(id ?? '')
    return res.json(fests)
  } catch (error) {
    return handleErrors(res, error)
  }
})

app.post('/fests', upload, (req, res) => {
  const fest = req.body
  const img = req.file

  if (!img || typeof img === 'undefined')
    return res
      .status(400)
      .json({ message: 'Pasá una imagen como portada de la jornada' })

  const uriImage = `data:${img?.mimetype};base64,${img?.buffer.toString('base64')}`
  const info = SqliteModel.insertEvent(fest, uriImage)
  info
    .then((info) =>
      res.status(201).json({
        info,
      }),
    )
    .catch((error) => handleErrors(res, error))
})

app.delete('/fests/:id', (req, res) => {
  try {
    const { id } = req.params
    const info = SqliteModel.deleteFest(id ?? '')
    console.log(info)
    res.status(204).json({})
  } catch (error) {
    console.error(error)
    return handleErrors(res, error)
  }
})

if (isOnDev) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
