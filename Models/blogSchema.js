const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;

const crypto = require("crypto");

const id = crypto.randomBytes(16).toString("hex");

const blogSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String },
    image :{type:String},
    alt:{type : String },
    slug:{ type:String },
    tags:{ type:String },
    category :{ type :String},
    creatoremail: { type: String ,required: false},
    creatorid : {type : String },
    role :{ type: String , default: 'blogger', required : true },
    date: { type : Date, default: Date.now  },
    status :{ type: String , default : 'notverified'},
    blogpostId:{type :String ,default : id }
}, { versionKey: false });



module.exports = mongoose.model('Blog', blogSchema);