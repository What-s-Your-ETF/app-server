const mongoose = require('mongoose');
var express = require('express');

const boardSchema = new mongoose.Schema({
    title : {type : String, require : true},
    content : {type : String, require : true},
    nickname : {type : String, require : true},
    createdAt : {type : Date, default : Date.now},
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;