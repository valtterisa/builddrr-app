## Architecture

```
User Action → Supabase (Service Limits) → Polar.sh (Billing - PAID ONLY)
     ↓              ↓                        ↓
  Check if      Track usage &         Track usage for
  allowed       enforce limits        billing purposes
                (ALL plans)          (pro/enterprise only)
```

## Quick Start

### 1. Environment Variables

```bash
# Polar API Configuration (only needed for paid plans)
POLAR_API_KEY=your_polar_api_key_here
NEXT_PUBLIC_POLAR_API_URL=https://api.polar.sh

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Track Usage

```typescript
import { trackUsageAuto } from "@/lib/polar-usage-tracker";

// Automatically tracks in both systems (Polar only for paid plans)
const result = await trackUsageAuto("chat", estimatedTokens, websiteId);

if (result.success) {
  console.log("Supabase tracked:", result.supabaseTracked);
  console.log("Polar tracked:", result.polarTracked); // false for free plan users
}
```
