# Churnaizer SDK

This repository contains a plug-and-play JavaScript SDK for integrating with the Churnaizer churn prediction model.

## Folder Structure

```
churnaizer-sdk/
├── index.html            ← Optional: Landing/test page
├── test.html             ← For testing the SDK live
├── churnaizer-sdk.js     ← SDK logic file
├── README.md             ← Instructions for use
```

## `churnaizer-sdk.js`

This file contains the core logic of the Churnaizer SDK. It defines a global `Churnaizer` object with a `track` function that sends user data to the churn prediction model. It now supports a `callback` function for handling responses and displaying results on the webpage, as well as improved error handling.

**API Endpoint:** `https://ai-model-rumc.onrender.com/api/v1/predict`

## `test.html`

This file is a simple HTML page for testing the SDK locally or after deployment. It includes `churnaizer-sdk.js` and provides a button to trigger a test `Churnaizer.track` call with example user data. The results (churn score and reason) are now displayed directly on the page, and errors are handled and shown.

## `index.html` (Optional)

This is an optional landing page for the SDK, providing a brief introduction and example usage for customers.

## How to Use (for your customers)

To integrate the Churnaizer SDK into your website or application, simply add the following `<script>` tags to your HTML code, preferably just before the closing `</body>` tag:

```html
<script src="https://churnaizer-sdk.netlify.app/churnaizer-sdk.js"></script>
<script>
  Churnaizer.track({
    user_id: "user_001",
    days_since_signup: 45,
    monthly_revenue: 29.99,
    subscription_plan: "Free Trial",
    number_of_logins_last30days: 3,
    active_features_used: 2,
    support_tickets_opened: 0,
    last_payment_status: "Failed",
    email_opens_last30days: 1,
    last_login_days_ago: 6,
    billing_issue_count: 2
  }, "YOUR_API_KEY_HERE", function(result) {
    // Handle the result here, e.g., display on UI
    console.log("Churn Score:", result.churn_score);
    console.log("Reason:", result.churn_reason);
  });
</script>
```

**Important:**
- Replace `"YOUR_API_KEY_HERE"` with your actual API key provided by Churnaizer.
- Adjust the `user_id` and other `userData` fields to reflect the actual user information you want to send for churn prediction.
- The `callback` function is optional but recommended for handling the prediction results.

## Deployment on Netlify

To deploy this SDK on Netlify, follow these steps:

1.  **Create a new site** on Netlify.
2.  **Connect your Git repository** (e.g., GitHub, GitLab, Bitbucket) where you host this `churnaizer-sdk` folder.
3.  **Configure build settings:**
    *   **Build command:** (Leave empty for static sites)
    *   **Publish directory:** `./` (or the path to your `churnaizer-sdk` folder if it's a subdirectory in your repo)
4.  **Deploy the site.**

Once deployed, Netlify will provide you with a URL (e.g., `https://your-site-name.netlify.app`). Your SDK will be accessible at `https://your-site-name.netlify.app/churnaizer-sdk.js`.