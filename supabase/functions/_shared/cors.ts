// This header allows the browser to access your Edge Function.
// For better security, you can replace '*' with your frontend application's URL in production.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
