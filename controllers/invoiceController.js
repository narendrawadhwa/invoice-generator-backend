const fs = require('fs');
const Invoice = require('../models/Invoice');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // File naming convention
    }
});

let upload = multer({ storage: storage }).single('signature');


const createInvoice = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        try {
            let {
                sellerDetails,
                placeOfSupply,
                billingDetails,
                shippingDetails,
                placeOfDelivery,
                invoiceDetails,
                reverseCharge,
                items,
                signature
            } = req.body;
            const signatureFileName = `signature_${Date.now()}.jpg`; // Example filename
            const signaturePath = `uploads/${signatureFileName}`; // Example file path
            fs.writeFileSync(signaturePath, Buffer.from(signature, 'base64'));
            const orderNo = generateOrderNumber();
            const invoiceNo = generateInvoiceNumber();

            // Calculate total amount
            const totalAmount = calculateTotalAmount(items, placeOfSupply, placeOfDelivery);

            // Add CGST, SGST, and IGST to each item
            if (!Array.isArray(items)) {
                items = [items];
            }
            const updatedItems = items.map(item => {
                const discount = item.discount / 100; // Convert discount rate to a fraction
                item.netAmount = item.unitPrice * item.quantity * (1 - discount); // Apply discount
                let cgstAmount = 0;
                let sgstAmount = 0;
                let igstAmount = 0;
                if (placeOfSupply === placeOfDelivery) {
                    item.taxType = 'CGST/SGST';
                    const cgstSgstRate = item.gstRate / 2;
                    cgstAmount = item.netAmount * (cgstSgstRate / 100);
                    sgstAmount = item.netAmount * (cgstSgstRate / 100);
                } else {
                    item.taxType = 'IGST';
                    igstAmount = item.netAmount * (item.gstRate / 100);
                }
                item.cgstAmount = cgstAmount;
                item.sgstAmount = sgstAmount;
                item.igstAmount = igstAmount;
                return item;
            });

            const newInvoice = new Invoice({
                sellerDetails,
                placeOfSupply,
                billingDetails,
                shippingDetails,
                placeOfDelivery,
                orderDetails: { orderNo: generateOrderNumber(), orderDate: new Date() },
                invoiceDetails: { invoiceNo: generateInvoiceNumber(), ...invoiceDetails },
                reverseCharge,
                items: updatedItems,
                totalAmount,
                signature: signaturePath
            });
// Save the new invoice to the database
           // Save the new invoice to the database
           await newInvoice.save();

        //    // Save the signature image file
        //    const signaturePath = `uploads/signature_${newInvoice._id}.jpg`; // Example file path
        //    fs.writeFileSync(signaturePath, signatureData);

        //    // Update the signature field of the invoice with the file path
        //    newInvoice.signature = signaturePath;
           await newInvoice.save();
res.json(newInvoice);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

// Function to calculate total amount
const calculateTotalAmount = (items, placeOfSupply, placeOfDelivery) => {
    let totalAmount = 0;
    if (!Array.isArray(items)) {
        items = [items];
    }
    items.forEach(item => {
        const discount = item.discount / 100; 
        item.netAmount = item.unitPrice * item.quantity * (1 - discount); 
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;
        if (placeOfSupply === placeOfDelivery) {
            item.taxType = 'CGST/SGST';
            const cgstSgstRate = item.gstRate / 2;
            cgstAmount = item.netAmount * (cgstSgstRate / 100);
            sgstAmount = item.netAmount * (cgstSgstRate / 100);
        } else {
            item.taxType = 'IGST';
            igstAmount = item.netAmount * (item.gstRate / 100);
        }
        totalAmount += item.netAmount + cgstAmount + sgstAmount + igstAmount;
    });

    return totalAmount;
};

// Function to generate a unique order number
const generateOrderNumber = () => {
    return 'ORD' + Date.now();
};

// Function to generate a unique invoice number
const generateInvoiceNumber = () => {
    return 'INV' + Date.now();
};
exports.createInvoice = createInvoice;

exports.getSignatureImage = (req, res) => {
    const signaturePath = req.params.signaturePath;
    const filePath = path.join(__dirname, '../uploads', signaturePath);
    res.sendFile(filePath);
};

exports.getInvoiceByOrderNumber = async (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;
        const invoice = await Invoice.findOne({ 'orderDetails.orderNo': orderNumber });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
