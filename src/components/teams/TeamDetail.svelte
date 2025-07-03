<script lang="ts">
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import CardDescription from '@/components/ui-svelte/card-description.svelte';
  import CardHeader from '@/components/ui-svelte/card-header.svelte';
  import CardTitle from '@/components/ui-svelte/card-title.svelte';
  import Button from '@/components/ui-svelte/button.svelte';
  import Badge from '@/components/ui-svelte/badge.svelte';
  import Alert from '@/components/ui-svelte/alert.svelte';
  import AlertDescription from '@/components/ui-svelte/alert-description.svelte';
  import Select from '@/components/ui-svelte/select.svelte';
  import SelectContent from '@/components/ui-svelte/select-content.svelte';
  import SelectItem from '@/components/ui-svelte/select-item.svelte';
  import SelectTrigger from '@/components/ui-svelte/select-trigger.svelte';
  import { buttonVariants } from '@/components/ui-svelte/button-variants';
  import { cn } from '@/lib/utils-svelte';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { Users, CheckCircle2, Clock, AlertCircle, Shield, User, ExternalLink } from 'lucide-svelte';
  import InviteInfo from './InviteInfo.svelte';

  interface TeamMember {
    id: string;
    username: string;
    avatar_url: string | null;
    discord_id: string;
    role: string;
  }

  interface TeamDetailProps {
    team: {
      id: string;
      name: string;
      discord_server_id: string;
      created_at: string;
      members: TeamMember[];
      stats: {
        todo: number;
        in_progress: number;
        completed: number;
        total: number;
      };
      currentUserRole: string;
    };
    currentUserId: string;
  }

  let { team, currentUserId }: TeamDetailProps = $props();
  
  let members = $state(team.members);
  let isUpdating = $state<string | null>(null);
  let error = $state('');
  
  let isAdmin = $derived(team.currentUserRole === 'admin');

  async function handleRoleChange(userId: string, newRole: string) {
    if (userId === currentUserId && newRole !== 'admin') {
      error = '自分の管理者権限を削除することはできません';
      return;
    }

    isUpdating = userId;
    error = '';

    try {
      const response = await fetch(`/api/teams/${team.id}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        members = members.map(m => 
          m.id === userId ? { ...m, role: newRole } : m
        );
      } else {
        const data = await response.json() as { error?: string };
        error = data.error || 'ロールの更新に失敗しました';
      }
    } catch (err) {
      error = 'ロールの更新に失敗しました';
    } finally {
      isUpdating = null;
    }
  }

  async function handleRemoveMember(userId: string) {
    if (userId === currentUserId) {
      error = '自分をチームから削除することはできません';
      return;
    }

    if (!confirm('このメンバーをチームから削除してもよろしいですか？')) {
      return;
    }

    isUpdating = userId;
    error = '';

    try {
      const response = await fetch(`/api/teams/${team.id}/members/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        members = members.filter(m => m.id !== userId);
      } else {
        const data = await response.json() as { error?: string };
        error = data.error || 'メンバーの削除に失敗しました';
      }
    } catch (err) {
      error = 'メンバーの削除に失敗しました';
    } finally {
      isUpdating = null;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold">{team.name}</h1>
    <p class="text-muted-foreground mt-2">
      作成日: {format(new Date(team.created_at), 'yyyy年MM月dd日', { locale: ja })}
    </p>
  </div>

  <!-- タスク統計 -->
  <div class="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>全タスク</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{team.stats.total}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="pb-2">
        <CardDescription class="flex items-center gap-1">
          <Clock class="w-4 h-4" />
          未着手
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{team.stats.todo}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="pb-2">
        <CardDescription class="flex items-center gap-1">
          <AlertCircle class="w-4 h-4" />
          進行中
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{team.stats.in_progress}</div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="pb-2">
        <CardDescription class="flex items-center gap-1">
          <CheckCircle2 class="w-4 h-4" />
          完了
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{team.stats.completed}</div>
      </CardContent>
    </Card>
  </div>

  <!-- エラー表示 -->
  {#if error}
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  {/if}

  <!-- メンバー一覧 -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Users class="w-5 h-5" />
        チームメンバー ({members.length})
      </CardTitle>
      <CardDescription>
        {isAdmin ? 'メンバーの権限を管理できます' : 'チームメンバーの一覧'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        {#each members as member (member.id)}
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center gap-3">
              {#if member.avatar_url}
                <img
                  src={member.avatar_url}
                  alt={member.username}
                  class="w-10 h-10 rounded-full"
                />
              {:else}
                <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User class="w-5 h-5 text-muted-foreground" />
                </div>
              {/if}
              <div>
                <div class="font-medium">{member.username}</div>
                <div class="text-sm text-muted-foreground">
                  Discord ID: {member.discord_id}
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              {#if isAdmin && member.id !== currentUserId}
                <Select
                  selected={{ value: member.role, label: member.role }}
                  onSelectedChange={(v) => v && handleRoleChange(member.id, v.value)}
                  disabled={isUpdating === member.id}
                >
                  <SelectTrigger class="w-32">
                    <span>
                      {member.role === 'admin' ? '管理者' : 'メンバー'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="member">メンバー</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onclick={() => handleRemoveMember(member.id)}
                  disabled={isUpdating === member.id}
                >
                  削除
                </Button>
              {:else}
                <Badge class={member.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'}>
                  {#if member.role === 'admin'}
                    <Shield class="w-3 h-3 mr-1" />
                    管理者
                  {:else}
                    メンバー
                  {/if}
                </Badge>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Discord リンク -->
  <Card>
    <CardContent class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">Discord サーバー</h3>
          <p class="text-sm text-muted-foreground mt-1">
            メンバーの追加はDiscordサーバーで行います
          </p>
        </div>
        <a
          href={`https://discord.com/channels/${team.discord_server_id}`}
          target="_blank"
          rel="noopener noreferrer"
          class={cn(buttonVariants({ variant: "outline" }))}
        >
          <ExternalLink class="w-4 h-4 mr-2" />
          Discordで開く
        </a>
      </div>
    </CardContent>
  </Card>

  <!-- メンバー招待情報（管理者のみ） -->
  {#if isAdmin}
    <InviteInfo />
  {/if}
</div>