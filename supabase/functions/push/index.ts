// Import the necessary modules
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define the notification record structure
interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

// Define the webhook payload structure
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Notification;
  schema: "public";
  old_record: null | Notification;
}

// Create a Supabase client using the environment variables
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req: Request) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    
    // Only handle insert events on the notifications table
    if (payload.type !== "INSERT" || payload.table !== "notifications") {
      return new Response(JSON.stringify({ message: "Ignored event type or table" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract notification data from the payload
    const notification = payload.record;
    
    console.log("Processing notification:", notification);
    
    // Get the user's expo push token from the profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("expo_push_token")
      .eq("id", notification.user_id)
      .single();

    if (profileError || !profileData?.expo_push_token) {
      console.error("Error fetching profile or no push token found:", profileError);
      return new Response(
        JSON.stringify({ 
          error: profileError?.message || "No push token found for user" 
        }), {
          status: 200, // Return 200 to acknowledge receipt
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const pushToken = profileData.expo_push_token;
    console.log("Push token found:", pushToken);

    // Send the push notification using Expo's push service
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use the Expo access token for enhanced security if available
        ...(Deno.env.get("EXPO_ACCESS_TOKEN") 
          ? { "Authorization": `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}` } 
          : {}),
      },
      body: JSON.stringify({
        to: pushToken,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: "default",
      }),
    });

    const expoResult = await expoResponse.json();
    console.log("Expo push response:", expoResult);

    return new Response(JSON.stringify({ 
      success: true, 
      expo_response: expoResult,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing push notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 