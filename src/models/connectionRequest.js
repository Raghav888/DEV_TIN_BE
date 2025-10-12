
const mongoose = require('mongoose');

const connectRequestSchema = new mongoose.Schema({
    requestFromId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    requestToId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is not the expected value`
        },
        required: true,
    }
}, {
    timestamps: true,
});


// it will run before save operation
// schema level operation
// we can have this validatio at api level too, depends on devloper
connectRequestSchema.pre("save", function (next) {
    const connectionReq = this; // it has the req body now
    if (connectionReq.requestFromId.equals(connectionReq.requestToId)) {
        throw new Error(" To and from ids cannot be same")
    }
    next();
})

// compound index added
connectRequestSchema.index({ requestFromId: 1, requestToId: 1 }, { unique: true })

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectRequestSchema)

module.exports = ConnectionRequestModel;