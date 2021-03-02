
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

let ObjectID = require('mongoose').Types.ObjectId

const { validationResult } = require('express-validator')
const  User = require('../Models/UserSchema')
const Blog = require('../Models/blogSchema')

const HttpError = require('../Models/http-error');


// getting users list
const getAdminsList = async (req, res, next) => {
    let users
    try{
        users = await User.find({ role : 'admin' },'-password')
    }
    catch(err){
        const error = new HttpError("can not fetch users complete request",500)
        return next(error)
    }
    res.json({ users : users.map( user => user.toObject({ getters : true}))})
    
}


//creating users
const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        const error =  new HttpError("invalid input are passed,please pass valid data",422)
        return next(error)
    }
    const { name, email,role, password } = req.body;
   
     
    let existingUser
    try{
         existingUser = await User.findOne({ email : email })
    }
    catch(err){
        const error = await new HttpError("something went wrong,creating a user failed",500)
        return next(error)
    }
    if(existingUser){
        const error = new HttpError("user already exists",422)
        return next(error)
    }
  
    
    let hashedPassword;
  
   try{
    hashedPassword = await bcrypt.hash(password, 12)
   } 
   catch(err){
       const error = new HttpError("cold not create user",500);
       return next(error)
   }


    const createdUser = new User({
        name,
        email,
        role,
        password: hashedPassword,
     
    })

    try {
        await createdUser.save();
      } catch (err) {
        const error = new HttpError(
          'Creating user failed, please try again.',
          500
        );
        return next(error);
      }

      let token;
      try{
        token = await jwt.sign({
            userId : createdUser.id,
            email : createdUser.email,
            role: createUser.role },
            process.env.JWT_KEY,
            {expiresIn :'1h'}
            )

      }
     catch (err) {
        const error = new HttpError(
          'CreatingUser failed, please try again.',
          500
        );
        return next(error);
      }
    
     
    res.status(201).json({ userId : createdUser.id,email : createdUser.email ,role : createdUser.role, token: token})
}


//creating Admin
const createAdmin = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        const error =  new HttpError("invalid input are passed,please pass valid data",422)
        return next(error)
    }
    const { name, email,role, password } = req.body;
   
     
    let existingUser
    try{
         existingUser = await User.findOne({ email : email })
    }
    catch(err){
        const error = await new HttpError("something went wrong,creating a user failed",500)
        return next(error)
    }
    if(existingUser){
        const error = new HttpError("admin already exists",422)
        return next(error)
    }
  
    
    let hashedPassword;
  
   try{
    hashedPassword = await bcrypt.hash(password, 12)
   } 
   catch(err){
       const error = new HttpError("cold not create user",500);
       return next(error)
   }


    const createdAdmin = new User({
        name,
        email,
        role,
        password: hashedPassword,
     
    })

    try {
        await createdAdmin.save();
      } catch (err) {
        const error = new HttpError(
          'Creating admin failed, please try again.',
          500
        );
        return next(error);
      }

      let token;
      try{
        token = await jwt.sign({
            userId : createdAdmin.id,
            email : createdAdmin.email,
            role: createdAdmin.role },
            process.env.JWT_KEY,
            {expiresIn :'1h'}
            )

      }
     catch (err) {
        const error = new HttpError(
          'CreatingAdmin failed, please try again.',
          500
        );
        return next(error);
      }
    
     
    res.status(201).json({ userId : createdAdmin.id,email : createdAdmin.email ,role : createdAdmin.role, token: token})
}


//admin login 
const  adminLogin = async(req, res, next) => {
    const { email,password } = req.body;

    let existingUser
    try{
         existingUser = await User.findOne({ email : email , role : 'admin' })
    }
    catch(err){
        const error = await new HttpError("something went wrong,logging in failed",500)
        return next(error)
    }

    if(!existingUser){
        const error = new HttpError("invalid credentials could not log in",401)
        return next(error)
    }
  
   let isValidPassword = false; 
   try{
         isValidPassword = await bcrypt.compare(password, existingUser.password)
   }
   catch(err){
    const error = await new HttpError("invalid credentials try again",500)
    return next(error)
}

if(!isValidPassword){
    const error = new HttpError("invalid credentials could not log in",401)
    return next(error)
}

let token;
try{
  token = await jwt.sign({
      userId : existingUser.id,
      email : existingUser.email ,
      role : existingUser.role},
      process.env.JWT_KEY,
      {expiresIn :'1h'}
      )

}
catch (err) {
  const error = new HttpError(
    'LogIn failed, please try again.',
    500
  );
  return next(error);
} 

res.json({ 
    message : 'admin logged in successful' , 
    userId : existingUser.id,
    email : existingUser.email , 
    role : existingUser.role ,
    token: token})



}

