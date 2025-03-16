import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createdBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log(getNewBoard)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      return new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      //column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}


const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updateBoard = await boardModel.update(boardId, updateData)
    return updateBoard
  } catch (error) {
    throw error
  }
}


/**
 * Khi di chuyển card sang cilumn khác:
 * B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó (Bản chất là xóa card ra khỏi mảng)
 * B2: Cập nhật mảng cardOrderIds của coumn tiếp theo (Bản chất là thêm card với mảng cardOrderIds)
 * B3: Cập nhật lại trường columnId mới của cái card đã kéo
 * => Làm một API support riêng
 */
const moveCardToDifferentColumns = async (reqBody) => {
  try {
    // * B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó (Bản chất là xóa card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // * B2: Cập nhật mảng cardOrderIds của coumn tiếp theo (Bản chất là thêm card với mảng cardOrderIds)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // * B3: Cập nhật lại trường columnId mới của cái card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId : reqBody.nextColumnId
    })

    return { updateResult: 'Successfully' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumns
}