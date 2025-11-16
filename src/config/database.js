const mongoose = require('mongoose');

// this returns a promise, so should be inside async await
const connectDB = async () => {
    // TAKES Cluster/DBName
    await mongoose.connect(`${process.env.DB_CONNECTION_STRING}${process.env.DB_NAME}`);
}

module.exports = connectDB;
