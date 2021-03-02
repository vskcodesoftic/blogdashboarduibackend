const express = require('express');

const router = express.Router();

const bloggerController = require('../Controllers/blogger-controller');

router.get('/:pid', bloggerController.getPostById);

router.get('/c/:cid', bloggerController.getPostsByCreatorId);


router.get('/', (req, res, next) => {
 
  res.json({message: 'blogger routes'});
});

//Blogger Login Route
router.post('/login', bloggerController.BloggerLogin);

//create blog post Route
router.post('/createPost', bloggerController.createBlogPost);

//update blog post by id
router.patch('/:uid', bloggerController.updatePostById)

//deletebyid
//update blog post by id
router.delete('/:did', bloggerController.deleteById)


//put
router.put('/:id', bloggerController.updatebyId)
module.exports = router;