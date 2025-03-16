import { StatusCodes } from 'http-status-codes'
import { get } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    if (getNewColumn) {
      //Xử lý cấu trức data ở đây trước khi trả về
      getNewColumn.card = []

      //Cập nhật mảng columnOrderIds cho board
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}


const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updateColumn = await columnModel.update(columnId, updateData)
    return updateColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    // Xóa column
    await columnModel.deleteOneById(columnId)

    // Xóa toàn bộ cards
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa columnId trong mảng columnOrderIds của board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its cards has been deleted' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}