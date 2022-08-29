import {
  App,
  Middleware,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { LANG_CODES } from "./constants";
import { run } from "./runners";

type CommandMetadata = {
  commandName: string;
  handler: Middleware<SlackCommandMiddlewareArgs>;
};

function handleCommand(commandName: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!Reflect.hasMetadata("commands", target)) {
      Reflect.defineMetadata("commands", [], target);
    }
    const commands = Reflect.getMetadata("commands", target);
    commands.push({
      commandName,
      handler: descriptor.value,
    });
    Reflect.defineMetadata("commands", commands, target);
  };
}

type EventMetadata = {
  eventType: string;
  handler: Middleware<SlackEventMiddlewareArgs>;
};

function handleEvent(eventType: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!Reflect.hasMetadata("events", target)) {
      Reflect.defineMetadata("events", [], target);
    }
    const events = Reflect.getMetadata("events", target);
    events.push({
      eventType,
      handler: descriptor.value,
    });
    Reflect.defineMetadata("events", events, target);
  };
}
const usageExample = '@Code Runner py\n```print("Hello World")\n```';

export class SlackHandler {
  constructor(private readonly app: App) {}

  register() {
    const commands: CommandMetadata[] = Reflect.getMetadata("commands", this);
    commands.forEach(({ commandName, handler }) => {
      this.app.command(commandName, handler.bind(this));
    });
    const events: EventMetadata[] = Reflect.getMetadata("events", this);
    events.forEach(({ eventType, handler }) => {
      this.app.event(eventType, handler.bind(this));
    });
  }

  @handleCommand("/runner-health")
  async handleRunCommand({ ack, body, respond }: SlackCommandMiddlewareArgs) {
    await ack();
    await respond({
      text: `Hello, ${body.user_name}! You said: ${body.text}`,
    });
  }

  @handleEvent("app_mention")
  async handleAppMention({
    event,
    say,
  }: SlackEventMiddlewareArgs<"app_mention">) {
    const sendReply = (text: string) => {
      if (text.length > 3000) {
        text = "Output truncated.\n" + text.slice(0, 3000);
      }
      return say({
        text,
        thread_ts: event.thread_ts,
      });
    }

    const langCode = event.text
      .split(/ +/)[1]
      ?.split("\n")[0]
      ?.trim()
      .toLowerCase();
    if (!langCode) {
      await sendReply(`Please specify a language. Usage:\n${usageExample}`);
      return;
    }

    if (!Object.keys(LANG_CODES).includes(langCode)) {
      await sendReply(`Sorry, I don't know how to run ${langCode} code.`);
      return;
    }

    const language = LANG_CODES[langCode as keyof typeof LANG_CODES];

    const code = event.text.match(/```(.*)```/s)?.[1];
    if (!code) {
      await sendReply(`Please provide code to run. Usage:\n${usageExample}`);
      return;
    }
    const result = await run(language, code, sendReply);
    if (result.length) {
      await sendReply(result);
    } else {
      await sendReply("No output.");
    }
  }
}
