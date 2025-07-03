<script lang="ts">
import Card from '@/components/ui-svelte/card.svelte';
import CardContent from '@/components/ui-svelte/card-content.svelte';
import CardDescription from '@/components/ui-svelte/card-description.svelte';
import CardHeader from '@/components/ui-svelte/card-header.svelte';
import CardTitle from '@/components/ui-svelte/card-title.svelte';
import Badge from '@/components/ui-svelte/badge.svelte';
import Tabs from '@/components/ui-svelte/tabs.svelte';
import TabsContent from '@/components/ui-svelte/tabs-content.svelte';
import TabsList from '@/components/ui-svelte/tabs-list.svelte';
import TabsTrigger from '@/components/ui-svelte/tabs-trigger.svelte';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { User, Users, CheckCircle2, Clock, AlertCircle, Calendar, Shield } from 'lucide-svelte';
import TaskListByUser from './TaskListByUser.svelte';
import NotificationSettings from './NotificationSettings.svelte';

interface ProfileData {
  user: {
    id: string;
    username: string;
    discord_id: string;
    avatar_url: string | null;
    created_at: string;
    updatedAt: string;
  };
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
  stats: {
    todo: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  recentTasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    updated_at: string;
    team_name: string;
  }[];
}

interface Props {
  profile: ProfileData;
}

const { profile }: Props = $props();
const { user, teams, stats, recentTasks } = profile;

function getStatusBadge(status: string) {
  switch (status) {
    case 'todo':
      return { variant: 'secondary' as const, text: '未着手' };
    case 'in_progress':
      return { class: 'bg-blue-100 text-blue-800', text: '進行中' };
    case 'completed':
      return { class: 'bg-green-100 text-green-800', text: '完了' };
    default:
      return { variant: 'default' as const, text: status };
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'high':
      return { variant: 'destructive' as const, text: '高' };
    case 'medium':
      return { variant: 'default' as const, text: '中' };
    case 'low':
      return { variant: 'secondary' as const, text: '低' };
    default:
      return { variant: 'default' as const, text: priority };
  }
}
</script>

<div class="space-y-6">
  <!-- プロファイルヘッダー -->
  <Card>
    <CardContent class="p-6">
      <div class="flex items-start gap-4">
        {#if user.avatar_url}
          <img
            src={user.avatar_url}
            alt={user.username}
            class="w-20 h-20 rounded-full"
          />
        {:else}
          <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User class="w-10 h-10 text-muted-foreground" />
          </div>
        {/if}
        
        <div class="flex-1">
          <h1 class="text-2xl font-bold">{user.username}</h1>
          <p class="text-muted-foreground">Discord ID: {user.discord_id}</p>
          <div class="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- タスク統計 -->
  <div class="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>担当タスク</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{stats.total}</div>
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
        <div class="text-2xl font-bold">{stats.todo}</div>
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
        <div class="text-2xl font-bold">{stats.in_progress}</div>
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
        <div class="text-2xl font-bold">{stats.completed}</div>
      </CardContent>
    </Card>
  </div>

  <!-- タブコンテンツ -->
  <Tabs value="overview" class="space-y-4">
    <TabsList>
      <TabsTrigger value="overview">概要</TabsTrigger>
      <TabsTrigger value="tasks">担当タスク</TabsTrigger>
      <TabsTrigger value="notifications">通知設定</TabsTrigger>
    </TabsList>

    <TabsContent value="overview" class="space-y-4">
      <!-- 所属チーム -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            所属チーム
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            {#each teams as team}
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <span class="font-medium">{team.name}</span>
                <Badge class={
                  team.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }>
                  {#if team.role === 'admin'}
                    <Shield class="w-3 h-3 mr-1" />
                    管理者
                  {:else}
                    メンバー
                  {/if}
                </Badge>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>

      <!-- 最近のアクティビティ -->
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
          <CardDescription>最近更新されたタスク</CardDescription>
        </CardHeader>
        <CardContent>
          {#if recentTasks.length === 0}
            <p class="text-muted-foreground text-center py-4">
              まだアクティビティがありません
            </p>
          {:else}
            <div class="space-y-3">
              {#each recentTasks as task}
                {@const statusBadge = getStatusBadge(task.status)}
                {@const priorityBadge = getPriorityBadge(task.priority)}
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <a href={`/tasks/${task.id}`} class="font-medium hover:underline">
                      {task.title}
                    </a>
                    <div class="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{task.team_name}</span>
                      <span>
                        更新: {format(new Date(task.updated_at), 'MM/dd HH:mm', { locale: ja })}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    {#if statusBadge.class}
                      <Badge class={statusBadge.class}>{statusBadge.text}</Badge>
                    {:else}
                      <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    {/if}
                    
                    <Badge variant={priorityBadge.variant}>{priorityBadge.text}</Badge>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="tasks">
      <TaskListByUser userId={user.id} />
    </TabsContent>

    <TabsContent value="notifications">
      <NotificationSettings userId={user.id} />
    </TabsContent>
  </Tabs>
</div>