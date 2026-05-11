import Product from '../models/Product.js';
import express from 'express';
const router=express.Router();
router.get('/all',async(req,res)=>
{
    try{
        const products=await Product.find();
        res.status(200).json(products);

    }
    catch(err)
    
    {
        res.status(500).json(err);
    }
});

router.get('/search',async(req,res)=>
{
    try{
        const keyword=req.query.keyword;
        const products=await Product.find({
            name:{$regex:keyword,$options:"i"}
        });
        res.status(200).json(products);

    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

router.get('/category/:category',async(req,res)=>
{
    try{
        const products=await Product.find({
            category:req.params.category
        });
        res.status(200).json(products);

    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

router.get('/:id',async(req,res)=>
{
    try{const product=await Product.findById(req.params.id);
        res.status(200).json(product);

    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

export default router;