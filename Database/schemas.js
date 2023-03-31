const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User_Schema = mongoose.Schema({
    name : {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val))
                throw new Error("not a valid email");
        }
    },
    occupation: {
        type: String,
        minlength: 6,
        maxlength: 30,
        default: "N.A."
    },
    age : {
        type: Number,
        min: 18,
        max: 80,
        required: true
    },
    contribution: {
        approved: {
            type: Number,
            required: true,
            default: 0
        },
        rejected: {
            type: Number,
            required: true,
            default: 0
        },
        pending: {
            type: Number,
            required: true,
            default: 0
        }
    },
    docs: {
        type: Array,
        default: []
    },
    password: {
        type: String,
        required: true
    },
    tokens: {
        type: Array,
        required: true,
        default: []
    }
});


User_Schema.pre("save",async function(next) {
    if(this.isModified("password"))
        this.password = await bcrypt.hash(this.password,10);
    next();
});


User_Schema.methods.generateToken = async function() {
    try{
        const token = jwt.sign({_id: this._id},"HareKrishnaHareRama");
        this.tokens.push(token);  
        await this.save(); 
        return token;
    }catch(error){
        console.log(error);
    }
}

const User_Reg = new mongoose.model("User",User_Schema);


const Approved_Blogs_Schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 10
    },
    subject: {
        type: String,
        required: true,
        minlength: 50
    },
    contents:[]
    ,
    authorDetails: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            validate(val){
                if(!validator.isEmail(val))
                    throw new Error("Internal Emmail");
            }
        }
    }
});



const Blog_Approved = new mongoose.model("blog_approved",Approved_Blogs_Schema);

const PR_Blog_Schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 10
    },
    subject: {
        type: String,
        required: true,
        minlength: 10
    },
    contents:[]
    ,
    authorDetails: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            validate(val){
                if(!validator.isEmail(val))
                    throw new Error("Internal Emmail");
            }
        }
    },
    reason: {
        type: String,
        required: true
    }
});


const Blog_Pending = new mongoose.model("blog_pending",PR_Blog_Schema);
const Blog_Rejected = new mongoose.model("blog_rejected",PR_Blog_Schema);









module.exports = {User_Reg,Blog_Approved,Blog_Pending,Blog_Rejected};