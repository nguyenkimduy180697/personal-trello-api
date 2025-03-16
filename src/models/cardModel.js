import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId, ReturnDocument } from 'mongodb'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const INVALID_UPDATE_FIELD = ['_id', 'boardId', 'createdAt']

const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const valudateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await valudateBeforeCreate(data)
    const newData = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId)
    }

    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newData)
    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}


const update = async (cardId, updateData) => {
  try {
    //Lọc các fields khong cho update
    Object.keys(updateData).forEach(key => {
      if (INVALID_UPDATE_FIELD.includes(key)) {
        delete updateData[key]
      }
    })
    //Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnId) updateData.columnId = new ObjectId(updateData.columnId)
    console.log('updateData', updateData)

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { ReturnDocument: ReturnDocument.AFTER }
    )
    return result
  } catch (error) {
    throw error
  }
}


const deleteManyByColumnId = async ( columnId ) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(columnId)
    })

    console.log('deleteManyByColumnId result', result)
    return result
  } catch (error) {
    console.error('Error deleting cards:', error)
    throw new Error(error)
  }
}


export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId
}