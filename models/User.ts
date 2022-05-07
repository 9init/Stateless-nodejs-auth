import {Schema, Model, model, Document} from "mongoose"

interface iUser extends Document{
    name: string
    email: string
    password: string
}

const UserSchema = new Schema<iUser>({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
})

const User: Model<iUser> = model<iUser>('User', UserSchema)

export{
    User,
    iUser
}