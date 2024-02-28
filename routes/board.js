const express = require('express');
const router = express.Router();
const axios = require('axios');
let Board = require('../model/Board.js');

router.get('/', (req, res, next)=>{
    Board.find().then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err)
    })
});

router.get('/:id',(req,res,next)=>{
    
    Board.findById(req.params.id).then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err);
    })
});

router.post('/',(req,res,next)=>{
    
    Board.create(req.body).then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err);
    })
});

router.put('/:id',(req,res,next)=>{
    console.log(req.body)
    console.log(req.params.id)
    Board.findByIdAndUpdate(req.params.id,{ title:req.body.title, content: req.body.content, nickname:req.body.nickname})
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err);
    })
});

router.delete('/:id',(req,res,next)=>{
    Board.findByIdAndDelete(req.params.id).then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err);
    })
});


module.exports = router;