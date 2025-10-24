#!/usr/bin/env bash
set -euo pipefail

# Configurable settings (override via env when calling)
PROJECT_ID="${PROJECT_ID:-scribble-472402}"
REGION="${REGION:-us-central1}"
REPO="${REPO:-scribbly-repo}"
SERVICE_NAME="${SERVICE_NAME:-scribbly-backend}"
ENV_FILE="${ENV_FILE:-.env}"

echo "Using project: $PROJECT_ID, region: $REGION, repo: $REPO, service: $SERVICE_NAME"

# Load backend/.env to populate required variables
if [[ -f "$ENV_FILE" ]]; then
  echo "Loading env from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "WARN: $ENV_FILE not found. Ensure required env vars are exported in your shell."
fi

required=(
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GCP_PROJECT_ID
  VERTEX_AI_LOCATION
  ELASTICSEARCH_URL
  ELASTICSEARCH_API_KEY
  DATABASE_URL
  DIRECT_URL
  TOKEN_ENCRYPTION_KEY
)
for k in "${required[@]}"; do
  if [[ -z "${!k:-}" ]]; then
    echo "ERROR: Missing required env var: $k (set in $ENV_FILE or export before running)" >&2
    exit 1
  fi
done

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Ensure Artifact Registry repo exists
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Scribbly backend images" || true

IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/backend:latest"

# Build and push image (from backend directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building and pushing image: $IMAGE_URI"
gcloud builds submit "$BACKEND_DIR" --tag "$IMAGE_URI"

echo "Deploying to Cloud Run: $SERVICE_NAME"
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_URI" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 3002 \
  --set-env-vars "NODE_ENV=production,PORT=3002,SKIP_PRISMA=false,GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,GCP_PROJECT_ID=$GCP_PROJECT_ID,VERTEX_AI_LOCATION=$VERTEX_AI_LOCATION,ELASTICSEARCH_URL=$ELASTICSEARCH_URL,ELASTICSEARCH_API_KEY=$ELASTICSEARCH_API_KEY,DATABASE_URL=$DATABASE_URL,DIRECT_URL=$DIRECT_URL,TOKEN_ENCRYPTION_KEY=$TOKEN_ENCRYPTION_KEY"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "Deployed: $SERVICE_URL"
echo "Tip: Update frontend NEXT_PUBLIC_API_URL to $SERVICE_URL"


