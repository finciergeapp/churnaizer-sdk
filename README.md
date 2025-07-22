# Churnaizer SDK

## 🔍 What this SDK does:
The `churnaizer-sdk.js` script allows you to track user behavior and get churn prediction instantly. Just call `Churnaizer.track(userData, apiKey, callback)` anywhere in your app after loading the script.

## 🚀 How Data Flows:
1. You call `Churnaizer.track({ ...userData }, "your_api_key", callbackFn)`.
2. The SDK sends data to the `/predict` API.
3. It receives back `churn_score`, `reason`, `insight`, etc.
4. The SDK auto-sends this information to `/sync` for the dashboard.
5. The callback returns the same information to your application.

This is a fully closed loop: send → predict → sync → return to caller.

## 🛠️ SDK Features:
- **Global SDK Object**: Accessible via `window.Churnaizer`.
- **Error Fallback**: Handles HTML/JSON bugs gracefully.
- **Async/Await Support**: Promise-friendly API calls.
- **Logging Toggle**: `Churnaizer.debug = true/false` to enable/disable internal logs.
- **SDK Versioning**: Includes `X-SDK-Version` header for debugging.

## 📥 Example Input:
```javascript
{
  user_id: "u23",
  plan: "Pro",
  usage_score: 42,
  support_tickets: 1,
  email: "founder@saas.io"
}
```

## 📤 Example Output (callback receives this):
```javascript
{
  churn_score: 0.78,
  churn_reason: "Low engagement",
  insight: "Predicted using plan + usage behavior",
  understanding: 0.22
}
```