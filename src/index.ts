import "reflect-metadata";
import "dotenv/config";
import { App } from "@slack/bolt";
import { SlackHandler } from "./handlers";
import { pullImages } from "./runners";
import logger from "./logger";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  extendedErrorHandler: true,
});

(async () => {
  logger.info("Pulling Docker images...");
  await pullImages();
  logger.info("Docker images pulled.");
  new SlackHandler(app).register();
  await app.start(process.env.PORT || 3000);
  logger.info("Slack code runner is running.");
})();
