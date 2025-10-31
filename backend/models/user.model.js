import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minlength: [6, 'Password should atleast be 6 characters long']
    }, 

    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1
            },

            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        }
    ],

    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }

}, {timestamps: true})


// Pre-save hook to hash password

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    }
    catch(e){
        next(e)
    }
})

// schema method to compare password with hashed password

userSchema.methods.comparePassword = async function(password){
    try{
        const isPasswordCorrect = await bcrypt.compare(password, this.password)
        return isPasswordCorrect
    }
    catch(error){
        console.log("Error in comparePassword schema method");
    }
}

const User = mongoose.model('User', userSchema)
export default User