# Website Generator

A platform for generating and deploying websites with AI.

## Setup

### Fly.io Configuration

To make the deployment work properly with Fly.io machines, you need the following `.env` configuration:

```
# Fly.io Configuration
FLY_API_TOKEN=your-fly-api-token
FLY_API_BASE=https://api.machines.dev
FLY_DEFAULT_APP=your-fly-app-name
FLY_ORG_SLUG=personal

# Set to "true" only if your token has permission to create apps
# If set to "false", all machines will be created under FLY_DEFAULT_APP
FLY_CREATE_APPS=false
```

### Troubleshooting

If you encounter a `403 unauthorized` error when creating machines or apps, it means your Fly.io API token doesn't have sufficient permissions. There are two solutions:

1. **Recommended Solution:** Set `FLY_CREATE_APPS=false` and use a pre-created app specified in `FLY_DEFAULT_APP`.
2. **Alternative Solution:** Generate a new Fly.io token with organization admin privileges if you need to create apps dynamically.

Your API token needs permissions to:

- Create and manage machines
- Create apps (if `FLY_CREATE_APPS=true`)
