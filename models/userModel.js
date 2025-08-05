import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }, 
    cartItems: {
        type: Object,
        default: {}
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    Imgurl: {
        type: String,
        required: true
    },

}, { minimize: true });

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User