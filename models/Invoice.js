const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    gstRate: { type: Number, required: true, default: 18 },
    cgstAmount: { type: Number },
    sgstAmount: { type: Number },
    igstAmount: { type: Number }
});

const invoiceSchema = new mongoose.Schema({
    sellerDetails: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        panNo: { type: String, required: true },
        gstNo: { type: String, required: true },
    },
    placeOfSupply: { type: String, required: true },
    billingDetails: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        stateCode: { type: String, required: true },
    },
    shippingDetails: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        stateCode: { type: String, required: true },
    },
    placeOfDelivery: { type: String, required: true },
    orderDetails: {
        orderNo: { type: String, required: true },
        orderDate: { type: Date, required: true },
    },
    invoiceDetails: {
        invoiceNo: { type: String, required: true },
        invoiceDate: { type: Date, required: true },
    },
    reverseCharge: { type: Boolean, required: true },
    items: [itemSchema],
    totalAmount: { type: Number, required: true },
    signature: { type: String},
});

module.exports = mongoose.model('Invoice', invoiceSchema);
