// netlify/functions/create-mcc-donation.js
//
// Creates a MonCash payment through MonCashConnect (moncashconnect.com) — a
// third-party gateway that lets developers accept MonCash without going
// through Digicel's own merchant approval process. NOTE: MonCashConnect is
// NOT affiliated with Digicel or the official MonCash service — it's an
// independent intermediary that takes a commission per transaction.
//
// Uses the official @moncashconnect/sdk package, so we don't have to guess
// endpoint paths or auth header formats.
//
// Required environment variable (set in Netlify dashboard, NOT in code):
//   MCC_SECRET_KEY = your MonCashConnect secret key
//                    (sk_proj_... for live, sk_test_proj_... for sandbox —
//                    get it from Developer → Projects in your dashboard)

const { MonCashClient, MonCashError } = require('@moncashconnect/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.ladwannou.online',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid amount' }) };
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

  // Unique order id per donation attempt — also used as the idempotency key
  // so a retry (e.g. flaky connection) never creates a duplicate charge.
  const orderId = `LADWANNOU-DON-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const payment = await client.createPayment(amount, orderId, {
      returnUrl: 'https://www.ladwannou.online/',
      idempotencyKey: orderId,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: payment.paymentUrl, orderId, sandbox: client.isSandbox }),
    };
  } catch (err) {
    console.error('MonCashConnect payment creation failed:', err);
    const message = err instanceof MonCashError ? err.message : 'Could not create payment';
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) };
  }
};
