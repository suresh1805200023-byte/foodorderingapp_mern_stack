import mongoose from 'mongoose';
const ProductSchema=new mongoose.Schema({
    name:{
        type:String, required:true
    },
    description:{
        type:String
    },
    category:{
        type:String
    },
    price:{
        type:String, required:true
    },
    discount:{
        type:Number, default:0
    },
    image:{
        type:String
    },
    available:
    {
        type:Boolean, default:true
    }
},{timestamps:true});

export default mongoose.model('Product',ProductSchema);