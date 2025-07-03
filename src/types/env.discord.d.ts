/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DISCORD_PUBLIC_KEY: string;
        DISCORD_APPLICATION_ID: string;
        DISCORD_BOT_TOKEN: string;
      };
    };
  }
}