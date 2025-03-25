
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xjwnqojroevhcimguown.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqd25xb2pyb2V2aGNpbWd1b3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjcxOTEsImV4cCI6MjA1NzgwMzE5MX0.hdOBBKgU9y-OcND4l_E0fnVkKSGGc95GDfCN5nQCGA4';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
