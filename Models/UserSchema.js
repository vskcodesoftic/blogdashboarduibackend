const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true , unique : true},
    role :{ type: String , default: 'blogger', required : true },
    password: { type: String },
    otpHex: { type: String },
    isVerified: { type: Boolean, default: false  },
    resetToken:{ type:String },
    expireToken:{ type:Date },
    picture :{type:String},
    isBlocked :{ type:Boolean, default : false}
}, { versionKey: false });

userSchema.plugin(uniqueValidator)


module.exports = mongoose.model('User', userSchema);