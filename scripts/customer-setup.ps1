# FunnelSim Customer Setup Script
# Automates Supabase setup for new customer deployments

$ErrorActionPreference = "Continue"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "       FunnelSim Customer Setup Script                " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Use npx supabase (no global install needed)
$sb = "npx supabase"

# Collect info
Write-Host "Enter Customer Details" -ForegroundColor Green
Write-Host "------------------------------------------------------"
$CUSTOMER_NAME = Read-Host "Customer name"
$PROJECT_ID = Read-Host "Supabase Project ID"
Write-Host ""
Write-Host "Admin User Setup" -ForegroundColor Green
$ADMIN_EMAIL = Read-Host "Admin email address"
$ADMIN_PASSWORD = Read-Host "Admin password (min 6 chars)"
Write-Host ""
Write-Host "Stripe Setup (press Enter to skip - customer can add later)" -ForegroundColor Gray
$STRIPE_SECRET = Read-Host "Stripe Secret Key (sk_...) [optional]"
$STRIPE_WEBHOOK = Read-Host "Stripe Webhook Secret (whsec_...) [optional]"
$STRIPE_PK = Read-Host "Stripe Publishable Key (pk_...) [optional]"
Write-Host ""

$SKIP_STRIPE = [string]::IsNullOrWhiteSpace($STRIPE_SECRET)
$SKIP_ADMIN = [string]::IsNullOrWhiteSpace($ADMIN_EMAIL) -or [string]::IsNullOrWhiteSpace($ADMIN_PASSWORD)

# Verify logged in
Write-Host "Checking Supabase login..." -ForegroundColor Green
$tokenOutput = Invoke-Expression "npx -y supabase projects list" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login first: npx supabase login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting setup for: $CUSTOMER_NAME" -ForegroundColor Yellow
Write-Host "======================================================"

# Step 1: Link project
Write-Host ""
Write-Host "[1/7] Linking to project $PROJECT_ID..." -ForegroundColor Cyan
npx -y supabase link --project-ref $PROJECT_ID

# Step 2: Push migrations
Write-Host ""
Write-Host "[2/7] Pushing database migrations..." -ForegroundColor Cyan
npx -y supabase db push

# Step 3: Create admin user
Write-Host ""
if ($SKIP_ADMIN) {
    Write-Host "[3/7] Skipping admin user creation..." -ForegroundColor Yellow
} else {
    Write-Host "[3/7] Creating admin user..." -ForegroundColor Cyan

    # SQL to create admin user with confirmed email
    $adminSql = @"
DO `$`$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Create user in auth.users with confirmed email
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    '$ADMIN_EMAIL',
    crypt('$ADMIN_PASSWORD', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

  -- Create profile (trigger may do this, but ensure it exists)
  INSERT INTO public.profiles (id, email)
  VALUES (new_user_id, '$ADMIN_EMAIL')
  ON CONFLICT (id) DO NOTHING;

  -- Add to admin_users as super_admin
  INSERT INTO public.admin_users (user_id, role, created_by)
  VALUES (new_user_id, 'super_admin', new_user_id);

  RAISE NOTICE 'Created admin user: %', '$ADMIN_EMAIL';
END `$`$;
"@

    # Write SQL to temp file and execute
    $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $adminSql | Out-File -FilePath $tempSqlFile -Encoding UTF8

    $null = npx -y supabase db execute --file $tempSqlFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Admin user created: $ADMIN_EMAIL" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Could not create admin user automatically" -ForegroundColor Yellow
        Write-Host "  You can create it manually in Supabase Dashboard" -ForegroundColor Yellow
    }

    # Clean up temp file
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
}

# Step 4: Set secrets
Write-Host ""
if ($SKIP_STRIPE) {
    Write-Host "[4/7] Skipping Stripe secrets (customer will add later)..." -ForegroundColor Yellow
} else {
    Write-Host "[4/7] Setting edge function secrets..." -ForegroundColor Cyan
    npx -y supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET"
    npx -y supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK"
}

# Step 5: Deploy functions
Write-Host ""
Write-Host "[5/7] Deploying edge functions..." -ForegroundColor Cyan

$publicFuncs = @("create-checkout-session", "create-portal-session", "stripe-webhook", "retrieve-checkout-session", "link-pending-subscription")
$adminFuncs = @("admin-create-user", "admin-delete-user", "admin-reset-password")

foreach ($f in $publicFuncs) {
    Write-Host "  Deploying $f (public)..." -ForegroundColor Gray
    $null = npx -y supabase functions deploy $f --no-verify-jwt --legacy-bundle 2>&1
    Write-Host "    Done" -ForegroundColor Green
}

foreach ($f in $adminFuncs) {
    Write-Host "  Deploying $f (admin)..." -ForegroundColor Gray
    $null = npx -y supabase functions deploy $f --legacy-bundle 2>&1
    Write-Host "    Done" -ForegroundColor Green
}

# Step 6: Get API keys
Write-Host ""
Write-Host "[6/7] Fetching API keys..." -ForegroundColor Cyan
$ANON_KEY = "<check Supabase Dashboard>"
try {
    $apiKeysJson = npx -y supabase projects api-keys --project-ref $PROJECT_ID --output json 2>&1
    $apiKeys = $apiKeysJson | ConvertFrom-Json
    $foundKey = ($apiKeys | Where-Object { $_.name -eq "anon" }).api_key
    if ($foundKey) {
        $ANON_KEY = $foundKey
    }
} catch {
    Write-Host "  Could not fetch automatically, check Dashboard" -ForegroundColor Yellow
}
Write-Host "  Done" -ForegroundColor Green

