# CloudPayments + amoCRM

## Flow

1. Frontend sends `POST /api/orders` with customer data and selected tickets.
2. Backend calculates the amount from the server-side catalog and returns CloudPayments widget config.
3. Frontend opens CloudPayments widget using `publicId` only.
4. CloudPayments calls backend webhook:
   - `/api/cloudpayments/check`
   - `/api/cloudpayments/pay`
   - `/api/cloudpayments/fail`
5. Backend validates `Content-HMAC` with `CLOUDPAYMENTS_API_SECRET`.
6. On `pay`, backend marks the order paid and creates amoCRM contact + lead.

## Required Server Env

Copy `server/.env.example` to `server/.env` on the server and fill real values.

Required for payment:

```env
CLOUDPAYMENTS_PUBLIC_ID=
CLOUDPAYMENTS_API_SECRET=
```

Required for amoCRM:

```env
AMO_BASE_URL=https://example.amocrm.ru
AMO_CLIENT_ID=
AMO_CLIENT_SECRET=
AMO_REDIRECT_URI=
AMO_ACCESS_TOKEN=
AMO_REFRESH_TOKEN=
```

Optional routing:

```env
AMO_PIPELINE_ID=
AMO_STATUS_ID=
AMO_RESPONSIBLE_USER_ID=
```

## Caddy Proxy

The static site can remain served from `/var/www/paru-par`. Add a reverse proxy for API:

```caddyfile
handle /api/* {
  reverse_proxy 127.0.0.1:8787
}
```

Then run backend with a service manager, for example systemd:

```bash
npm run api:start
```

## CloudPayments Dashboard

Configure notification URLs:

```text
Check: https://your-domain.ru/api/cloudpayments/check
Pay:   https://your-domain.ru/api/cloudpayments/pay
Fail:  https://your-domain.ru/api/cloudpayments/fail
```

Use HTTPS domain for production. IP over HTTP is not suitable for real payments.

## Notes

- Card data never touches this backend.
- CloudPayments secret and amoCRM tokens must never be committed to Git.
- Orders and amoCRM refresh token are stored in `server/data`, ignored by Git.
