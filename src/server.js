/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { coreOptions } from './config/cors'
import { CONNECT_DB, GET_DB, CLOSE_DB } from './config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  //Xuwr lys CORS
  app.use(cors(coreOptions))

  // Enable req.body json data
  app.use(express.json())

  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })

  exitHook(() => {
    console.log('Close...')
    CLOSE_DB()
  })
}

(async () => {
  try {
    console.log('Connecting...')
    CONNECT_DB()
    console.log('Connected...')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()


//Chỉ khi kết nối tới DB thành công thì mới start Server
// CONNECT_DB()
//   .then(() => console.log('oke'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })