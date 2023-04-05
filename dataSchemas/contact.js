var mongoose = require("mongoose");

var contactData = new mongoose.Schema({
    name: String,
    propertyAddress: String,
    phone: Number,
    email: String,
    message: String,
    rFContacting: String,
    optIn: String,
});

module.exports = mongoose.model("Contact", contactData);