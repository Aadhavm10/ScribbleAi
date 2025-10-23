#!/bin/bash

# ScribbleAI - Google Cloud Setup Script
# Run this script to set up your GCP service account

set -e

# Replace with your GCP project ID
PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"

if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
  echo "❌ Error: Please set your GCP_PROJECT_ID environment variable"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./setup-gcp.sh"
  exit 1
fi

echo "🚀 Setting up Google Cloud for ScribbleAI..."
echo "Project ID: $PROJECT_ID"
echo ""

# Set project
echo "📌 Setting active project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs (this may take a few minutes)..."
gcloud services enable \
  aiplatform.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  logging.googleapis.com \
  bigquery.googleapis.com

# Create service account
echo "👤 Creating service account..."
gcloud iam service-accounts create scribbleai-backend \
  --display-name="ScribbleAI Backend Service Account" \
  --description="Service account for ScribbleAI backend to access Vertex AI and other GCP services"

# Grant necessary roles
echo "🔐 Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:scribbleai-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:scribbleai-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:scribbleai-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.accessor"

# Download service account key
echo "🔑 Downloading service account key..."
cd backend
gcloud iam service-accounts keys create gcp-service-account.json \
  --iam-account=scribbleai-backend@${PROJECT_ID}.iam.gserviceaccount.com

echo ""
echo "✅ Setup complete!"
echo ""
echo "Service account key saved to: backend/gcp-service-account.json"
echo ""
echo "⚠️  IMPORTANT: Never commit this file to git!"
echo ""
echo "Next steps:"
echo "1. Run: chmod +x setup-gcp.sh"
echo "2. Run: ./setup-gcp.sh"
echo "3. Tell me 'Done, start building'"

