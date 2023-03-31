const mongoose = require("mongoose");
const databaseURI = process.env.DATABASE;
mongoose.connect(databaseURI).then(() => {
    console.log("Database connected");
}).catch((err) =>{
    console.log(err);
}); 