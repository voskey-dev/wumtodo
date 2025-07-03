<script lang="ts">
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import CardDescription from '@/components/ui-svelte/card-description.svelte';
  import CardHeader from '@/components/ui-svelte/card-header.svelte';
  import CardTitle from '@/components/ui-svelte/card-title.svelte';
  import Button from '@/components/ui-svelte/button.svelte';
  import Badge from '@/components/ui-svelte/badge.svelte';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { Users, ExternalLink, Settings } from 'lucide-svelte';

  interface Team {
    id: string;
    name: string;
    discord_server_id: string;
    created_at: string;
    role: string;
    memberCount: number;
  }

  interface Props {
    teams: Team[];
    currentUserId: string;
  }

  const { teams, currentUserId }: Props = $props();

  function getRoleBadge(role: string) {
    if (role === 'admin') {
      return { class: 'bg-purple-100 text-purple-800', text: '管理者' };
    }
    return { class: 'bg-gray-100 text-gray-800', text: 'メンバー' };
  }
</script>

{#if teams.length === 0}
  <Card>
    <CardContent class="p-8 text-center">
      <p class="text-muted-foreground">
        まだチームに参加していません。
        Discordサーバーに参加すると、自動的にチームが表示されます。
      </p>
    </CardContent>
  </Card>
{:else}
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each teams as team (team.id)}
      {@const roleBadge = getRoleBadge(team.role)}
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>
                作成日: {format(new Date(team.created_at), 'yyyy年MM月dd日', { locale: ja })}
              </CardDescription>
            </div>
            <Badge class={roleBadge.class}>{roleBadge.text}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center text-sm text-muted-foreground">
              <Users class="w-4 h-4 mr-2" />
              <span>{team.memberCount} メンバー</span>
            </div>
            
            <div class="flex gap-2">
              <a 
                href={`https://discord.com/channels/${team.discord_server_id}`}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex"
              >
                <Button size="sm" variant="outline">
                  <ExternalLink class="w-4 h-4 mr-2" />
                  Discordで開く
                </Button>
              </a>
              
              {#if team.role === 'admin'}
                <a href={`/teams/${team.id}`} class="inline-flex">
                  <Button size="sm">
                    <Settings class="w-4 h-4 mr-2" />
                    管理
                  </Button>
                </a>
              {/if}
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
{/if}