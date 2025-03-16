import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondittion = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
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
    //Nếu cần làm tính năng di chuyển Column sang Board khác thì mới thêm valudate boardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
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

const deleteItem = async (req, res, next) => {
  const correctCondittion = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondittion.validateAsync(req.params)
    //Dữ liệu ok thì đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}


export const columnValidation = {
  createNew,
  update,
  deleteItem
}