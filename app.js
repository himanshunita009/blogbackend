require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');






/*My Own Require Module */
require("./Database/databseInitilization");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {auth} = require('./authenticationCheck');
const request = require('request');
const adminEmail = 'himanshucse.stud@nita.ac.in';
const ObjectId = require('mongodb');
/*End -------------- */


var app = express();

/*Schemas */
const {User_Reg,Blog_Approved, Blog_Pending, Blog_Rejected} = require("./Database/schemas");
 // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
/*Mongoose Database */



/*Check for Auth  */
app.get('/checkAuth',auth,async (req,res) => {
  const user = await User_Reg.findOne({_id: req.userId}).select({_id: 0,tokens: 0,password: 0});  
  //res.setHeader('Access-Control-Allow-Credentials','true');
  res.status(200).json({
    status: true,
    isAdmin: user.email === 'himanshucse.stud@nita.ac.in'? true:false,
    user: user
  });
});

/*User Registration  */
app.post('/register',async (req,res) => {
  try{
      const data = req.body;
      if(data.password === data.cpassword){
        const user = new User_Reg({
          name: data.name,
          occupation: data.occupation,
          age: data.age,
          email: data.email,
          password: data.password
        });
        await user.save();
        res.json({
          status: true,
          message: "Registration Successfully ! Now Login !"
        });
      }
      else {
        console.log('err');
        res.json({
          status: false,
          message: "Password & Confirm Password Not Matching !"
        });
      }
  }catch(err){
    res.json({
        status: false,
        message: "Enter Valid Details !",
        error: err
    });
  }
});


/*User Login */
app.post("/login",async (req,res) => {
  const data = req.body;
  const user = await User_Reg.findOne({email: data.email}).select({email: 1,password: 1,tokens: 1});
  if(!user){
    res.json({
      status: false,
      message: "No User Found Kindely Register First !"
    });
  }else {
    const isValid = await bcrypt.compare(data.password,user.password);
    if(!isValid){
      res.json({
        status: false,
        message: "Invalid Details !"
      });
    }else {
      const token = await user.generateToken();
      console.log(token);
      res.cookie('jwt',token).status(201).json({
        status: true,
        isAdmin: user.email === 'himanshucse.stud@nita.ac.in'? true:false
      });
    }
  }
});
/*Get User Data*/




/*Add Blogs Data */
app.post('/addBlogsData',auth,async (req,res) => {
  const data = req.body;
  const user = await User_Reg.findOne({_id: req.userId});

  const docs = new Blog_Pending({
    title: data.title,
    subject: data.subject,
    contents: data.contents,
    authorDetails: {
      name: user.name,
      email: user.email
    },
    reason: "Submitted to approval authority pending for approval !"
  });
  docs.save().then((result) => {
    user.docs.push(result._id);
    user.contribution.pending = user.contribution.pending+1; 
    user.save().then(()=> {
      res.json({
        status: "True"
      });
    }).catch((err) => {
      res.json(err);
    });
  }).catch((err) => {
    res.json(err);
  });
});


/*Get Home Page data*/
app.get('/homePageData',(req,res) => {
  Blog_Approved
    .find()
    .select({contents: 0})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({
        error: err        
      });
    });
});

app.get('/getBlogList', async (req,res,next) => {
  const qry = req.query;
  let BlogCategory;
  
  switch(qry.listNo){
    case '1':
      BlogCategory = Blog_Approved;
      break;
    case '2':
      BlogCategory = Blog_Pending;
      break;
    case '3':
      BlogCategory = Blog_Rejected;
      break;
  }
  if(qry.user != 'null'){
    app.use(auth);
    if(qry.user !== adminEmail){
      User_Reg.find({_id: req.userId}).select({email: qry.user})
        .then(() => {
          BlogCategory
            .find({"authorDetails.email" : qry.user})
            .then((blogList) =>{
                res.json({
                  status: true,
                  body: blogList
                });
            }).catch(() => {
              res.json({
                status: false,
                errMgs: "Error while fetching data"
              });
            });  
        }).catch(()=> {
          res.json({
            status: false,
            errMgs: "User is not logged in"
          });
        });
    }
    else {
      User_Reg.find({email: qry.user})
        .then(() => {
          BlogCategory
            .find({"authorDetails.email" : qry.user})
            .then((blogList) =>{
                res.json({
                  status: true,
                  body: blogList
                });
            }).catch(() => {
              res.json({
                status: false,
                errMgs: "Error while fetching data"
              });
            });  
        }).catch(()=> {
          res.json({
            status: false,
            errMgs: "User is not logged in"
          });
        });
    }
  }else {
    BlogCategory
      .find()
      .select({contents: 0})
      .then((blogList) => {
        res.json({
          status: true,
          body: blogList
        });
      }).catch(() => {
        res.json({
          status: false,
          errMgs: "Error while fetching data"
        });
      });
  }
});

