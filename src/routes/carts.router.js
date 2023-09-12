const express = require('express')
const { Router } = require('express')
const { cartModel } = require('../models/carts.model')
const { productModel } = require('../models/products.model')
const { ObjectId } = require('mongodb')

const mongoose = require('mongoose')
// const fs = require('fs').promises

const router = Router()

// const carts = []
// let cartId = 1
// let quantity = 1

// async function writeFile() {
//     const data = JSON.stringify(carts)
  
//     try {
//       await fs.writeFile('carts.json', data)
//       console.log('Archivo actualizado correctamente')
//     } catch (error) {
//       console.log('Error al escribir el archivo')
//     }
// }

// async function loadProducts() {
//     try {
//       const data = await fs.readFile('carts.json')
//       const parsedData = JSON.parse(data)
//       carts.push(...parsedData)
//       const maxId = Math.max(...carts.map((cart) => cart.id))
//       cartId = maxId + 1
//       console.log('Productos cargados correctamente')
//     } catch (error) {
//       console.log('Error al cargar los productos')
//     }
//   }

//   loadProducts()

router.post("/", async (req,res) => {
  let cart = []
  try {
    let result = await cartModel.create({ cart })
    res.send({status: "success", message: "Carrito creado con exito", payload: result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ status: "error", message: "Error al crear el carrito"})
  }
})

router.post("/:cid/products/:pcode", async (req, res) => {
  const pcode = parseInt(req.params.pcode)
  const cid = req.params.cid

  try {
    const productToAdd = await productModel.findOne({ code: pcode });
    if (!productToAdd) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado" })
    }

    const cart = await cartModel.findById(cid)

    if (!cart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" })
    }

    const existingProduct = cart.cart.find((item) => item.product.code === pcode)
    console.log(existingProduct)
    if (existingProduct) {
      await cartModel.updateOne(
        { _id: cid, "cart.product.code": pcode },
        { $inc: { "cart.$.quantity": 1 } }
      )
    } else {
      await cartModel.updateOne(
        { _id: cid },
        { $push: { cart: { product: productToAdd } } }
      );
    }

    res.send({ status: "success", message: "Producto agregado al carrito" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: "error", message: "Error al agregar el producto" })
  }
})





// router.post("/", async (req,res) => {
//     let products = await productModel.find()
//     let cart = products
//     try {
//       let result = await cartModel.create({ cart })
//       res.send({ status: "succes", payload: result })
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({ status: "error", message: "Error al agregar el carrito"})
//     }
//     // const newCart = {
//     //     id: cartId,
//     //     products: []
//     // }
//     // cartId++
//     // carts.push(newCart)
//     // writeFile()
//     // res.json({ message: "Carrito agregado correctamente." })
// })

router.get("/:cid", async (req, res) => {
  const cid = req.params.cid

  try {
      const cart = await cartModel.findById(cid)
      console.log(cart)
      if (cart) {
          res.send({ status: "success", payload: cart })
      } else {
          return res.status(404).json({ error: "Carrito no encontrado." })
      }
  } catch (error) {
      console.log(error)
      res.status(500).send({ status: "error", message: "Error al obtener el carrito" })
  }
})

// router.post("/:cid/product/:pid", (req,res) => {
    

//     const pid = parseInt(req.params.pid)
//     const cid = parseInt(req.params.cid)

//     const cart = carts.find((cart) => cart.id === cid)

//     if (!cart) {
//         return res.status(404).json({ error: "Carrito no encontrado."})
//     }

//     const existingProduct = cart.products.find((product) => product.product === pid);

//     if (existingProduct) {
//       existingProduct.quantity += 1;
//     } else {
//       const newProduct = {
//         product: pid,
//         quantity: 1,
//       };
//       cart.products.push(newProduct);
//     }

//     writeFile()
    
//     res.json({ message: "Producto agregado correctamente." })
// })

router.delete("/:cid/products/:pcode", async (req, res) => {
  const pcode = parseInt(req.params.pcode)
  const cid = req.params.cid
  const productToRemove = await productModel.findOne({ code: pcode })

  try {
    const result = await cartModel.updateOne(
      { _id: cid },
      { $pull: { cart: { product: productToRemove } } }
    )

    if (result.nModified === 0) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado en el carrito" })
    }

    res.send({ status: "success", message: "Producto eliminado del carrito" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: "error", message: "Error al eliminar el producto" })
  }
})


router.put("/:cid", async (req, res) => {
  const cid = req.params.cid
  const newCart = req.body

  newCart.forEach((item) => {
    item.product._id = new ObjectId(item.product._id)
  })

  try {
    const result = await cartModel.updateOne(
      { _id: cid },
      { cart: newCart }
    );

    res.send({ status: "success", message: "Carrito actualizado", payload: result })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: "error", message: "Error al actualizar el cart" })
  }
})

router.put("/:cid/products/:pcode", async (req, res) => {
  const pcode = parseInt(req.params.pcode)
  const cid = req.params.cid
  const newQuantity = req.body.quantity

  try {
    const result = await cartModel.updateOne(
      { _id: cid, "cart.product.code": pcode },
      { $set: {"cart.$.quantity": newQuantity } }
    );

    res.send({ status: "success", message: "Cantidad actualizada", payload: result })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: "error", message: "Error al actualizar la cantidad" })
  }
})


module.exports = router