import path from 'node:path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cloudinaryConfig from '@/middlewares/cloudinary.js'
import { PORT, isOnDev } from '@/config.js'
import festRouter from '@/routes/fests.js'
import usersRouter from '@/routes/users.js'

const app = express()
const __dirname = path.resolve()

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
app.use(cookieParser())

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.use('/fests', festRouter)
app.use('/users', usersRouter)

if (isOnDev) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