app.get('/blog',(req,res) => {
  const qry = req.query;
  let BlogCategory;
  
  switch(qry.listNo){
    case '1':
      BlogCategory = Blog_Approved;
      break;
    case '2':
      BlogCategory = Blog_Pending;
      break;
    case '3':
      BlogCategory = Blog_Rejected;
      break;
  }
  BlogCategory
    .findOne({_id: qry.id})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({
        error: err        
      });
    });
}); 
/*Admin  */

app.get('/getUsers',auth,async (req,res) => {
  const admin = await User_Reg.findOne({_id: req.userId}).select({email: 1});
  if(admin.email === adminEmail){
    User_Reg
      .find({email: {$ne: adminEmail}})
      .select({name: 1,email: 1,contribution: 1})
      .then((data) => {
        res.status(200).json({
          status: true,
          users: data
        });
      })
      .catch(() => {
        res.json({  
          status: false,
          message: "Error in fetching user records"
        });
      });
    }else {
      res.json({  
        status: false,
        message: "You are not authorised"
      });
    }
});


/*Blog Manipulation */
app.get('/moveBlog',auth,async (req,res) => {
  const reqType = req.query.reqType;
  const listNo = req.query.listNo;
  const userId = req.userId;
  const docId = req.query.docId;
  let sourceBlogCategory;
  const applicant = await User_Reg.findOne({_id: userId}).select({email: 1});
  switch(listNo){
    case '1':
      sourceBlogCategory = Blog_Approved;
      break;
    case '2':
      sourceBlogCategory = Blog_Pending;
      break;
    case '3':
      sourceBlogCategory = Blog_Rejected;
      break;
  }
  
  if(reqType === '1' || reqType === '2'){
    if(applicant.email === adminEmail){
      sourceBlogCategory.findOne({_id: docId}).select({reason: 0}).then(async (data) => {
        if(reqType === '1'){
          const approvedDoc = new Blog_Approved({
            _id: data._id,
            title: data.title,
            subject: data.subject,
            contents: data.contents,
            authorDetails: data.authorDetails
          });
          await approvedDoc.save();
          const user = await User_Reg.findOne({email: data.authorDetails.email}).select({contribution: 1});
          if(listNo === '2'){
            user.contribution.pending = user.contribution.pending-1;
          }else if(listNo === '3'){
            user.contribution.rejected = user.contribution.rejected-1;
          }
          user.contribution.approved = user.contribution.approved+1;
          await user.save();
          res.status(200).json({
            status: true,
            msg: "approved"
          });
        }else {
          const rejectDoc = new Blog_Rejected({
            _id: data._id,
            title: data.title,
            subject: data.subject,
            contents: data.contents,
            authorDetails: data.authorDetails,
            reason: "By Admin"
          });
          await rejectDoc.save();
          const user = await User_Reg.findOne({email: data.authorDetails.email}).select({contribution: 1});
          if(listNo === '2'){
            user.contribution.pending = user.contribution.pending-1;
          }else if(listNo === '1'){
            user.contribution.approved = user.contribution.approved-1;
          }
          user.contribution.rejected = user.contribution.rejected+1;
          await user.save();
          res.status(200).json({
            status: true,
            msg: "deleted"
          });
        }
      }).catch(() => {
        res.status(200).json({
          status: false,
          msg: "invalid doc id"
        });
      });
      await sourceBlogCategory.deleteOne({_id: docId});
    }else {
      res.status(200).json({
        status: false,
        msg: "You are not admin"
      });
    }
  }
  if(reqType === '3'){
    const doc = await sourceBlogCategory.findOne({_id: docId});
    const user = await User_Reg.findOne({email: doc.authorDetails.email});
    if(applicant.email === adminEmail || (applicant.email !== adminEmail && applicant.email === doc.authorDetails.email)){
      const docs = user.docs.filter(value => value.toString() != doc._id);
      switch(listNo){
        case '1':
          user.contribution.approved = user.contribution.approved-1; 
          break;
        case '2':
          user.contribution.pending = user.contribution.pending-1;
          break;
        case '3':
          user.contribution.rejected = user.contribution.rejected-1;
          break;
      }
      sourceBlogCategory.deleteOne({_id: docId}).then(async () => {
        user.docs = docs;
        await user.save();
        res.status(200).json({
          status: true,
          msg: "document deleted"
        });
      });
    }else {
      res.status(200).json({
        status: false,
        msg: "invalid req"
      });
    }
  }
});














/* Logout Function*/
app.get('/logout',auth, async (req,res) => {
  const user = await User_Reg.findOne(({_id: req.userId})).select({tokens: 1});
  let tokens = user.tokens.filter((token) => token != req.cookies.jwt);
  user.tokens = tokens;
  await user.save();
  res.status(200).clearCookie('jwt').json({
    status: false,
    isAdmin: false
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
