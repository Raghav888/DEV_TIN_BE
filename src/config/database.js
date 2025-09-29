const mongoose = require('mongoose');


const CLUSTER_CONNECTION_STRING = 'mongodb+srv://raghavbang_1:Sowupu%40123@cluster-node.4izim8n.mongodb.net/';
const DB_NAME = "devTinder"

// this returns a promise, so should be inside async await
const connectDB = async () => {
    // TAKES Cluster/DBName
    await mongoose.connect(`${CLUSTER_CONNECTION_STRING}${DB_NAME}`);
}

module.exports = connectDB;
