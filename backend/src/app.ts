import { PORT, frontUrl, nodeEnv } from '@/configs/app.js'
import cloudinaryConfig from '@/middlewares/cloudinary.js'
import { logger } from '@/middlewares/logger.js'
import festRouter from '@/routes/fests.js'
import usersRouter from '@/routes/users.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

const app = express()

app.disable('x-powered-by')

app.use(logger)
app.use(cookieParser())
app.use(
  cors({
    origin: frontUrl,
    credentials: true,
  }),
  // TODO: Set the origin to the ULE page and quit the dev
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cloudinaryConfig)

app.use('/fests', festRouter)
app.use('/users', usersRouter)

if (nodeEnv === 'dev') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
