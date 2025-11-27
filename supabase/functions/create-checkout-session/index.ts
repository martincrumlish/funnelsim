import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutSessionRequest {
  price_id: string;
  user_id: string;
  user_email: string;
  success_url?: string;
  cancel_url?: string;
  billing_interval?: 'monthly' | 'yearly' | 'lifetime';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      price_id,
      user_id,
      user_email,
      success_url,
      cancel_url,
      billing_interval = 'monthly'
    }: CheckoutSessionRequest = await req.json();

    console.log("Creating checkout session for user:", user_id, "with price:", price_id, "interval:", billing_interval);

    // Validate required parameters
    if (!price_id || !user_id || !user_email || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: price_id, user_id, user_email, success_url, cancel_url" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // If no existing customer, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user_email,
        metadata: {
          user_id: user_id,
        },
      });
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);
    }

    // Use provided URLs (required, validated above)
    const finalSuccessUrl = success_url;
    const finalCancelUrl = cancel_url;

    // Determine if this is a lifetime (one-time payment) or subscription
    const isLifetime = billing_interval === 'lifetime';

    // Create Stripe Checkout Session with appropriate mode
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      client_reference_id: user_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        user_id: user_id,
        billing_interval: billing_interval,
        is_lifetime: isLifetime ? 'true' : 'false',
      },
    };

    // Only add subscription_data for recurring subscriptions
    if (!isLifetime) {
      sessionConfig.subscription_data = {
        metadata: {
          user_id: user_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Created checkout session:", session.id, "mode:", session.mode);

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
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
