import dotenv from "dotenv"
import mongoose from "mongoose"
import express from "express"
import bodyParser from "body-parser"
import session from "express-session"

dotenv.config()
const database: string = process.env.DB_HOST!
const host: string = process.env.HOST!
const port: number = Number(process.env.PORT!)

// Connect to database
mongoose.connect(database)

// setting up express app
const app = express()

// Required Middleware
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({
    secret: "8462e9228075d59280f62a713152892de3caa6e939e765a8a012da6d723a91d2", // random generated number
    resave: false,
    saveUninitialized: true
}))

// get all routs which we already defined it
import {router as authRouts} from './auth/auth'

app.use(authRouts)
app.listen(port, host, () => console.log(`Listening on port ${port}`))