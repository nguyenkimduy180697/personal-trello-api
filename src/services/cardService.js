import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      //Xử lý cấu trức data ở đây trước khi trả về
      getNewCard.card = []

      //Cập nhật mảng cardOrderIds cho board
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}