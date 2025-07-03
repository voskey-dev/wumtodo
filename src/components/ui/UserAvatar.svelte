<script lang="ts">
  import { cn } from '@/lib/utils-svelte';
  import Avatar from '@/components/ui/avatar/avatar.svelte';
  import AvatarImage from '@/components/ui/avatar/avatar-image.svelte';
  import AvatarFallback from '@/components/ui/avatar/avatar-fallback.svelte';
  import { User } from 'lucide-svelte';
  
  interface Props {
    user: {
      id: string;
      username: string;
      avatar_url?: string | null;
    } | null | undefined;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    className?: string;
  }
  
  let { 
    user, 
    size = 'md', 
    showName = true,
    className = ''
  }: Props = $props();
  
  const sizeClasses = {
    sm: { avatar: 'h-6 w-6', icon: 'h-3 w-3', text: 'text-sm' },
    md: { avatar: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-base' },
    lg: { avatar: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-lg' }
  };
  
  const classes = sizeClasses[size];
</script>

{#if user}
  <div class={cn('flex items-center gap-2', className)}>
    <Avatar class={classes.avatar}>
      {#if user.avatar_url}
        <AvatarImage src={user.avatar_url} alt={user.username} />
      {/if}
      <AvatarFallback class="bg-muted">
        {user.username}
      </AvatarFallback>
    </Avatar>
    {#if showName}
      <span class={cn('font-medium', classes.text)}>{user.username}</span>
    {/if}
  </div>
{:else}
  <div class={cn('flex items-center gap-2 text-muted-foreground', className)}>
    <div class={cn('flex items-center justify-center rounded-full bg-muted', classes.avatar)}>
      <User class={classes.icon} />
    </div>
    {#if showName}
      <span class={classes.text}>未割当</span>
    {/if}
  </div>
{/if}