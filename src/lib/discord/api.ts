import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordAPI {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<Response> {
    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bot ${this.botToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord API Error: ${response.status} - ${error}`);
    }

    return response;
  }

  async registerCommands(
    applicationId: string,
    commands: RESTPostAPIApplicationCommandsJSONBody[]
  ): Promise<void> {
    await this.request(
      'PUT',
      `/applications/${applicationId}/commands`,
      commands
    );
  }

  async createThread(
    channelId: string,
    name: string,
    messageContent?: string
  ): Promise<{ id: string; [key: string]: any }> {
    const response = await this.request(
      'POST',
      `/channels/${channelId}/threads`,
      {
        name,
        type: 11, // GUILD_PUBLIC_THREAD
        auto_archive_duration: 1440, // 24時間
      }
    );

    const thread = await response.json() as { id: string; [key: string]: any };

    // スレッドに最初のメッセージを投稿
    if (messageContent) {
      await this.request(
        'POST',
        `/channels/${thread.id}/messages`,
        { content: messageContent }
      );
    }

    return thread;
  }

  async sendMessage(channelId: string, content: string): Promise<any> {
    const response = await this.request(
      'POST',
      `/channels/${channelId}/messages`,
      { content }
    );

    return response.json();
  }

  async sendDirectMessage(userId: string, content: string): Promise<any> {
    // DMチャンネルを作成または取得
    const dmChannelResponse = await this.request(
      'POST',
      '/users/@me/channels',
      { recipient_id: userId }
    );

    const dmChannel = await dmChannelResponse.json() as { id: string };

    // メッセージを送信
    return this.sendMessage(dmChannel.id, content);
  }
}