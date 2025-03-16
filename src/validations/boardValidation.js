import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondittion = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be at most 50 characters long',
      'string.trim': 'Title must not contain leading or trailing spaces'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().required().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    //set abortEarly: false để trường hợp kiểm tra hết tất cả các req
    await correctCondittion.validateAsync(req.body, { abortEarly: false })
    //Dữ liệu ok thì đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const update = async (req, res, next) => {
  //Lứu ý không hàm required() trong trường hợp update
  const correctCondittion = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  })

  try {
    //set abortEarly: false để trường hợp kiểm tra hết tất cả các req
    // Đối với trường hợp update, cho phép Unknown để không cần đẩy một số fields lên
    await correctCondittion.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    //Dữ liệu ok thì đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}


const moveCardToDifferentColumns = async (req, res, next) => {
  //Lứu ý không hàm required() trong trường hợp update
  const correctCondittion = Joi.object({
    currentCardId:  Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId:  Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds:  Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId:  Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds:  Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    //set abortEarly: false để trường hợp kiểm tra hết tất cả các req
    // Đối với trường hợp update, cho phép Unknown để không cần đẩy một số fields lên
    await correctCondittion.validateAsync(req.body, { abortEarly: false })
    //Dữ liệu ok thì đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumns
}