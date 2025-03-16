import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API boards get list' })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

//Api hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card')
  .put(boardValidation.moveCardToDifferentColumns, boardController.moveCardToDifferentColumns)

export const boardRoute = Router