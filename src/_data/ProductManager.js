import fs from "fs";

class ProductManager {
    
    constructor(path) {
        this.path = path;
        this.products = [];
        this.carts = [];
    }
    
    addProduct=async(product)=>{
        return this.actionProduct(product);
    }

    editProduct=async(product)=>{
        return this.actionProduct(product, true);
    }

    actionProduct=async( product, edit = false)=>{

        let pIndex = 0;
        let id_p = 1;
        let return_id = 0;
        if (! product.title || product.title === '' ||
        ! product.description || product.description === '' ||
        ! product.code || product.code === '' ||
        ! product.price || product.price === '' ||
        ! product.stock || product.stock === '' ||
        ! product.category || product.category === '' || (edit && ! product.id)){
            console.log('Información incompleta');
            return false;
        }

        //convert to correct data
        product.price = parseFloat(product.price);
        product.stock = parseInt(product.stock);

        if (undefined === product.status || product.status === '')
            product.status = true; 
    
        if (! fs.existsSync(`${this.path}`)){

            if (! edit)
                product = {...{id: id_p},...product};            

            let product_list = []
            product_list.push(product);
            let result = JSON.stringify(product_list, null,'\t');
            //console.log(result);
            fs.writeFile(`${this.path}`, result, 'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')});
        }
        else{
            let resultado =  await fs.promises.readFile(`${this.path}`,'utf-8', (error,resultado)=>{
                if (error){  console.log('Error al leer el archivo'); return false;}  
            });

            let product_list = JSON.parse(resultado);
            if (edit){
                pIndex  = product_list.findIndex(prod =>prod.id.toString() === product.id);
                if (pIndex === -1){
                    console.log('No existe para su edición');
                    return false;
                }
                product = this.sortProduct(product)
                product_list[pIndex] = product;
                return_id = product.id;
            }
            else{
                let endProd = product_list.findLast(prod => prod.id > 0);
                if (endProd)
                    pIndex = endProd.id
                let product_new = {...{id: (pIndex+1)},...product}
                product_new = this.sortProduct(product_new)
                product_list.push(product_new);
                return_id = product_new.id;
            }

            fs.writeFile(`${this.path}`, JSON.stringify(product_list),'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')}); 
            return return_id;
        }
        return return_id;
    }

    getProducts=async()=>{ 
        let list = await this.readList();  
        return list;   
    }

    getProductsCart=async()=>{ 
        let list = await this.readList();  
        return list;   
    }

    readList=async()=>{
        
        if (! fs.existsSync(`${this.path}`)){
            console.log(' No existe archivo en el path:' + process.cwd()+this.path);
            return '[{}]';
        }
        
        return fs.readFileSync(`${this.path}`,'utf-8', (error,resultado)=>{
            console.log('Leyendo archivo');
            if (error) return console.log('Error al leer el archivo');
            return JSON.parse(resultado);   
        });      
    }

    getProductById=(id)=>{
        let data = fs.readFileSync(`${this.path}`,'utf-8');
        if (! data)
            return {}
        let product_list = JSON.parse(data);
        let pIndex  = product_list.findIndex(prod => prod.id === id);
        if (pIndex === -1){
            console.log('Producto no existe en listado');
            return
        }
        return product_list[pIndex];
    }

    deleteProductById=(id)=>{
        let data = fs.readFileSync(`${this.path}`,'utf-8');
        if (! data)
            return false;
        let product_list = JSON.parse(data);
        let pIndex  = product_list.findIndex(prod => prod.id.toString() === id);
        if (pIndex === -1){
            console.log('Producto no existe en listado');
            return false;
        }

        product_list.splice(pIndex, 1)
        fs.writeFileSync(`${this.path}`, JSON.stringify(product_list),'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')}); 
        return true;
    }

    addCart=(products)=>{
        return this.actionCart(0, products);
    }

    editCart=(cart_id, products)=>{
        return this.actionCart(cart_id, products, true);
    }

    actionCart=( cart_id, products_c = [], edit = false)=>{
        let pIndex = 0;
        if (! fs.existsSync(`${this.path}`)){
            let cart = {id: 1, products: products_c};            
            let cart_list = []
            cart_list.push(cart);
            let result = JSON.stringify(cart_list, null,'\t');
            fs.writeFile(`${this.path}`, result, 'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')});
            return true;
        }
        else{
            fs.readFile(`${this.path}`,'utf-8', (error,resultado)=>{
                if (error){  console.log('Error al leer el archivo'); return false;}
                let cart_list = JSON.parse(resultado);
                if (edit){
                    pIndex  = cart_list.findIndex(cart =>cart.id.toString() === cart_id);
                    if (pIndex === -1){
                        console.log('No existe para su edición');
                        return false;
                    }
                    cart_list[pIndex] = {id: cart_id, products: products_c};
                }
                else{
                    let endCart = cart_list.findLast(cart => cart.id > 0);
                    let c_new = {id: (endCart.id+1), products: products_c}
                    cart_list.push(c_new);
                }
 
                fs.writeFile(`${this.path}`, JSON.stringify(cart_list),'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')}); 
                return true;
            });
        }
  
        return true;
    }

    updateCartProducts=async(cid, pid, products)=>{
        if (! fs.existsSync(`${this.path}`))
            return false;
        let cart_list = await this.readList();
        cart_list = JSON.parse(cart_list);
        console.log(cart_list);
        let cIndex  = cart_list.findIndex(cart => cart.id.toString() === cid);
        if (cIndex === -1){
            console.log('Carrito no existe');
            return false;
        }
        let cart = cart_list[cIndex];
        //if (!cart.products.length)
          //  return false;
        
        let pIndex = cart.products.findIndex(cartP => cartP.id.toString() === pid);
        if (pIndex !== -1){
            cart_list[cIndex].products[pIndex].quantity = products.quantity + cart_list[cIndex].products[pIndex].quantity;
        }
        else    
            cart_list[cIndex].products.push(products);
           
        fs.writeFile(`${this.path}`, JSON.stringify(cart_list),'utf-8',(error,resultado)=>{ if (error) console.log('No fue posible crear el archivo.')}); 
        return true;
    }

    sortProduct=(product)=>{
        let newProduct = {id: product.id, title: product.title, description:product.description, code: product.code, price: product.price, status: product.status, stock : product.stock, category: product.category, thumbnails:  product.thumbnails ?? []}
        console.log(newProduct);
        return newProduct;
    }

}

export default ProductManager;