const express = require('express');
const { check } = require('express-validator')

const HttpError = require('../models/http-error')
const router = express.Router();

const adminController = require('../Controllers/admin-controller')

router.get('/', (req, res, next) => {
  res.json({message: 'adminpage routes'});
});

//for creating a new Admin
router.post('/createAdmin',
[ check('name').not().isEmpty(),
  check('email').isEmail(),
  check('role').not().isEmpty(),
  check('password').isLength({ min : 6})
],adminController.createAdmin);

//Admin Login Route
router.post('/login', adminController.adminLogin)

//for creating a new Admin
router.post('/createUser',
[ check('name').not().isEmpty(),
  check('email').isEmail(),
  check('role').not().isEmpty(),
  check('password').isLength({ min : 6})
],adminController.createUser);

//apporvepostbyid
router.put('/:pid', adminController.approvePostById);

//edit complete post by post id
router.put('/post/:postid', adminController.editCompletePostbyID)

//delete post by posstid
router.delete('/post/:pid', adminController.deletepostById)

// user access mangement block
router.post('/blockuser',adminController.blockUser)

// user access mangement unblock
router.post('/unblockuser',adminController.unblockUser)

//get list of posts by category
router.post('/getposts',adminController.getListofPosts);

module.exports = router;