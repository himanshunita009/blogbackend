const mongoose = require("mongoose");
const databaseURI = "mongodb+srv://himanshunita009:test123@cluster0.alxyvhs.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(databaseURI).then(() => {
    console.log("Database connected");
}).catch((err) =>{
    console.log(err);
}); 