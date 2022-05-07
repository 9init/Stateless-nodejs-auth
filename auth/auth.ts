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

function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction){
    const pathCheck = excludedPathsRegex.some(path => path.test(req.path))
    pathCheck || req.isAuthenticated() ? next() : res.redirect("/login")
}

// import handlers
import {loginHandler, registerHandler, homeHandler} from "./service"
router.post("/login", loginHandler)
router.post("/register", registerHandler)
router.get("/home", homeHandler)

export { router }

