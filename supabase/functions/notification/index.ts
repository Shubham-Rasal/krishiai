import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Expo push notification API endpoint
const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface PushNotificationRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface ExpoNotification {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Check if it's a POST request
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Parse the request body
    const requestData: PushNotificationRequest = await req.json();
    
    // Validate required fields
    if (!requestData.title || !requestData.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title and body are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get push tokens based on user ID(s)
    let tokens: string[] = [];
    
    if (requestData.userId) {
      // If a single user ID is provided, retrieve that user's push token
      const { data, error } = await supabaseClient
        .from("push_tokens")
        .select("pushToken")
        .eq("userId", requestData.userId);
        
      if (error) throw error;
      
      tokens = data.map(item => item.pushToken);
    } else if (requestData.userIds && requestData.userIds.length > 0) {
      // If multiple user IDs are provided, retrieve all their push tokens
      const { data, error } = await supabaseClient
        .from("push_tokens")
        .select("pushToken")
        .in("userId", requestData.userIds);
        
      if (error) throw error;
      
      tokens = data.map(item => item.pushToken);
    } else {
      // If no user ID is provided, send to all registered tokens
      const { data, error } = await supabaseClient
        .from("push_tokens")
        .select("pushToken");
        
      if (error) throw error;
      
      tokens = data.map(item => item.pushToken);
    }

    // If no tokens found, return early
    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No push tokens found for the specified user(s)" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Prepare notifications for Expo Push API
    const notifications: ExpoNotification[] = tokens.map(token => ({
      to: token,
      title: requestData.title,
      body: requestData.body,
      data: requestData.data || {},
      sound: "default",
      priority: "high",
    }));

    // Send notifications using Expo Push API
    const pushResponse = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(notifications),
    });

    const pushResult = await pushResponse.json();

    return new Response(
      JSON.stringify({
        message: "Notifications sent successfully",
        result: pushResult,
        sentTo: tokens.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to send notifications", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}); 