# RentSell Frontend

Luxury real-estate interface built with Next.js and Framer Motion.

## Authentication

Mobile OTP is sent through the backend using 2Factor.in. No OTP provider API
key is exposed in the browser.

Google sign-in remains optional through Firebase:

1. Create a Firebase Web app.
2. Enable only the `Google` sign-in provider in Firebase Authentication.
3. Add the Firebase web values from `.env.local.example` to `.env.local`.
4. Add `localhost` to Firebase authorized domains for local development.

After either verified mobile OTP or Google sign-in, the backend creates or
updates the MongoDB user profile.
