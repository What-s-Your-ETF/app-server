const express = require('express');
const router = express.Router();
const newsCrawling = require('../sevices/news/naverNewsTest.js');

router.post("/getnews", async(req, res, next)=>{
    try{
        const response = await newsCrawling(req.body.keyword, req.body.day);
        res.json(response);
    }catch(err){
        console.error(err);
        res.status(400).json({message : "fail"});
    }
});


module.exports = router;