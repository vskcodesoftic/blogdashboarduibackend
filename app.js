require("dotenv").config()

const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const HttpError = require('./models/http-error')

const hompePageRoutes = require('./Routes/homePage-routes');
const bloggerPageRoutes = require('./Routes/bloggerPage-routes');
const adminPageRoutes = require('./Routes/adminPage-routes');

const port = 5000

const app = express();

app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });

app.use(hompePageRoutes);
app.use('/api/blogger',bloggerPageRoutes);
app.use('/api/admin',adminPageRoutes);

app.use((req, res, next)=>{
    const error = new HttpError('could not found this Route', 404);
    throw error;
})



// error model middleware
app.use((error, req, res, next) => {

    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
  });



  mongoose.connect(process.env.MONGO_PROD_URI,{  useNewUrlParser: true ,  useFindAndModify: false ,useUnifiedTopology: true  })
  .then(() => {
    console.log("server is live");
    app.listen(process.env.PORT || 5000, function(){
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });;
  
  })
  .catch(err => {
    console.log(err);
  });