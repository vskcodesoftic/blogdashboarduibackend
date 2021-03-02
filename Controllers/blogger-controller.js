const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator')
const  Blog = require('../Models/blogSchema')
const  User = require('../Models/UserSchema')


const HttpError = require('../Models/http-error');
const { post } = require('../Routes/adminPage-routes')

let ObjectID = require('mongoose').Types.ObjectId


//blogger login 
const  bloggerLogin = async(req, res, next) => {
    const { email,password } = req.body;

    let existingUser
    try{
         existingUser = await User.findOne({ email : email , role : 'blogger' })
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
    message : 'blogger logged in successful' , 
    userId : existingUser.id,
    email : existingUser.email , 
    role : existingUser.role ,
    token: token})



}

//creating BlogPost
const createBlogPost = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        const error =  new HttpError("invalid input are passed,please pass valid data",422)
        return next(error)
    }
    const { title,desc,image,alt,slug,tags, creatoremail,creatorid, role,status ,category} = req.body;
   
    // let existingUser
    // try{
    //      existingUser = await User.findOne({ email : creatoremail , role : 'blogger' })
    // }
    // catch(err){
    //     const error = await new HttpError("something went wrong,logging in failed",500)
    //     return next(error)
    // }

    // if(!existingUser){
    //     const error = new HttpError("user does not exist",404)
    //     return next(error)
    // }    
    const createdBlogPost = new Blog({
        title,
        desc,
        image,
        alt,
        slug,
        tags,
        creatoremail,
        creatorid,
        role,
        status,
        category
      
     
    })

    try {
        await createdBlogPost.save();
      } catch (err) {
        const error = new HttpError(
          'Creating post failed, please try again.',
          500
        );
        console.log(err)
        return next(error);
      }

     
    res.status(201).json({ userId : createdBlogPost.id,creatoremail : createdBlogPost.creatoremail ,creatorid :createdBlogPost.creatorid, role : createdBlogPost.role, title: createdBlogPost.title , desc :createdBlogPost.desc ,image : createdBlogPost.image , alt: createdBlogPost.alt, slug: createdBlogPost.slug , tags : createdBlogPost.tags , status : createdBlogPost.status, blogpostid : createdBlogPost.blogpostid  })
}

//get single post by id
const getPostById = async (req, res, next) => {
    const postId = req.params.pid;
  
    let post;
    try {
      post = await Blog.findById(postId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not find a post.',
        500
      );
      return next(error);
    }
  
    if (!post) {
      const error = new HttpError(
        'Could not find a post for the provided id.',
        404
      );
      return next(error);
    }
  
    res.json({ post: post.toObject({ getters: true }) });
  };


//get post by creatorid

  const getPostsByCreatorId = async (req, res, next) => {
      const cid = req.params.cid;

      let creator;
      try {
        creator = await Blog.find({ creatorid : cid});
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not find a post of creator',
          500
        );
        return next(error);
      }

      if (!creator) {
        const error = new HttpError(
          'Could not find a creator for the provided id.',
          404
        );
        return next(error);
      }

      res.json({ creator: creator.map(creator => creator.toObject({ getters: true })) });


  }

  //update post by id
  
const updatePostById = async (req, res, next) => {
    let blogspost;

    const { title,desc,image,alt,slug,tags, creatoremail,creatorid, role,status } = req.body;
    const upId = req.params.uid;
   
    try {

    blogspost = await Blog.find({ blogpostId : upId});

    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update post ;(',
        500
      );
      console.log(err)
      return next(error);
    }


  

      const updatedPost = new Blog ({
      title,
      desc,
      creatoremail
      
        })
     
    
    try {
       
     await updatedPost.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      console.log(err)
      return next(error);
    }
  
    res.status(200).json( { title: updatedPost.title , desc :updatedPost.desc});

  };

const updatebyId = (req,res,next) => {
    
        if (!ObjectID.isValid(req.params.id))
            return res.status(400).send('No record with given id : ' + req.params.id)
    
        var updatedRecord = {
            title: req.body.title,
            desc: req.body.desc
        }
    
        Blog.findByIdAndUpdate(req.params.id, { $set: updatedRecord },{new:true}, (err, docs) => {
            if (!err) res.send(docs)
            else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
        })
    
}

  //delete
  const deleteById = async (req, res, next) => {
      const did = req.params.did;
      if (!ObjectID.isValid(req.params.did))
      return res.status(400).send('No record with given id : ' + req.params.id)

  Blog.findByIdAndRemove(req.params.did, (err, docs) => {
      if (!err) res.send(docs)
      else console.log('Error while deleting a record : ' + JSON.stringify(err, undefined, 2))
  })

  };
  


exports.BloggerLogin =  bloggerLogin
exports.createBlogPost = createBlogPost
exports.getPostById = getPostById
exports.getPostsByCreatorId = getPostsByCreatorId
exports.updatePostById = updatePostById
exports.deleteById = deleteById;

exports.updatebyId = updatebyId