import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MONGODB')
    }
    catch(e){
        console.log('Error on MONGODB connection');
        process.exit(1)
    }
    
}