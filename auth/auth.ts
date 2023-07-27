import * as express from "express"
import passport from "passport"

const router = express.Router()

router.use(passport.initialize())
router.use(passport.session())

/**
 * Urls that require no auth
 * List contains regex for each path to be excluded from authentication
 */
const excludedPathsRegex: Array<RegExp> = [
    /^\/login/,
    /^\/register/,
]

// This middleware make sure that the user is authenticated
function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction){
    const pathCheck = excludedPathsRegex.some(path => path.test(req.path))
    
    if(pathCheck || req.isAuthenticated()){
        next()
        return  
    }

    res.status(401).send("You are not logged in");
}

// activate the middleware
router.use(isLoggedIn)

// import handlers
import {loginHandler, registerHandler, homeHandler} from "./service"
router.post("/login", loginHandler)
router.post("/register", registerHandler)
router.get("/home", homeHandler)

export { router }

