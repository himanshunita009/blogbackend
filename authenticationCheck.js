const jwt = require('jsonwebtoken');
const auth = async (req,res,next) => {
    if(!req.cookies.jwt || req.cookies.jwt === 'undefined'){
        res.json({
            status: false
        });
      }
    else {
        const isValid = jwt.verify(req.cookies.jwt,process.env.SECRET_KEY);
        if(isValid){
            req.userId = isValid._id;
            next();
        }
        else {
        res.json({
            status: false
        });
      }
    }
}

const selectBlogsCategory = (req,res,next) => {
    const qry = req.query;
  let BlogCategory;
  console.log('here');
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
  req.blogCategory = BlogCategory;
  next();
}

module.exports = {
    auth,
    selectBlogsCategory
};