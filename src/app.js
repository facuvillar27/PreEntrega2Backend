const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const productsRouter = require('./routes/products.router')
const { productModel } = require('./models/products.model')
const cartsRouter = require('./routes/carts.router')
const  { cartModel } = require('./models/carts.model')
const app = express()
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, "public")))


app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

const environment = () => {
    mongoose.connect('mongodb+srv://facuvillar27:admin@cluster0.pmdpmvu.mongodb.net/ecommerce')
    .then(() => {
        console.log("Conectado a la BD de Mongo Atlas")
    })
    .catch(error => {
        console.error("Error en la conexión", error)
    })
}

environment()

app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})