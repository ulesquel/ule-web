import express from 'express'
import cors from 'cors'
import path from 'node:path'
import multer from 'multer'
// import { SqliteModel } from '@/model/sqlite.js'

const PORT = 3000
const app = express()
const __dirname = path.resolve()
const upload = multer()

app.use(
  cors({
    // TODO: Set the origin to the ULE page
    origin: '*',
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/fests', upload.single('img'), (req, res) => {
  const fest = req.body
  const file = req.file
  // const info = SqliteModel.insertEvent(fest)
  console.log(fest, file)
  res.json({ msg: 'Request getted' })
})

if (process.env?.['DEV'] ?? false) {
  app.listen(PORT, () => console.log(`Server running on 127.0.0.1:${PORT}`))
}
