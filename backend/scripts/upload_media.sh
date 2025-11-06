#!/bin/bash

# This script uploads a media file to the /api/media/upload endpoint.
# Usage: ./upload_media.sh <file_path> [title]

FILE_PATH="$1"
TITLE="$2"

if [ -z "$FILE_PATH" ]; then
  echo "Usage: ./upload_media.sh <file_path> [title]"
  exit 1
fi

if [ -n "$TITLE" ]; then
  curl -X POST \
    -H "Content-Type: multipart/form-data" \
    -F "file=@$FILE_PATH" \
    -F "title=$TITLE" \
    http://localhost:3000/api/media/upload
else
  curl -X POST \
    -H "Content-Type: multipart/form-data" \
    -F "file=@$FILE_PATH" \
    http://localhost:3000/api/media/upload
fi
