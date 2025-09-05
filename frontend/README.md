# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Backend API (Placeholder Specs)

Base URL: `http://localhost:5000/api` (override with `REACT_APP_API_BASE_URL`)

- Auth

  - POST `/auth/signup` → { name, email, password } → { success, data: { token, user } }
  - POST `/auth/login` → { email, password } → { success, data: { token, user } }
  - GET `/auth/me` → Bearer token → { success, data: { user } }
  - POST `/auth/logout`

- Plans

  - GET `/plans` → { success, data: [{ id, name, price, features[] }] }
  - POST `/plans` → admin only → { name, price, features? } → { success }
  - PUT `/plans/:id` → admin only
  - DELETE `/plans/:id` → admin only

- Subscriptions

  - GET `/subscriptions/me` → { success, data: { planId, planName, status, renewsOn } }
  - POST `/subscriptions` → { planId, gateway: "esewa" | "imepay" } → { success }
  - POST `/subscriptions/upgrade` → { planId }
  - POST `/subscriptions/downgrade` → { planId }
  - POST `/subscriptions/cancel`

- Payments: eSewa

  - POST `/payments/esewa/initiate` → { planId } → returns either:
    - { success, action, params } for form POST to eSewa
    - or { success, redirectUrl }
  - GET `/payments/esewa/verify` → called by frontend with eSewa query string → { success, message? }
  - Webhook (backend): `/webhooks/esewa` (server-to-server) to confirm transaction

- Payments: IME Pay

  - POST `/payments/imepay/initiate` → { planId } → { success, redirectUrl }
  - GET `/payments/imepay/verify` → called by frontend with IME Pay query string → { success, message? }
  - Webhook (backend): `/webhooks/imepay`

- Billing History
  - GET `/payments/history` → { success, data: [{ id, date, gateway, amount, status }] }

Notes:

- Implement proper signature verification and status reconciliation in verify endpoints using gateway docs.
- After verification, set subscription status and record transactions.
- Redirect success/failure to frontend callbacks:
  - eSewa: `/payments/esewa/callback`
  - IME Pay: `/payments/imepay/callback`

## Quickstart

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create a `.env` file in the project root with:

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ESEWA_CALLBACK=http://localhost:3000/payments/esewa/callback
REACT_APP_IMEPAY_CALLBACK=http://localhost:3000/payments/imepay/callback
```

3. Start the app

```bash
npm start
```

Then visit `http://localhost:3000`.

Notes:

- If your backend runs on a different host/port, update `REACT_APP_API_BASE_URL` accordingly.
- Ensure your backend payment verify endpoints redirect to the callback URLs above after processing.

### Using local mocks (no backend required)

Create `.env` with:

```bash
REACT_APP_USE_MOCKS=true
```

Then run `npm start`. The app will use in-memory mock data for plans, subscription, payments, and auth.

## Backend (Node/Express) - Quickstart

The repo now includes a sample backend under `server/` for local testing.

1. Setup

```bash
cd server
npm install
```

2. Create `.env`

```bash
PORT=5000
JWT_SECRET=dev-secret
ESEWA_CALLBACK=http://localhost:3000/payments/esewa/callback
IMEPAY_CALLBACK=http://localhost:3000/payments/imepay/callback
```

3. Run

```bash
npm run dev
```

4. Frontend config

Create `.env` in project root:

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ESEWA_CALLBACK=http://localhost:3000/payments/esewa/callback
REACT_APP_IMEPAY_CALLBACK=http://localhost:3000/payments/imepay/callback
REACT_APP_USE_MOCKS=false
```

Notes:

- Auth users (in-memory): admin@example.com/admin, user@example.com/user
- Plans are seeded (Free, Pro, Enterprise) in-memory
- Payment initiate/verify are demo stubs; integrate real gateway APIs for production
