/* eslint-disable no-console */
const { MongoClient, ServerApiVersion } = require('mongodb')
import { env } from './environment'

let trelloDatabaseInstance = null

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mogoClient = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mogoClient.connect()

  trelloDatabaseInstance = mogoClient.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mogoClient.close()
}

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect()
//     // Send a ping to confirm a successful connection
//     await client.db('trello').command({ ping: 1 })
//     console.log('Pinged your deployment. You successfully connected to MongoDB!')
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close()
//   }
// }
// run().catch(console.dir)
