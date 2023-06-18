import express from 'express'
import productRouter from './routes/products.route.js'
import cartRouter from './routes/carts.route.js'
import realTimeRouter from './routes/realtime.route.js'
import homeRouter from './routes/home.route.js'
import handlebars from "express-handlebars"
import __dirname from "./utils.js"
import { Server } from 'socket.io'



const app = new express();
const httpserver = app.listen(8080, () => console.log("Server up!"))
const socketServer = new Server(httpserver)
app.io = socketServer;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'))
app.use('/realtimeproducts',realTimeRouter);
app.use('/api/carts',cartRouter);
app.use('/api/products',productRouter)
app.use('/home', homeRouter);

socketServer.on('connection', socket => {
    console.log("Nuevo cliente")
    socket.on('message', data => {
        console.log(data)
    })
    socket.emit('evento_para_socket', 'mensaje para que lo reciba el socket')
})

