import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import express from "express"
import passport from "passport"
import {Strategy as CustomStrategy} from "passport-custom"
import {User, iUser} from "../models/User"


const users: iUser[] = [];

passport.use("stateless", new CustomStrategy((req, done) => {
    // get the email and password that being sent by the client side
    let { email, password } = req.body

    const user = users.find(user => user.email == email);

    if (!user) {
        return done(null, { message: "Incorrect information." }); // Return false to indicate authentication failure and provide custom error message
    }

    bcrypt.compare(password, user.password, (err: Error, success: Boolean) => {
        if (err) {
            return done(err);
        }
        if (!success) {
            return done(null, { message: "Incorrect information." }); // Return false to indicate authentication failure and provide custom error message
        }
        return done(null, user); // Correct information
    });

}));

passport.serializeUser<iUser>((user: any, done: (err: any, id: any) => void)=>{
    done(null, user.id)
})

passport.serializeUser<iUser>((user: Express.User, done: (err: any, id: any) => void) => {
    // Use the user's id property as the serialized identifier for the session
    done(null, user);
});


passport.deserializeUser((id: string, done) => {
    const user = users.find(user => user.id === id);
    if (!user) {
        return done(new Error("User not found")); // Return an error if user not found
    }
    done(null, user);
});

async function registerHandler(req: express.Request, res: express.Response) {
    // you should validate them but I won't do this here
    let { name, email, password } = req.body

    // Check if email is already used
    let exist = users.find(user => user.email == email)
    if (exist) return res.status(403).send("Email already used.")
    
    // generate hashed password
    let salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(password, salt)


    // create user model
    let newUser = new User({
        id: new Object(),
        name: name.replace("-", " ").trim(),
        email: email,
        password: hash,
    })

    users.push(newUser)
    res.send(newUser)
}

function homeHandler(req: express.Request, res: express.Response) {
    if(req.isAuthenticated()) {
        res.send(req.user)
    }
    else res.send("You are not logged in")    
}

const loginHandler = passport.authenticate("stateless", {failureMessage: true, successRedirect: "/home"})

export {
    registerHandler,
    loginHandler,
    homeHandler
}