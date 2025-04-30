const mongoose = require("mongoose")

const schemaAccountant = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        required: false
    },
    recoveryEmail: {
        type: String,
        required: true
    },
    hostelName: {
        type: String,
        required: true
    }
}, {timestamps: true})

const AccountantSchema = mongoose.model('accountantSchema',schemaAccountant);

module.exports = AccountantSchema