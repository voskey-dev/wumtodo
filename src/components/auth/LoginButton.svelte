<script lang="ts">
  import Button from '@/components/ui-svelte/button.svelte';
  import { authClient } from '@/lib/auth-client';

  async function handleLogin() {
    await authClient.signIn.social({
      provider: 'discord',
      callbackURL: '/',
    });
  }
</script>

<Button onclick={handleLogin} size="lg">
  Discordでログイン
</Button>