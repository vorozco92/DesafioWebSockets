import { Router } from "express";
import ProductManager from '../_data/ProductManager.js'

const router =Router();

const productManager =  new ProductManager('./src/_data/carrito.json');

router.post('/', (req, res)=>{
    let products = req.body;
    if(productManager.addCart(products))
        res.send({status:"success", message :"Carrito agregado correctamente"});
    else
        res.status(400).send({status:"error", error_description: "No fue posible agregar el carrito"});
})

router.get('/:cid', (req, res)=>{
    let cid = req.params.cid;
    productManager.getProductsCart().
        then(resultado => { 
            let carts = JSON.parse(resultado);
            let c = carts.find(a => a.id == cid)
            if (c)
                res.send({products:c.products});
            else
                res.send({status:'error', msg: "No existe el carrito"});
         })
        .catch(error => { 
            res.send({status:'error', msg: error});
        });
})

router.post('/:cid/products/:pid', async(req, res)=>{
    let cid = req.params.cid;
    let pid = req.params.pid;
    let products = req.body; //id , quantity

    if ( ! cid || ! pid || ! products.id || ! products.quantity)
        res.status(400).send({status:"error", error_description: "No fue posible actualizar el carrito"});
    else{
        let result = await productManager.updateCartProducts(cid, pid, products);
        if(result)
            res.send({status:"success", message :"Carrito actualizado correctamente"});
        else
            res.status(400).send({status:"error", error_description: "No fue posible actualizar el carrito"});
    }
})


export default router;