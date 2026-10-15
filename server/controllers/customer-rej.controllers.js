
import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import gentoken from "../utils/tokengenerator.js";
import mongoose from "mongoose";
import Product from "../models/product.model.js";


// ── Production-aware cookie settings ──
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


export const registerCustomer = async (req, res) => {
    try {

        const { fullName, email, password, phone } = req.body


        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fileds Required' })
        }

        if (password.length <= 6) {
            return res.status(400).json({ message: 'Password should be greater than 6 characters' })
        }

        const emailExists = await Customer.findOne({ email })

        if (emailExists) {
            return res.status(409).json({ message: 'User Already Exists' })
        }

        const salt = await bcrypt.genSalt(10)



        const hashedPassword = await bcrypt.hash(password, salt)
        // We have to talk about rounds


        const newUser = await Customer.create({
            fullName,
            email,
            phone,
            password: hashedPassword
        })
        const token = gentoken(newUser._id)

        res.cookie('token', token, cookieOptions)

        res.status(201).json({ success: true, message: 'User Registered', user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, phone: newUser.phone } })

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" })
        }
        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            })
        }
        const ispassword = await bcrypt.compare(password, customer.password)

        if (!ispassword) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = gentoken(customer._id)
        res.cookie('token', token, cookieOptions)

        res.status(200).json({ success: true, message: "Login successful", user: { id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone } })

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "SERVER CRASHED", error: error.message })
    }
}

export const getme = (req, res) => {
    const authuser = req.user
    res.status(200).json({ message: "User data", user: authuser })
}

export const addtowishlist = async (req, res) => {
    try {
        const { productId } = req.params//gets the id from the url
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        //. Check if already in wishlist (409 Conflict)
        const isalreadyinwishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isalreadyinwishlist) {
            return res.status(409).json({ message: "Product already in wishlist" });
        }
        customer.wishlist.push(productId)
        await customer.save();
        res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });




    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }

}
export const removefromwishlist = async (req, res) => {
    try {
        const { productId } = req.params//gets the id from the url
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Check if in wishlist
        const isalreadyinwishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!isalreadyinwishlist) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();
        res.status(200).json({
            success: true,
            message: "Product removed"
        });




    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message })
    }

}
export const getwishlist = async (req, res) => {

    try {
        const customer = await Customer.findById(req.user._id).populate('wishlist')// finds all the product with reference id in the wishlist

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message });
    }

}
export const addtocart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        if (!customer.cart) {
            customer.cart = [];//preventing server crash for old users who are undefined
        }

        const cartitemindex = customer.cart.findIndex((item) => item.product.toString() === productId); // if no item in index it return -1

        if (cartitemindex > -1) { // checks if the item is already in the cart
            const newQuantity = customer.cart[cartitemindex].quantity + 1; // if the item is already in the cart we add 1 to the previous quantity the cart[cartindex] help to find that specific id and +1 to increaase th enumber 
            if (newQuantity > product.stock) { // checks if the new quantity is greater than the stock
                return res.status(400).json({ message: "not enough stock" });
            }
            customer.cart[cartitemindex].quantity = newQuantity; // this step help in increasing the quantity
        } else {
            // item is NOT in the cart, so add it with quantity 1
            if (product.stock < 1) {
                return res.status(400).json({ message: "Product is out of stock" });
            }
            customer.cart.push({
                product: productId, //fetchinh the id 
                quantity: 1
            });// if the cart is empty so this help to add the first item 
        }

        await customer.save();
        await customer.populate("cart.product");// swap the id with actual project id and send to frontend to display the items in the cart
        return res.status(200).json({
            success: true,
            message: "product added to cart",
            cart: customer.cart
        });

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message });
    }//TypeError: Cannot read properties of undefined (reading 'findIndex')
     // This would crash the request with a 500 Server crashed
}
export const getcurrentusercart = async(req,res)=>{
    try{
        const customer = await Customer.findById(req.user._id).populate("cart.product")
        if(!customer){
            return res.status(404).json({message: "Customer not found"})
        }
        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart: customer.cart
        })

    }catch(error){
        res.status(500).json({ message: 'Server crashed', error: error.message });
    }
}
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        // 1. Validate quantity (must be a number and at least 1)
        if (!quantity || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a number and at least 1" });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) {  
            return res.status(404).json({ message: "Product not found" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Quantity cannot exceed available stock (${product.stock})` });
        }
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
         if (!customer.cart) {
            customer.cart = [];
        }
         const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );
        if(cartItemIndex === -1){
            return res.status(404).json({ message: "Product not found in cart" });
        }
        // update the quantity
        
        customer.cart[cartItemIndex].quantity=quantity; 
        await customer.save()
        await customer.populate("cart.product");
        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: customer.cart
        });
    }catch(error){
        res.status(500).json({ message: 'Server crashed', error: error.message });
    }    
}   
// Remove product from cart (Task 5)
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // 2. Find customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        // 3. Check if product exists in cart
        const itemExists = customer.cart.some(
            (item) => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // 4. Remove product using filter
        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );

        // 5. Save and populate
        await customer.save();
        await customer.populate("cart.product");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });

    } catch (error) {
        res.status(500).json({ message: 'Server crashed', error: error.message });
    }
};

// ── Logout (clears httpOnly cookie server-side) ──
export const logoutCustomer = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};


