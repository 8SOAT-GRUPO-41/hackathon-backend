# Hackathon Backend

## Environment Variables

To run the application with SQS consumer functionality, you need to set the following environment variables:

```
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# SQS
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/your-account-id/your-queue-name

# Logging
LOG_LEVEL=info
```

## SQS Consumer

The application includes an SQS consumer that automatically starts when the application runs. It continuously polls an SQS queue for messages, processes them, and logs the contents.

To customize the SQS consumer behavior, you can modify the `SQSConsumer` class in `src/infrastructure/consumers/sqs-consumer.ts`.

## Running the Application

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Run in production mode
yarn start
``` 