import { commands } from '../src/lib/discord/commands.ts';
import { DiscordAPI } from '../src/lib/discord/api.ts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .dev.vars
const devVarsPath = join(__dirname, '..', 'wrangler.toml');
const devVars = readFileSync(devVarsPath, 'utf-8');
const envVars: { [key: string]: string } = {};

devVars.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replaceAll('"', '');
    }
  }
});

const token = envVars.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN;
const applicationId = envVars.DISCORD_APPLICATION_ID || process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID must be set');
  process.exit(1);
}

const api = new DiscordAPI(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await api.registerCommands(applicationId, commands);

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();