import mongoose from "mongoose";

export const  connectDB = async () =>{

    await mongoose.connect('mongodb+srv://shivamkumar27052003:4AGGTRQ3z5O9CL0t@cluster0.iqzpt.mongodb.net/QuickbiteDatabase').then(()=>console.log("DB Connected"));
}


// add your mongoDB connection string above.
// Do not use '@' symbol in your databse user's password else it will show an error.