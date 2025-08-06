window.Churnaizer = {
    version: "1.0.1", // Updated SDK version
    debug: false, // Set to true for development debugging

  track: async function (userData, apiKey, callback, traceIdInput) {
    const traceId = traceIdInput || (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    // ✅ Validate required fields
    if (!userData || typeof userData !== "object" || !userData.user_id || !userData.email) {
      const error = new Error("Missing required user_id or email");
      if (callback) callback(error, null);
       return;
     }
    if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Payload:`, userData);

    try {
      const SUPABASE_PROJECT_URL = window.Churnaizer.SUPABASE_PROJECT_URL || "ntbkydpgjaswmwruegyl.supabase.co";
      const DEFAULT_ENDPOINT = `https://${SUPABASE_PROJECT_URL}/functions/v1/sdk-track`;

      // 🔁 Send to prediction API
      const predictRes = await fetch(DEFAULT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          "x-sdk-version": window.Churnaizer.version,
          "x-trace-id": traceId
        },
        body: JSON.stringify({ ...userData, api_key: apiKey })
      });

      const text = await predictRes.text();
      if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] Prediction API Raw Response:`, text);
      if (text.startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Invalid HTML response. API might be unreachable or URL incorrect.");
      }

      const prediction = JSON.parse(text);
      if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] Prediction API Parsed Response:`, prediction);
      
      // Check for API error response format
      if (prediction.status === 'ok' && prediction.failed > 0) {
        // This is the specific error case mentioned in the user's report
        if (prediction.results && prediction.results.length > 0) {
          // Look for any result with error information
          const failedResult = prediction.results.find(r => r.status === 'error' || r.error);
          if (failedResult) {
            throw new Error(failedResult.error || 'API processing failed');
          }
          
          // Check each result for any error property at any level
          for (const result of prediction.results) {
            if (typeof result === 'object' && result !== null) {
              // Check if the result itself has an error message
              if (result.message) {
                throw new Error(result.message);
              }
              
              // Check if there's an error object inside the result
              if (result.error) {
                if (typeof result.error === 'string') {
                  throw new Error(result.error);
                } else if (typeof result.error === 'object' && result.error !== null && result.error.message) {
                  throw new Error(result.error.message);
                }
              }
            }
          }
        }
        // If we have failed items but couldn't find a specific error message
        throw new Error(`Processing failed: ${prediction.failed} of ${prediction.total} items failed`);
      }

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

            "x-trace-id": traceId
          },
          body: JSON.stringify({ userData, prediction: result, trace_id: traceId, api_key: apiKey })
        });
        if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] Dashboard Sync Request Sent.`);
      } catch (error) {
        console.error(`[TRACE 1 | trace_id: ${traceId}] Churnaizer SDK Error during Dashboard Sync:`, error);
      }

      // Trigger Email (Optional)
      if (result.shouldTriggerEmail) {
        try {
          await fetch('https://churnaizer.com/api/email/send', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",

            "x-trace-id": traceId
          },
          body: JSON.stringify({
            trace_id: traceId, // Pass trace_id in body
            user_id: userData.user_id,
            email: userData.email,
            churn_score: result.churn_score,
            churn_reason: result.churn_reason,
            risk_level: result.risk_level,
            subscription_plan: userData.subscription_plan, // Assuming this is part of userData
            api_key: apiKey
          })
        });
        if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] Email Trigger Request Sent.`);
        } catch (error) {
        console.error(`[TRACE 1 | trace_id: ${traceId}] Churnaizer SDK Error during Email Trigger:`, error);
      }
      }

      // Call the callback with the prediction result
        if (callback && typeof callback === 'function') {
            callback(null, result);
        }

        // Automatically call trackEvent for 'login'
        window.Churnaizer.trackEvent({
            event: "login",
            user_id: userData.user_id,
            email: userData.email,
            customer_name: userData.customer_name,
            monthly_revenue: userData.monthly_revenue
        }, apiKey, null, traceId); // Pass traceId to trackEvent
      return result;

    } catch (error) {
      if (this.debug) console.error(`[TRACE 1 | trace_id: ${traceId}] Churnaizer SDK Error:`, error);
      if (callback) callback(error, null);
    }
  },

  trackEvent: async function(eventData, apiKey, callback, traceIdInput) {
    const traceId = traceIdInput || (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      if (!eventData || !eventData.event || !eventData.user_id) {
          const error = new Error("Event and user_id are required for trackEvent.");
          if (callback && typeof callback === 'function') {
              callback(error, null);
          }
          if (this.debug) console.error(`[TRACE 1 | trace_id: ${traceId}] Churnaizer SDK Error during trackEvent:`, error);
          return;
      }

      const SUPABASE_PROJECT_URL = window.Churnaizer.SUPABASE_PROJECT_URL || "ntbkydpgjaswmwruegyl.supabase.co"; // This should ideally be configurable or derived
      const endpoint = `https://${SUPABASE_PROJECT_URL}/functions/v1/sdk-event`;
      if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Event Payload:`, eventData);

      try {
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'x-sdk-version': window.Churnaizer.version,

                  'x-trace-id': traceId
              },
              body: JSON.stringify({ ...eventData, trace_id: traceId, api_key: apiKey })
          });
          if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Event Request Sent.`);

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Event API Raw Response:`, errorText);

          const result = await response.json();
          if (this.debug) console.log(`[TRACE 1 | trace_id: ${traceId}] SDK Event API Parsed Response:`, result);
          if (callback && typeof callback === 'function') {
              callback(null, result);
          }
      } catch (error) {
          if (this.debug) console.error(`[TRACE 1 | trace_id: ${traceId}] Churnaizer SDK Error during trackEvent:`, error);
          if (callback && typeof callback === 'function') {
              callback(error, null);
          }
      }
  }
};
