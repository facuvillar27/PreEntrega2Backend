const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const cartCollection = "carts"

const cartSchema = new mongoose.Schema({
  cart: [
    {
        product: { type: Object },
        quantity: { type: Number, default: 1 },
    },
  ],
});


cartSchema.plugin(mongoosePaginate);

const cartModel = mongoose.model(cartCollection, cartSchema)

module.exports = { cartModel }