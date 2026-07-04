import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

Deno.serve(async (req) => {
  return new Response(
    JSON.stringify({
      message: "Edge Function is running",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});