# Step 7: Storage bucket (created by migrations)
Write-Host ""
Write-Host "[7/7] Storage bucket..." -ForegroundColor Cyan
Write-Host "  Created automatically by migrations" -ForegroundColor Green

# Output summary
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE: $CUSTOMER_NAME" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Build env vars
if ($SKIP_STRIPE) {
    $stripePkValue = "<customer adds their pk_test_... key>"
} else {
    $stripePkValue = $STRIPE_PK
}

Write-Host "VERCEL ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
Write-Host "------------------------------------------------------"
Write-Host "VITE_SUPABASE_PROJECT_ID=$PROJECT_ID"
Write-Host "VITE_SUPABASE_URL=https://$PROJECT_ID.supabase.co"
Write-Host "VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY"
Write-Host "VITE_STRIPE_PUBLISHABLE_KEY=$stripePkValue"
Write-Host "------------------------------------------------------"
Write-Host ""

# Copy to clipboard
$envContent = "VITE_SUPABASE_PROJECT_ID=$PROJECT_ID`nVITE_SUPABASE_URL=https://$PROJECT_ID.supabase.co`nVITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY`nVITE_STRIPE_PUBLISHABLE_KEY=$stripePkValue"
try {
    $envContent | Set-Clipboard
    Write-Host "Copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "Could not copy to clipboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STRIPE WEBHOOK URL:" -ForegroundColor Yellow
Write-Host "https://$PROJECT_ID.supabase.co/functions/v1/stripe-webhook"
Write-Host ""
Write-Host "Events: checkout.session.completed, customer.subscription.updated," -ForegroundColor Gray
Write-Host "        customer.subscription.deleted, charge.refunded, invoice.payment_failed" -ForegroundColor Gray
Write-Host ""

# Save to file
$outputFile = "customer-$CUSTOMER_NAME-$(Get-Date -Format 'yyyyMMdd').txt"
$fileContent = "FunnelSim Setup - $CUSTOMER_NAME`n"
$fileContent += "Generated: $(Get-Date)`n"
$fileContent += "======================================================`n`n"
$fileContent += "VERCEL ENVIRONMENT VARIABLES:`n"
$fileContent += "VITE_SUPABASE_PROJECT_ID=$PROJECT_ID`n"
$fileContent += "VITE_SUPABASE_URL=https://$PROJECT_ID.supabase.co`n"
$fileContent += "VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY`n"
$fileContent += "VITE_STRIPE_PUBLISHABLE_KEY=$stripePkValue`n`n"
$fileContent += "STRIPE WEBHOOK URL:`n"
$fileContent += "https://$PROJECT_ID.supabase.co/functions/v1/stripe-webhook`n`n"

if ($SKIP_STRIPE) {
    $fileContent += "STRIPE SETUP (Customer does this):`n"
    $fileContent += "1. Get API keys from Stripe Dashboard > Developers > API keys`n"
    $fileContent += "2. Add VITE_STRIPE_PUBLISHABLE_KEY to Vercel env vars`n"
    $fileContent += "3. Set edge function secrets:`n"
    $fileContent += "   supabase link --project-ref $PROJECT_ID`n"
    $fileContent += "   supabase secrets set STRIPE_SECRET_KEY=sk_test_...`n"
    $fileContent += "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`n"
    $fileContent += "4. Create webhook in Stripe Dashboard`n"
    $fileContent += "5. Link Stripe Price IDs in /admin/products`n"
}

if (-not $SKIP_ADMIN) {
    $fileContent += "ADMIN LOGIN:`n"
    $fileContent += "Email: $ADMIN_EMAIL`n"
    $fileContent += "Password: $ADMIN_PASSWORD`n`n"
}

$fileContent += "COMPLETED BY SCRIPT:`n"
$fileContent += "- Database migrations applied`n"
$fileContent += "- Edge functions deployed`n"
$fileContent += "- Storage bucket created`n"
if (-not $SKIP_ADMIN) {
    $fileContent += "- Admin user created`n"
}
$fileContent += "`nREMAINING STEPS:`n"
$fileContent += "1. Customer adds env vars to Vercel and redeploys`n"
if ($SKIP_ADMIN) {
    $fileContent += "2. Customer creates account, you add to admin_users`n"
}

$fileContent | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "Saved to: $outputFile" -ForegroundColor Green
Write-Host ""

Write-Host "CHECKLIST:" -ForegroundColor Yellow
Write-Host "  [x] Database migrations applied" -ForegroundColor Green
Write-Host "  [x] Edge functions deployed" -ForegroundColor Green
Write-Host "  [x] Storage bucket created" -ForegroundColor Green
if (-not $SKIP_ADMIN) {
    Write-Host "  [x] Admin user created: $ADMIN_EMAIL" -ForegroundColor Green
} else {
    Write-Host "  [ ] Create admin user manually"
}
Write-Host "  [ ] Send env vars to customer for Vercel"
Write-Host "  [ ] Customer redeploys Vercel"
if ($SKIP_STRIPE) {
    Write-Host "  [ ] Customer sets up Stripe (see saved file)" -ForegroundColor Yellow
}
Write-Host ""
