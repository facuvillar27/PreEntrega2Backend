const express = require('express')
const { Router } = require('express')
const { productModel } = require('../models/products.model')


const router = Router()

// const fs = require('fs').promises

// const products = []

// async function writeFile() {
//     const data = JSON.stringify(products)

//     try {
//       await fs.writeFile('products.json', data)
//       console.log('Archivo actualizado correctamente')
//     } catch (error) {
//       console.log('Error al escribir el archivo')
//     }
// }

// async function loadProducts() {
//     try {
//       const data = await fs.readFile('products.json')
//       const parsedData = JSON.parse(data)
//       products.push(...parsedData)
//       const maxId = Math.max(...products.map((product) => product.id))
//       productId = maxId + 1
//       console.log('Productos cargados correctamente')
//     } catch (error) {
//       console.log('Error al cargar los productos')
//     }
//   }

//   // Llamar a la función loadProducts al iniciar el servidor
//   loadProducts()

// Endpoints

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = "", category = "", status = "" } = req.query

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === "asc" ? 1 : -1, code: sort === "asc" ? 1 : -1 } : null,
        }

        const filter = {}

        if (category) {
            filter.category = category
        }

        if (status) {
            filter.status = status
        }
        let products = await productModel.paginate(filter, options)

        const totalPages = products.totalPages
        const currentPage = products.page
        const hasNextPage = products.hasNextPage
        const hasPrevPage = products.hasPrevPage
        const prevLink = hasPrevPage ? `/api/products/?limit=${limit}&page=${currentPage - 1}&sort=${sort}&category=${category}&status=${status}` : null
        const nextLink = hasNextPage ? `/api/products/?limit=${limit}&page=${currentPage + 1}&sort=${sort}&category=${category}&status=${status}` : null

        res.send({
            status: "success",
            payload: products.docs,
            totalPages: totalPages,
            prevPage: hasPrevPage ? currentPage - 1 : null,
            nextPage: hasNextPage ? currentPage + 1 : null,
            page: currentPage,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        });
    } catch (error) {
        console.error(error)
        res.status(500).send({ status: "error", message: "Error al obtener los productos" })
    }
})


router.get("/:pcode", async (req, res) => {
    const pcode = parseInt(req.params.pcode)
    let products = await productModel.find()
    const product = products.find((product) => product.code === pcode)
    if (product) {
        res.send({ result: "success", payload: product })
    } else {
        res.status(404).json({ error: "Producto no encontrado." })
    }
})

router.post("/", async (req, res) => {
    try {
        const products = await productModel.find();
        const productToAdd = req.body;
        const productToAddCode = parseInt(req.body.code);
        const productCode = products.find(
            (product) => parseInt(product.code) === productToAddCode
        );

        if (!productToAdd.title || !productToAdd.description || !productToAdd.code || !productToAdd.price || !productToAdd.status || !productToAdd.stock || !productToAdd.category) {
            return res.status(400).send({ status: "error", error: "Missing body params" });
        }

        if (productCode) {
            return res.status(400).send({ status: "error", error: "Code is used" });
        }

        const result = await productModel.create(productToAdd);
        res.status(201).send({ status: "success", payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "error", message: "Error al agregar el producto" });

        // const newProduct = {
        //     id: generateUniqueId(),
        //     ...req.body
        // }
        // products.push(newProduct)
        // writeFile()
        // res.json({ message: "Producto agregado correctamente." })
    }
})

// function generateUniqueId() {
//     let newID = parseInt(Date.now().toString())
//     return newID
// }

router.put("/:pcode", async (req, res) => {
    const pcode = parseInt(req.params.pcode)
    const productToReplace = req.body
    let productToModifiedCode = req.body.code
    let products = await productModel.find()
    const product = products.find((product) => product.code === pcode)
    let productCode = products.find((product) => product.code === productToModifiedCode)

    if (!productToReplace.title || !productToReplace.description || !productToReplace.code || !productToReplace.price || !productToReplace.status || !productToReplace.stock || !productToReplace.category) {
        res.send({ status: "error", error: "Missing body params" })
    } else if (productCode && product.code !== productToReplace.code) {
        res.send({ status: "error", error: "Code is used" })
    } else if (!product) {
        return res.status(404).json({ error: "Producto no encontrado." })
    } else {
        try {
            let result = await productModel.updateOne({ code: pcode }, productToReplace)
            res.send({ result: "success", payload: { product: result } })
        } catch (error) {
            console.error(error)
            res.status(500).send({ result: "error", message: "Error al actualizar el producto" })
        }
    }

    // Object.assign(product, updateFields)

    // writeFile()

    // return res.json(product)
})

router.delete("/:pcode", async (req, res) => {
    const pcode = parseInt(req.params.pcode)

    try {
        let result = await productModel.deleteOne({ code: pcode })
        res.send({ result: "success", payload: result })
    } catch (error) {
        console.error(error)
        res.status(500).send({ result: "error", message: "Error al eliminar el producto" })
    }

    // const productIndex= products.findIndex((product) => product.id === pid)

    // if (productIndex === -1) {
    //     return res.status(404).json({ error: "Producto no encontrado."})
    // }

    // const deletedProduct = products.splice(productIndex, 1)

    // writeFile()

    // return res.json(deletedProduct[0])
})

module.exports = router