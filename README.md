# Digital Nomad Planner Notion Template Store

A zero-cost e-commerce store selling a Notion template for digital nomads, built with:

- **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages (free)
- **Backend**: Node.js/Express server hosted on Render free web service (free)
- **Payments**: Bitcoin via BTCPay Server (self-hosted on Render) and mobile money (Telebirr/Chapa) via phone number
- **Template**: Delivered as a Notion `.json` file via direct download after payment verification

## Features

- Responsive design works on mobile and desktop
- Real-time payment status checking
- Secure payment processing (no private keys stored)
- Instant template delivery after payment confirmation
- Accepts both Bitcoin and mobile money (Ethiopian Telebirr/Chapa)

## Local Development

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Set up environment variables (see `.env.example`)
4. Start the backend: `npm start`
5. Visit `http://localhost:3000` to view the store

## Deployment

### Frontend (GitHub Pages)
1. Push the `public` folder to a GitHub repository
2. Enable GitHub Pages in the repository settings
3. Set the source to `/ (root)` or `/docs` depending on your setup

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to: `cd backend && npm install`
4. Set the start command to: `cd backend && npm start`
5. Add environment variables:
   - `BTCPAY_HOST`: Your BTCPay server hostname (if self-hosted)
   - `BTCPAY_PORT`: Port for BTCPay (default 80 for HTTP, 443 for HTTPS)
   - `BTCPAY_API_KEY`: API key from your BTCPay store
   - `BTCPAY_STORE_ID`: Store ID from your BTCPay store
   - `PORT`: Render will set this automatically

### BTCPay Server (Optional - Self-hosted)
For full control, you can self-host BTCPay Server on Render as another web service:
1. Use the `btcpayserver/btcpayserver` Docker image
2. Configure with your preferred settings (see BTCPay documentation)
3. Point the store backend to your self-hosted BTCPay instance

## Environment Variables

Create a `.env` file in the backend directory:

```
# Port for the backend server (Render will override)
PORT=3000

# BTCPay Server configuration (if using self-hosted)
BTCPAY_HOST=your-btcpay.onrender.com
BTCPAY_PORT=80
BTCPAY_API_KEY=your_api_key_from_btcpay
BTCPAY_STORE_ID=your_store_id_from_btcpay

# Optional: Mobile money verification (if implementing)
# MONEY_VERIFICATION_API_KEY=your_chapa_or_telebirr_key
```

## How It Works

1. User visits the store and clicks "Buy Now"
2. Backend generates a Bitcoin invoice via SPT plugin (which communicates with BTCPay Server)
3. User pays via Bitcoin (scan QR code) or mobile money (send to +251 986 540 218)
4. Backend polls the payment status via SPT plugin
5. Upon payment confirmation, user is redirected to download the template
6. Template is served as a direct download from the backend

## Customization

- To change the template, replace `/template.json` with your own Notion export
- To change the price, modify `CONFIG.TEMPLATE_PRICE_USD` in the frontend JavaScript and the default amount in `/backend/server.js`
- To change the product name, update `CONFIG.STORE_NAME` and the purchase record in the backend

## Security Notes

- This implementation does not store private keys - the SPT plugin uses a watch-only wallet
- Payment verification relies on the SPT plugin's connection to BTCPay Server
- For production, consider adding rate limiting, input validation, and HTTPS
- The mobile money verification is currently simulated - implement actual API checks for production

## Credits

Built by Zaxon8987 using the SPT (Sovereign Pay & Treasury) system.