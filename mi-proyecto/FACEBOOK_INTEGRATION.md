# Facebook Lead Ads Integration

## Setup Steps:

1. **Create Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create a new app with "Business" type
   - Add "Lead Ads" product

2. **Configure Webhook:**
   - In your app, go to Webhooks
   - Add webhook URL: `https://your-project.supabase.co/functions/v1/ingest-lead`
   - Subscribe to "leadgen" events
   - Fields: `id, created_time, field_data`

3. **Test Webhook:**
   - Use Facebook's test tool to send sample leads
   - Check Supabase function logs

## Payload Format from Facebook:

```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "leadgen_id": "LEAD_ID",
            "created_time": 1234567890,
            "page_id": "PAGE_ID",
            "form_id": "FORM_ID",
            "field_data": [
              {"name": "full_name", "values": ["John Doe"]},
              {"name": "phone_number", "values": ["+1234567890"]},
              {"name": "email", "values": ["john@example.com"]}
            ]
          }
        }
      ]
    }
  ]
}
```

## Mapping Facebook Fields:

- `full_name` → `name`
- `phone_number` → `phone`
- `email` → `email`
- `leadgen_id` → `externalLeadId`
- Form campaign info → `campaignName`

The edge function will handle the mapping and create leads automatically!