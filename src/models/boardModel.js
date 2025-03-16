import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  type: Joi.string().required().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELD = ['_id', 'createdAt']

const valudateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await valudateBeforeCreate(data)
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    console.log('error', error)
    throw new Error(error)
  }
}

//Nhiệm vụ của func này là push 1 cái giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id ) } },
      { ReturnDocument: ReturnDocument.AFTER }
    )
    return result
  } catch (error) {
    throw error
  }
}

// Lấy một phần tử columnId ra khỏi mảng columnOrderIds
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id ) } },
      { ReturnDocument: ReturnDocument.AFTER }
    )
    return result
  } catch (error) {
    throw error
  }
}


const update = async (boardId, updateData) => {
  try {
    //Lọc các fields khong cho update
    Object.keys(updateData).forEach(key => {
      if (INVALID_UPDATE_FIELD.includes(key)) {
        delete updateData[key]
      }
    })
    //Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }

    console.log('updateData', updateData)
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { ReturnDocument: ReturnDocument.AFTER }
    )
    return result
  } catch (error) {
    throw error
  }
}


const moveCardToDifferentColumns = async (boardId, updateData) => {
  try {
    //Lọc các fields khong cho update
    Object.keys(updateData).forEach(key => {
      if (INVALID_UPDATE_FIELD.includes(key)) {
        delete updateData[key]
      }
    })
    console.log('updateData', updateData)
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { ReturnDocument: ReturnDocument.AFTER }
    )
    return result
  } catch (error) {
    throw error
  }
}


export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  moveCardToDifferentColumns,
  pullColumnOrderIds
}