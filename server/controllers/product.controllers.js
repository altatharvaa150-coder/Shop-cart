import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body

        if (!name || !description || !price || !category || !image || stock === undefined) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const newProduct = await Product.create({ name, description, price, category, image, stock })// ye schema ma insert karne keliye

        res.status(201).json({ success: true, message: "Product created", product: newProduct })

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message })
        }
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}

// Get all products with optional search & category filter we use query and .query are of 2 types one saves on electonically and one on keyboard
export const getAllProducts = async (req, res) => {
    try {
        const {search,category}=req.query
        const query={}// query contains the fields we want to search in
        if(search){
            query.name = {$regex: search,$options:"i"}//regex is for filtering and i is for case insensitive
        }
        if(category){
            query.category = category
        }
        const products = await Product.find(query)
        res.status(200).json({ success: true, count: products.length, products })

    } catch (error) {
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}

// Get single product by ID
export const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ success: true, product })

    } catch (error) {
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ success: true, message: "Product updated", product })

    } catch (error) {
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ success: true, message: "Product deleted" })

    } catch (error) {
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}
