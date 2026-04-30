import  express  from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"


const app = express()


app.use(express.static("public")) //public folder ke andar jo bhi content rehega usko backend ka server serve karna chhalu kar deta hai

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET" , "POST"]
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()



//health check route -- jinmein request karo data
//  return nhi karte but server thik se chal rraha bata dete hai..
//konsa server chal raha hai konsa kharap hai these can identify

/* app.get("/", (req,res) => {  //after public api ko abhi ke liye hatana padega
    res.status(200).json({
        message:"hello world",
        success: true 
    })
}) */

app.get('/health', (req, res) => {
    res.status(200).json({
        message:"ok",
        success: true
    })
})






httpServer.listen(3000 , () => {
    console.log("Server is running on port 3000")
})