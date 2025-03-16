
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body)
    // console.log('req.query', req.query)
    // console.log('req.params', req.params)
    // console.log('req.files', req.files)
    // console.log('req.cookies', req.cookies)
    // console.log('req.jwwtDecoded', req.jwwtDecoded)
    // Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(req.body)
    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test')
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    console.log('req.params', req.params)
    const boardId = req.params.id
    const board = await boardService.getDetails(boardId)
    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(board)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test')
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(updatedBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test')
  } catch (error) { next(error) }
}


const moveCardToDifferentColumns = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumns(req.body)
    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(result)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test')
  } catch (error) { next(error) }
}


export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumns
}