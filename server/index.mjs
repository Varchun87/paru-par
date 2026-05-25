import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateOrder } from './catalog.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
await loadEnv(join(__dirname, '.env'));

const dataDir = join(__dirname, 'data');
const ordersFile = join(dataDir, 'orders.json');
const amoTokenFile = join(dataDir, 'amocrm-token.json');
const port = Number.parseInt(process.env.PORT || '8787', 10);

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') return sendNoContent(response);
    if (request.method === 'GET' && request.url === '/api/health') return sendJson(response, { ok: true });
    if (request.method === 'GET' && request.url === '/api/checkout/config') return sendCheckoutConfig(response);
    if (request.method === 'POST' && request.url === '/api/orders') return createOrder(request, response);
    if (request.method === 'POST' && request.url?.startsWith('/api/cloudpayments/')) return handleCloudPayments(request, response);

    return sendJson(response, { error: 'Not found' }, 404);
  } catch (error) {
    console.error(error);
    return sendJson(response, { error: error.message || 'Internal server error' }, 500);
  }
});

server.listen(port, () => {
  console.log(`Paru Par API listening on :${port}`);
});

async function loadEnv(path) {
  try {
    const content = await readFile(path, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env is optional for local smoke tests.
  }
}

function sendCheckoutConfig(response) {
  return sendJson(response, {
    paymentEnabled: Boolean(process.env.CLOUDPAYMENTS_PUBLIC_ID),
    publicId: process.env.CLOUDPAYMENTS_PUBLIC_ID || '',
    currency: 'RUB',
  });
}

async function createOrder(request, response) {
  const payload = await readJson(request);
  const customer = normalizeCustomer(payload.customer);
  const calculation = calculateOrder(payload);
  const invoiceId = `parupar-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const order = {
    id: randomUUID(),
    invoiceId,
    status: 'created',
    customer,
    amount: calculation.amount,
    description: calculation.description,
    lines: calculation.lines,
    comment: String(payload.comment || '').trim(),
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);

  return sendJson(response, {
    orderId: order.id,
    invoiceId,
    amount: order.amount,
    currency: 'RUB',
    description: order.description,
    publicId: process.env.CLOUDPAYMENTS_PUBLIC_ID || '',
    paymentEnabled: Boolean(process.env.CLOUDPAYMENTS_PUBLIC_ID),
    customerEmail: customer.email,
    data: {
      orderId: order.id,
      phone: customer.phone,
      name: customer.name,
      lines: order.lines,
    },
  });
}

async function handleCloudPayments(request, response) {
  const rawBody = await readRawBody(request);
  if (!isValidCloudPaymentsSignature(request, rawBody)) {
    return sendJson(response, { code: 13, message: 'Invalid signature' }, 403);
  }

  const notification = parseNotification(request, rawBody);
  const action = request.url.split('/').pop();
  const invoiceId = notification.InvoiceId || notification.invoiceId;
  const transactionId = notification.TransactionId || notification.transactionId;

  if (!invoiceId) return sendJson(response, { code: 13, message: 'InvoiceId is required' }, 400);

  if (action === 'check') {
    return sendJson(response, { code: 0 });
  }

  if (action === 'pay') {
    const order = await updateOrder(invoiceId, { status: 'paid', transactionId, paidAt: new Date().toISOString(), notification });
    await createAmoDeal(order).catch((error) => console.error('amoCRM error:', error));
    return sendJson(response, { code: 0 });
  }

  if (action === 'fail') {
    await updateOrder(invoiceId, { status: 'failed', transactionId, failedAt: new Date().toISOString(), notification });
    return sendJson(response, { code: 0 });
  }

  return sendJson(response, { code: 0 });
}

function normalizeCustomer(customer = {}) {
  const normalized = {
    name: String(customer.name || '').trim(),
    email: String(customer.email || '').trim(),
    phone: String(customer.phone || '').trim(),
  };

  if (!normalized.name || !normalized.email || !normalized.phone) {
    throw new Error('Укажите имя, email и телефон.');
  }

  return normalized;
}

function isValidCloudPaymentsSignature(request, rawBody) {
  const secret = process.env.CLOUDPAYMENTS_API_SECRET;
  if (!secret) return true;

  const header = request.headers['content-hmac'];
  if (!header || Array.isArray(header)) return false;

  const digest = createHmac('sha256', secret).update(rawBody).digest('base64');
  const expected = Buffer.from(digest);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function parseNotification(request, rawBody) {
  const contentType = request.headers['content-type'] || '';
  if (contentType.includes('application/json')) return JSON.parse(rawBody.toString('utf8') || '{}');

  return Object.fromEntries(new URLSearchParams(rawBody.toString('utf8')));
}

async function createAmoDeal(order) {
  const baseUrl = process.env.AMO_BASE_URL;
  if (!baseUrl || !process.env.AMO_CLIENT_ID || !process.env.AMO_CLIENT_SECRET) {
    await updateOrder(order.invoiceId, { amoStatus: 'skipped: missing env' });
    return;
  }

  const contact = await amoRequest('/api/v4/contacts', 'POST', [{
    name: order.customer.name,
    custom_fields_values: [
      { field_code: 'PHONE', values: [{ value: order.customer.phone }] },
      { field_code: 'EMAIL', values: [{ value: order.customer.email }] },
    ],
  }]);
  const contactId = contact?._embedded?.contacts?.[0]?.id;
  const leadPayload = {
    name: `Билет Пару Пар: ${order.customer.name}`,
    price: order.amount,
    _embedded: contactId ? { contacts: [{ id: contactId }] } : undefined,
  };

  if (process.env.AMO_PIPELINE_ID) leadPayload.pipeline_id = Number(process.env.AMO_PIPELINE_ID);
  if (process.env.AMO_STATUS_ID) leadPayload.status_id = Number(process.env.AMO_STATUS_ID);
  if (process.env.AMO_RESPONSIBLE_USER_ID) leadPayload.responsible_user_id = Number(process.env.AMO_RESPONSIBLE_USER_ID);

  const lead = await amoRequest('/api/v4/leads', 'POST', [leadPayload]);
  const leadId = lead?._embedded?.leads?.[0]?.id;

  if (leadId) {
    const note = [
      `Оплата CloudPayments: ${order.status}`,
      `Сумма: ${order.amount} RUB`,
      `InvoiceId: ${order.invoiceId}`,
      `TransactionId: ${order.transactionId || '-'}`,
      `Состав: ${order.lines.map((line) => `${line.label} x${line.quantity}`).join(', ')}`,
      order.comment ? `Комментарий: ${order.comment}` : '',
    ].filter(Boolean).join('\n');

    await amoRequest(`/api/v4/leads/${leadId}/notes`, 'POST', [{ note_type: 'common', params: { text: note } }]);
  }

  await updateOrder(order.invoiceId, { amoStatus: 'created', amoLeadId: leadId, amoContactId: contactId });
}

async function amoRequest(path, method, body, didRefresh = false) {
  const token = await getAmoToken();
  const response = await fetch(`${process.env.AMO_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401 && !didRefresh) {
    await refreshAmoToken(token.refresh_token);
    return amoRequest(path, method, body, true);
  }

  if (!response.ok) throw new Error(`amoCRM request failed: ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function getAmoToken() {
  const saved = await readJsonFile(amoTokenFile, null);
  if (saved?.access_token && saved?.refresh_token) return saved;

  if (process.env.AMO_ACCESS_TOKEN && process.env.AMO_REFRESH_TOKEN) {
    const token = { access_token: process.env.AMO_ACCESS_TOKEN, refresh_token: process.env.AMO_REFRESH_TOKEN };
    await writeJsonFile(amoTokenFile, token);
    return token;
  }

  throw new Error('amoCRM tokens are not configured');
}

async function refreshAmoToken(refreshToken) {
  const response = await fetch(`${process.env.AMO_BASE_URL}/oauth2/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AMO_CLIENT_ID,
      client_secret: process.env.AMO_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: process.env.AMO_REDIRECT_URI,
    }),
  });

  if (!response.ok) throw new Error(`amoCRM refresh failed: ${response.status} ${await response.text()}`);
  const token = await response.json();
  await writeJsonFile(amoTokenFile, token);
  return token;
}

async function saveOrder(order) {
  const orders = await readJsonFile(ordersFile, []);
  orders.push(order);
  await writeJsonFile(ordersFile, orders);
}

async function updateOrder(invoiceId, patch) {
  const orders = await readJsonFile(ordersFile, []);
  const index = orders.findIndex((order) => order.invoiceId === invoiceId);
  if (index === -1) throw new Error(`Order not found: ${invoiceId}`);

  orders[index] = { ...orders[index], ...patch, updatedAt: new Date().toISOString() };
  await writeJsonFile(ordersFile, orders);
  return orders[index];
}

async function readJson(request) {
  const rawBody = await readRawBody(request);
  return JSON.parse(rawBody.toString('utf8') || '{}');
}

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

async function readJsonFile(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sendJson(response, body, status = 200) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.SITE_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Content-HMAC',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  response.end(JSON.stringify(body));
}

function sendNoContent(response) {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': process.env.SITE_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Content-HMAC',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  response.end();
}
