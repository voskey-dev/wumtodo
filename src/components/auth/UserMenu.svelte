<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '@/components/ui-svelte/button.svelte';
  import { authClient } from '@/lib/auth-client';
  import DropdownMenu from '@/components/ui-svelte/dropdown-menu.svelte';
  import DropdownMenuContent from '@/components/ui-svelte/dropdown-menu-content.svelte';
  import DropdownMenuItem from '@/components/ui-svelte/dropdown-menu-item.svelte';
  import DropdownMenuSeparator from '@/components/ui-svelte/dropdown-menu-separator.svelte';
  import DropdownMenuTrigger from '@/components/ui-svelte/dropdown-menu-trigger.svelte';
  import { User, LogOut, ChevronDown } from 'lucide-svelte';

  let user = $state<any>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        user = data.user;
      }
    } catch (error) {
      // Session check failed
    } finally {
      loading = false;
    }
  });

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        }
      }
    });
  }
</script>

{#if loading}
  <div class="animate-pulse h-10 w-32 bg-muted rounded"></div>
{:else if user}
  <DropdownMenu>
    <DropdownMenuTrigger asChild={true}>
      <Button variant="ghost" className="flex items-center gap-2">
        {#if user.image}
          <img
            src={user.image}
            alt={user.name || 'User'}
            class="w-8 h-8 rounded-full"
          />
        {:else}
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User class="w-4 h-4" />
          </div>
        {/if}
        <span class="text-sm font-medium">{user.name || user.email}</span>
        <ChevronDown class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem asChild={true}>
        <a href="/profile" class="flex items-center cursor-pointer w-full">
          <User class="w-4 h-4 mr-2" />
          プロファイル
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onclick={handleLogout} className="cursor-pointer">
        <LogOut class="w-4 h-4 mr-2" />
        ログアウト
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
{/if}