// netlify/functions/verify-mcc-donation.js
//
// After MonCashConnect redirects the person back to the site, the frontend
// calls this function to confirm the payment actually succeeded server-side
// before showing a "thank you" confirmation — never trust a redirect alone.

const { MonCashClient, MonCashError } = require('@moncashconnect/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.ladwannou.online',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const orderId = event.queryStringParameters && event.queryStringParameters.orderId;
  if (!orderId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing orderId' }) };
  }

  const secretKey = process.env.MCC_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'MCC_SECRET_KEY not configured on the server' }),
    };
  }

  const client = new MonCashClient(secretKey);

  try {
    const tx = await client.getPaymentStatus(orderId);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        paid: tx.status === 'completed',
        status: tx.status, // "pending" | "completed" | "failed"
        netAmount: tx.netAmount,
      }),
    };
  } catch (err) {
    console.error('MonCashConnect payment verification failed:', err);
    const message = err instanceof MonCashError ? err.message : 'Could not verify payment';
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) };
  }
};
