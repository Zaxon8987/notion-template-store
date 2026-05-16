const express = require('express');
const path = require('path');
const fs = require('fs');
const { generate_bitcoin_invoice, get_invoice_status } = require('/home/zorro/.opencode/plugins/spt/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Store purchase records (in production, use a database)
const purchases = new Map();

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Generate Bitcoin invoice endpoint
app.post('/api/create-invoice', async (req, res) => {
  try {
    const { amount = 19, orderId = `nomad-planner-${Date.now()}` } = req.body;
    
    const invoice = await generate_bitcoin_invoice(amount, orderId);
    
    // Store invoice info for later verification
    purchases.set(invoice.id, {
      amount,
      orderId,
      status: 'pending',
      createdAt: new Date(),
      product: 'Digital Nomad Planner Notion Template'
    });
    
    res.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.checkoutUrl || invoice.invoiceUrl,
      amount: invoice.amount,
      currency: invoice.currency
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate payment invoice' 
    });
  }
});

// Check payment status endpoint
app.get('/api/check-payment/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Check if we have this invoice
    if (!purchases.has(invoiceId)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invoice not found' 
      });
    }
    
    const purchase = purchases.get(invoiceId);
    
    // Check payment status via SPT
    const status = await get_invoice_status(invoiceId);
    
    let isPaid = false;
    if (status && (status.status === 'settled' || status.status === 'confirmed' || status.settled)) {
      isPaid = true;
      
      // Update purchase record
      purchase.status = 'paid';
      purchase.paidAt = new Date();
      purchases.set(invoiceId, purchase);
    }
    
    res.json({
      success: true,
      paid: isPaid,
      status: status.status || 'unknown',
      purchase: purchase
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check payment status' 
    });
  }
});

// Serve the template file (protected - should only be accessible after payment)
app.get('/download/template.json', (req, res) => {
  // In a real implementation, you would verify payment via session or token
  // For simplicity in this demo, we'll allow direct access
  // In production, you'd want to check if the user has paid for this template
  
  const templatePath = path.join(__dirname, '..', 'template.json');
  
  if (fs.existsSync(templatePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="digital-nomad-planner.json"');
    res.sendFile(templatePath);
  } else {
    res.status(404).send('Template not found');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the store`);
});

module.exports = app;