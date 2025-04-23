// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nozzpehnfbukmptsnhoo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5venpwZWhuZmJ1a21wdHNuaG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjAzMzMsImV4cCI6MjA1OTkzNjMzM30.RaSvnadBrgrbWssM-HDpwiQZy8DUk7UJZPR3cBPLbdE";

export const supabase = createClient(supabaseUrl, supabaseKey);
