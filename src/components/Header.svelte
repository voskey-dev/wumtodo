<script lang="ts">
  import { onMount } from 'svelte';
  import LoginButton from '@/components/auth/LoginButton.svelte';
  import UserMenu from '@/components/auth/UserMenu.svelte';
  import { authClient } from '@/lib/auth-client';

  let isAuthenticated = $state(false);
  let loading = $state(true);

  onMount(async () => {
    try {
      const { data } = await authClient.getSession();
      isAuthenticated = !!data?.user;
    } catch (error) {
      // Auth check failed
    } finally {
      loading = false;
    }
  });
</script>

<header class="border-b">
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <a href="/" class="text-2xl font-bold">
        wumtodo
      </a>
      
      <nav class="flex items-center gap-6">
        {#if isAuthenticated}
          <a href="/tasks" class="text-sm font-medium hover:text-primary">
            タスク
          </a>
          <a href="/teams" class="text-sm font-medium hover:text-primary">
            チーム
          </a>
          <a href="/profile" class="text-sm font-medium hover:text-primary">
            プロファイル
          </a>
        {/if}
        {#if loading}
          <div class="animate-pulse h-10 w-32 bg-muted rounded"></div>
        {:else if isAuthenticated}
          <UserMenu />
        {:else}
          <LoginButton />
        {/if}
      </nav>
    </div>
  </div>
</header>