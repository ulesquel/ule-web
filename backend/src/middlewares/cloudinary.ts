import { v2 as cloudinary } from 'cloudinary'
import type { NextFunction, Request, Response } from 'express'
export default (_: Request, __: Response, next: NextFunction) => {
  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'] as string,
    api_key: process.env['CLOUDINARY_API_KEY'] as string,
    api_secret: process.env['CLOUDINARY_API_SECRET'] as string,
  })

  next()
}
