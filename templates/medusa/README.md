# Deploying Medusa JS along with Meilisearch and Minio instances

After customizing your settings and start the template some post-configurations are needed.

## Create an admin user

If you enabled the admin, it will be available at https://example.com/backoffice

```
npx medusa user -e <username> -p <password>
```

## Configure Minio

1. Go to the Minio Console page.
2. Create a new bucket with public access permissions.
3. Create an access token.
4. Fill the MINIO_BUCKET, MINIO_ACCESS_KEY, MINIO_SECRET_KEY variables accordingly.

## Configure Melisearch

1. With your Meilisearch master key generate a new API key with:

```
curl \
  -X POST 'https://search.example.com/keys' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <MEILISEARCH_MASTER_KEY>' \
  --data-binary '{
    "description": "Search products",
    "actions": ["search"],
    "indexes": ["products"],
    "expiresAt": "2024-01-07T00:00:00Z"
  }'
```

The response will contain the API key:

```
{"name":null,"description":"Search products","key":"<MEILISEARCH_API_KEY>","uid":"95eaa597-f501-46fd-8378-4db4276bed51","actions":["search"],"indexes":["products"],"expiresAt":"2024-01-07T00:00:00Z","createdAt":"2024-01-06T21:12:07.212379672Z","updatedAt":"2024-01-06T21:12:07.212379672Z"}
```

2. Set your Meilisearch api key in your Storefront config (NEXT_PUBLIC_SEARCH_API_KEY variable). Note that the backend uses the master key, not the api key.
