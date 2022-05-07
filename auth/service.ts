import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import express from "express"
import passport from "passport"
import {Strategy as CustomStrategy} from "passport-custom"
import {User, iUser} from "../models/User"

passport.use("stateless", new CustomStrategy((req, done)=>{
    // get the email and password that being sent by the client side
    let { email, password } = req.body
    // fetch data from database
    User.findOne({email: email}, (err: mongoose.CallbackError, user: iUser)=>{
        if (err) return done(err) // return error message
        if (!user) return done({ message: "Incorrect information." }) // return custom error message

        // if the both condition doesn't executed then the user was found
        // lets validate
        bcrypt.compare(password, user.password, (err: Error, success: Boolean)=>{
            if (err) return done(err) // return error message again
            if (!success) return done({ message: "Incorrect information." }) // return custom error message again
            return done(null, user) // Correct information
        })

    })
}))

passport.serializeUser<iUser>((user: any, done: (err: any, id: any) => void)=>{
    done(null, user.id)
})

passport.deserializeUser((id: mongoose.ObjectId, done)=>{
    User.findById(id, (err: mongoose.CallbackError, user: iUser) => {
        done(err, user)
    })
})

async function registerHandler(req: express.Request, res: express.Response) {
    // you should validate them but I won't do this here
    let { name, email, password } = req.body

    // Check if email is already used
    let exist = await User.exists({ email: email })
    if (exist) return res.status(403).send("Email already used.")
    
    // generate hashed password
    let salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(password, salt)

    // create user model
    let newUser = new User({
        name: name.replace("-", " ").trim(),
        email: email,
        password: hash,
    })

    newUser.save((err) => {
        if (err) return res.status(500).send("Internal server error")
        res.send("Registered successfully.")
    })
}

function homeHandler(req: express.Request, res: express.Response) {
    if(req.isAuthenticated()) res.send("Welcome🤗")
    else res.send("You are not logged in")    
}

const loginHandler = passport.authenticate("stateless", {failureMessage: true, successRedirect: "/home"})

export {
    registerHandler,
    loginHandler,
    homeHandler
}