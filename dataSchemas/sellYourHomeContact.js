var mongoose = require("mongoose");

var sYHContactData = new mongoose.Schema({
    name: String,
    propertyAddress: String,
    phone: Number,
    email: String,
    optIn: String,
});

module.exports = mongoose.model("sYHContact", sYHContactData);