# slack-code-runner
Self-hosted Slack bot to run your code snippets

## Prerequisites
- Docker

## Usage
1. Create a new Slack app and add it to your workspace. You can use `manifest.yml` to create the app.
2. Create .env file with the following variables:
- SLACK_SIGNING_SECRET
- SLACK_APP_TOKEN
- SLACK_BOT_TOKEN
3. Run `docker-compose up -d` to start the bot.
