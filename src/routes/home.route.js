import { Router } from "express";
import ProductManager from '../_data/ProductManager.js'

const router =Router();
const productManager =  new ProductManager('./src/_data/products.json');

router.get('/',async(req,res)=>{
    let listProducts = await productManager.getProducts()
    listProducts = JSON.parse(listProducts);
    res.render('home',{listProducts:listProducts})
})



export default router;