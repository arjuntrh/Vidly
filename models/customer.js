const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    phone: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    isGold: {
        type: Boolean,
        default: false
    }
})
  
const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).max(100).required(),
        phone: Joi.string().min(3).max(100).required()
    };

    return Joi.validate(customer, schema);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;