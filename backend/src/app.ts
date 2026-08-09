import { PORT, isOnDev } from '@/configs/app.js';
import cloudinaryConfig from '@/middlewares/cloudinary.js';
import festRouter from '@/routes/fests.js';
import usersRouter from '@/routes/users.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';

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
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))

app.get('/', (_, res) => {
  res.render('login')
})

app.use('/fests', festRouter)
app.use('/users', usersRouter)

if (isOnDev) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
