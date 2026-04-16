# Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

# Deploy Supabase Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy ingest-lead
   supabase functions deploy send-welcome-email
   ```

5. Configure email settings in Supabase:
   - Go to Authentication > Email Templates
   - Customize confirmation and password reset emails
   - Set up SMTP if needed (optional, Supabase provides basic email)

6. Set environment variables in Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (for email functions)

7. Update vercel.json with your actual Supabase URL and anon key

6. Set environment variables in Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

7. For Facebook webhooks, set verify token in the function code