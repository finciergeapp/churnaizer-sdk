window.Churnaizer = {
  track: async function (userData, apiKey, callback) {
    // ✅ Validate required fields
    if (!userData || typeof userData !== "object" || !userData.user_id || !userData.email) {
      const error = new Error("Missing required user_id or email");
      console.error("Churnaizer SDK:", error);
      if (callback) callback(null, error);
      return;
    }

    try {
      const DEFAULT_ENDPOINT = 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/track';

      // 🔁 Send to prediction API
      const predictRes = await fetch(DEFAULT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(userData)
      });

      const text = await predictRes.text();
      if (text.startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Invalid HTML response. API might be unreachable or URL incorrect.");
      }

      const prediction = JSON.parse(text);

      // Validate required fields from API response
      const requiredFields = [
        'churn_probability',
        'reason',
        'message',
        'understanding_score',
        'risk_level',
        'shouldTriggerEmail',
        'recommended_tone'
      ];

      const missingFields = requiredFields.filter(field => prediction[field] === undefined);
      if (missingFields.length > 0) {
        throw new Error(`API response missing required fields: ${missingFields.join(', ')}`);
      }

      const {
        churn_probability,
        reason,
        message,
        understanding_score,
        risk_level,
        shouldTriggerEmail,
        recommended_tone
      } = prediction;

      const result = {
        churn_score: churn_probability,
        churn_reason: reason,
        insight: message,
        understanding: understanding_score,
        risk_level,
        shouldTriggerEmail,
        recommended_tone
      };

      // Sync to Dashboard
      try {
        await fetch('https://churnaizer.com/api/sync', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
          },
          body: JSON.stringify({ userData, prediction: result })
        });
      } catch (error) {
        // Silently handle errors to not interrupt main SDK logic
      }

      // Trigger Email (Optional)
      if (result.shouldTriggerEmail) {
        try {
          await fetch('https://churnaizer.com/api/email/send', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKey
            },
            body: JSON.stringify({
              user_id: userData.user_id,
              email: userData.email,
              churn_score: result.churn_score,
              churn_reason: result.churn_reason,
              risk_level: result.risk_level,
              subscription_plan: userData.subscription_plan // Assuming this is part of userData
            })
          });
        } catch (error) {
          // Silently handle errors to not interrupt main SDK logic
        }
      }

      // Call the callback with the prediction result
      if (callback && typeof callback === 'function') {
        callback(null, result);
      }
      return result;

    } catch (error) {
      console.error("Churnaizer SDK Error:", error);
      if (callback) callback(null, error);
    }
  }
};
