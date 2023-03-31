const mongoose = require("mongoose");
const databaseURI = "mongodb+srv://himanshunita009:seth123@cluster0.6etnfiw.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(databaseURI).then(() => {
    console.log("Database connected");
}).catch((err) =>{
    console.log(err);
}); 