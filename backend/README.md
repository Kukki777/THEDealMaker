# THEDealMaker API

Express and MongoDB API for real-estate listings, uploads, moderation, paid
subscriptions, mobile OTP login, and optional Google sign-in.

## Setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Register at [2Factor.in](https://2factor.in/CP/register.php), obtain the
   SMS OTP API key, and set `TWO_FACTOR_API_KEY`.
3. Set a long random `JWT_SECRET`; it protects mobile OTP login sessions.
4. For optional Google login, generate a Firebase Admin service-account key
   and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
   `FIREBASE_PRIVATE_KEY`.
5. In Razorpay Dashboard, enable Test Mode and add the test `Key ID` and
   `Key Secret` to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The one-time
   service-access checkout is fixed at Rs. 111 and unlocks every service only
   after verified payment.
6. Configure Cloudinary values when using gallery uploads.
7. Run `npm run dev`.

While Razorpay keys are not available during local development only, set
`SERVICE_ACCESS_DEMO_MODE=true`. The access modal then shows a clearly marked
demo unlock button. Set it back to `false` before production deployment.

The API runs at `http://localhost:5001` by default. Check it with
`GET /api/health`.

## Authentication And MongoDB

The mobile flow uses:

| Step | Endpoint |
| --- | --- |
| Send OTP | `POST /api/auth/mobile/request-otp` with `{ "phone", "name" }` |
| Verify OTP | `POST /api/auth/mobile/verify-otp` with `{ "challengeId", "otp" }` |
| Current user | `GET /api/auth/me` with the returned bearer token |

OTP delivery and verification are performed server-side with 2Factor. Once
2Factor confirms the OTP, the API creates or updates the MongoDB user with
their verified phone and issues a JWT.

Optional Google users authenticate through Firebase; their Firebase ID token
is verified server-side and the same MongoDB user sync applies.

To approve submitted listings, sign in first and promote the matching MongoDB
user:

```bash
npm run make:admin -- your-email@example.com
# or for a mobile OTP only account:
npm run make:admin -- 9876543210
```

Property image uploads use multipart field name `images` and require
Cloudinary configuration.
