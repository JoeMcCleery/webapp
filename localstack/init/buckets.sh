#!/usr/bin/env bash

# # List buckets and pipe the results to a loop
# awslocal s3 ls | while read -r bucket; do
#   # Extract bucket name from the output
#   bucket_name=$(echo "$bucket" | awk '{print $3}')

#   # Check if bucket name is valid (not an empty string)
#   if [[ -n "$bucket_name" ]]; then
#     # Delete the bucket
#     awslocal s3 rb s3://$bucket_name --force
#     echo "Deleted bucket: $bucket_name"
#   fi
# done

# Create s3 bucket
awslocal s3 mb s3://$S3_BUCKET --region $AWS_DEFAULT_REGION

# List s3 buckets
awslocal s3 ls