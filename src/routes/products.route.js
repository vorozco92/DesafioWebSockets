import { Router } from "express";
import ProductManager from '../_data/ProductManager.js'

const router =Router();

const productManager =  new ProductManager('./src/_data/products.json');

router.get('/',async(req,res)=>{
    let limit = req.query.limit ?? 0;
    let products = await productManager.getProducts()
    products = JSON.parse(products);
    if (limit)
        products = products.filter( (a ,index ) =>{ if (index < limit) return a})
    res.send({products});

})

router.get('/:id',(req,res)=>{
    let pid = req.params.id;

    productManager.getProducts().
        then(resultado => { 
            let products = JSON.parse(resultado);
            let product = products.find(a => a.id == pid)
            res.send({product});
         })
        .catch(error => { 
            res.send({status:'error', msg: error});
        });
})

router.post('/', async(req, res)=>{
    let product = req.body;
    let id = await productManager.addProduct(product);
    if(id){
        product.id = id;
        product = productManager.sortProduct(product)
        req.app.io.sockets.emit('update_data', {id: id,product:product})
        res.send({status:"success", message :"Producto agregado correctamente"});
    }
    else
        res.status(400).send({status:"error", error_description: "No fue posible agregar el producto"});
})

router.put('/:pid', (req, res)=>{
    let product = req.body;
    let pid = req.params.pid;
    product.id = pid.toString();
            
    if (productManager.editProduct(product))
        res.send({status:"success", message :"Producto editado correctamente"});
    else
        res.status(400).send({status:"error", error_description: "No fue posible editar el producto"});
    
})

router.delete('/:pid', (req, res)=>{
    let pid = req.params.pid;
    if(productManager.deleteProductById(pid)){
        req.app.io.sockets.emit('delete_product', pid)
        res.send({status:"success", message :"Producto eliminado correctamente"});
    }
    else
        res.send({status:"error", message :"No fue posible eliminar el producto"});
});
export default router;