//admin approval for post based on postid
const approvePostById = async(req ,res ,next) => {
 const postId = req.params.pid;
 
//   if (!ObjectID.isValid(postId))
//   return res.status(400).send('No record with given id : ' + postId)

// let updatedRecord = {
//   status: req.body.status
// }

// Blog.findByIdAndUpdate(postId, { $set: updatedRecord },{new:true}, (err, docs) => {
//   if (!err) res.send(docs)
//   else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
// })
 
let existingUser
try{
     existingUser = await Blog.findOne({ blogpostId : postId })
     console.log(existingUser)
}
catch(err){
    const error = await new HttpError("something went wrong,creating a record failed",500)
    return next(error)
}

if(!existingUser){
  const error = new HttpError("record does not exist",404)
  return next(error)
}


let updatedRecord = {
  status: req.body.status
}

await Blog.findByIdAndUpdate(existingUser, { $set: updatedRecord },{new:true}, (err, docs) => {
  if (!err) res.send(docs)
  else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
})


 }

//admin update complete post based on postid
const editCompletePostbyID = async(req,res,next) => {
  const postId = req.params.postid;

  let existingPost
  try{
       existingPost = await Blog.findOne({ blogpostId : postId })
       console.log(existingUser)
  }
  catch(err){
      const error = await new HttpError("something went wrong,creating a record failed",500)
      return next(error)
  }
  
  if(!existingPost){
    const error = new HttpError("record does not exist",404)
    return next(error)
  }
  
  
  let updatedRecord = {
    status: req.body.status,
    title : req.body.title,
    desc : req.body.desc,
    image : req.body.image,
    alt : req.body.alt,
    slug :req.body.slug,
    tags:req.body.tags
  }
  
  await Blog.findByIdAndUpdate(existingPost, { $set: updatedRecord },{new:true}, (err, docs) => {
    if (!err) res.send(docs)
    else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
  })
  
  
}


  //delete POST BY ID
  const deletepostById = async (req, res, next) => {
    const postId = req.params.pid;

    let existingPost
    try{
         existingPost = await Blog.findOne({ blogpostId : postId })
         
    }
    catch(err){
        const error = await new HttpError("something went wrong,deleteing a record failed",500)
        return next(error)
    }
    
    if(!existingPost){
      const error = new HttpError("record does not exist",404)
      return next(error)
    }
    
    Blog.findByIdAndRemove(existingPost, (err, docs) => {
      if (!err) res.send(docs)
      else console.log('Error while deleting a record : ' + JSON.stringify(err, undefined, 2))
  })

};


// block user
const blockUser = async (req,res, next)=> {
  const { creatoremail } = req.body;
//checking emailexists or not
  let existingUser
  try{
       existingUser = await User.findOne({ email : creatoremail , role : 'blogger' })
    }
  catch(err){
      const error = await new HttpError("something went wrong,logging in failed",500)
      return next(error)
  }

  if(!existingUser){
      const error = new HttpError("not found",401)
      return next(error)
  }

  try{
    await User.updateOne(existingUser, { isBlocked: true });
    return res.send({ code: 200,message : "access granted" });
  }
  catch(err){
    console.log(err)
  }
}


// unblock user
const unblockUser = async (req,res, next)=> {
  const { creatoremail } = req.body;
//checking emailexists or not
  let existingUser
  try{
       existingUser = await User.findOne({ email : creatoremail , role : 'blogger' })
    }
  catch(err){
      const error = await new HttpError("something went wrong,logging in failed",500)
      return next(error)
  }

  if(!existingUser){
      const error = new HttpError("not found",401)
      return next(error)
  }

  try{
    await User.updateOne(existingUser, { isBlocked: false });
    return res.send({ code: 200,message : "access blocked" });
  }
  catch(err){
    console.log(err)
  }
}

//get list of posts by category
const getListofPosts = async(req, res, next) =>{
 const { type } = req.body
  let posts
  try{
      posts = await Blog.find({ category : type })
  }
  catch(err){
      const error = new HttpError("can not fetch users complete request",500)
      return next(error)
  }
  res.json({ posts : posts.map( user => user.toObject({ getters : true}))})
  


}

exports.createUser =    createUser;
exports.getAdminsList = getAdminsList;
exports.adminLogin = adminLogin;
exports.createAdmin = createAdmin;
exports.approvePostById = approvePostById;
exports.editCompletePostbyID = editCompletePostbyID;
exports.deletepostById = deletepostById;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.getListofPosts = getListofPosts;

