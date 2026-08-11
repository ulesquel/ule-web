import { PORT, isOnDev } from '@/configs/app.js'
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
app.use(
  cors(),
  // TODO: Set the origin to the ULE page
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cloudinaryConfig)
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', `${process.cwd()}/src/views`)
app.use(express.static(`${process.cwd()}/public`))

app.get('/', (req, res) => {
  const { refreshToken } = req.cookies
  if (refreshToken) {
    return res.redirect('/users/dashboard')
  }
  return res.render('login')
})

app.use('/fests', festRouter)
app.use('/users', usersRouter)

if (isOnDev) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
