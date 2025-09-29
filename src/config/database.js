const mongoose = require('mongoose');




// this returns a promise, so should be inside async await
const connectDB = async () => {
    // TAKES Cluster/DBName
    await mongoose.connect(`${CLUSTER_CONNECTION_STRING}${DB_NAME}`);
}

module.exports = connectDB;
