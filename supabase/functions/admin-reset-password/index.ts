import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const ELASTIC_EMAIL_API_KEY = Deno.env.get("ELASTIC_EMAIL_API_KEY");
const ELASTIC_EMAIL_API_URL = "https://api.elasticemail.com/v2/email/send";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  user_id: string;
  email: string;
  redirectUrl?: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the user from the JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if requesting user is an admin
    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', requestingUser.id)
      .eq('is_admin', true)
      .single();

    if (adminError || !adminRecord) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin privileges required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    const { user_id, email, redirectUrl }: ResetPasswordRequest = await req.json();

    // Validate required parameters
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: user_id, email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Admin sending password reset for user:", email, "by admin:", requestingUser.email);

    // Use provided redirectUrl or fall back to production domain
    const baseUrl = redirectUrl || 'https://userapps.kickpages.com';

    // Verify user exists
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !targetUser) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user_id,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      return new Response(
        JSON.stringify({ error: `Error storing token: ${tokenError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create reset link
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send reset email
    const params = new URLSearchParams({
      apikey: ELASTIC_EMAIL_API_KEY!,
      from: "noreply@kickpages.com",
      fromName: "Funnel Builder",
      to: email,
      subject: "Password Reset Request (Admin)",
      bodyHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #ffffff; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .note {
              background-color: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>An administrator has initiated a password reset for your account. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </p>
              <p>If you did not expect this email, please contact your administrator.</p>
              <p>This link will expire in 1 hour.</p>
              <div class="note">
                <strong>Note:</strong> This password reset was requested by an administrator on your behalf.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      isTransactional: "true",
    });

    const response = await fetch(ELASTIC_EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const result = await response.text();
    console.log("ElasticEmail API response:", result);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Email API error: ${result}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password reset email sent to ${email}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in admin-reset-password:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
