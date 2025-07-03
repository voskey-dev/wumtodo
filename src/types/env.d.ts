/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_SECRET: string;
        DISCORD_BOT_TOKEN: string;
        DISCORD_APPLICATION_ID: string;
        DISCORD_PUBLIC_KEY: string;
        BETTER_AUTH_SECRET: string;
        PUBLIC_SITE_URL: string;
      };
    };
    user?: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}