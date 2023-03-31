/*const { MongoClient } = require('mongodb');

let dbConnection ;

module.exports = {
    connectToDb: (cb)=> {
        MongoClient.connect('mongodb://127.0.0.1:27017/BlogsNIta')
        .then((client) => {
            dbConnection = client.db();
            cb();
        })
        .catch((err) => {
            console.log(err);
            cb(err);
        });
    },
    getDb: () => dbConnection
}*/




