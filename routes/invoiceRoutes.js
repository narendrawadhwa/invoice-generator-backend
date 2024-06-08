// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/create', invoiceController.createInvoice);
router.get('/signature/:signaturePath', invoiceController.getSignatureImage);
router.get('/:orderNumber', invoiceController.getInvoiceByOrderNumber);

module.exports = router;
