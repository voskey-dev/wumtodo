<script lang="ts">
import { onMount } from 'svelte';
import Card from '@/components/ui-svelte/card.svelte';
import CardContent from '@/components/ui-svelte/card-content.svelte';
import CardDescription from '@/components/ui-svelte/card-description.svelte';
import CardHeader from '@/components/ui-svelte/card-header.svelte';
import CardTitle from '@/components/ui-svelte/card-title.svelte';
import Badge from '@/components/ui-svelte/badge.svelte';
import Select from '@/components/ui-svelte/select.svelte';
import SelectContent from '@/components/ui-svelte/select-content.svelte';
import SelectItem from '@/components/ui-svelte/select-item.svelte';
import SelectTrigger from '@/components/ui-svelte/select-trigger.svelte';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Users } from 'lucide-svelte';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  team: {
    id: string;
    name: string;
  };
}

interface Props {
  userId: string;
}

const { userId }: Props = $props();

let tasks = $state<Task[]>([]);
let loading = $state(true);
let statusFilter = $state('all');
let sortBy = $state('updated_at');

async function fetchTasks() {
  try {
    const params = new URLSearchParams();
    params.append('assignee', userId);
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    params.append('sort', sortBy);
    params.append('order', 'desc');

    const response = await fetch(`/api/tasks?${params.toString()}`);
    if (response.ok) {
      const data = await response.json() as { tasks: Task[]; total: number };
      tasks = data.tasks;
    }
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  } finally {
    loading = false;
  }
}

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

onMount(() => {
  fetchTasks();
});

$effect(() => {
  // Re-fetch when filters change
  fetchTasks();
});
</script>

{#if loading}
  <Card>
    <CardContent class="p-8">
      <div class="text-center text-muted-foreground">読み込み中...</div>
    </CardContent>
  </Card>
{:else}
  <div class="space-y-4">
    <!-- フィルター -->
    <Card>
      <CardHeader>
        <CardTitle>担当タスク一覧</CardTitle>
        <CardDescription>あなたが担当しているすべてのタスク</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex gap-4 mb-4">
          <Select bind:value={statusFilter}>
            <SelectTrigger class="w-40">
              <span>{statusFilter === 'all' ? 'すべて' : statusFilter === 'todo' ? '未着手' : statusFilter === 'in_progress' ? '進行中' : '完了'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="todo">未着手</SelectItem>
              <SelectItem value="in_progress">進行中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>

          <Select bind:value={sortBy}>
            <SelectTrigger class="w-40">
              <span>{sortBy === 'updated_at' ? '更新日時' : sortBy === 'created_at' ? '作成日時' : sortBy === 'due_date' ? '期限' : '優先度'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">更新日時</SelectItem>
              <SelectItem value="created_at">作成日時</SelectItem>
              <SelectItem value="due_date">期限</SelectItem>
              <SelectItem value="priority">優先度</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {#if tasks.length === 0}
          <p class="text-center text-muted-foreground py-8">
            {statusFilter === 'all' 
              ? '担当しているタスクはありません' 
              : 'この条件に一致するタスクはありません'}
          </p>
        {:else}
          <div class="space-y-3">
            {#each tasks as task}
              {@const statusBadge = getStatusBadge(task.status)}
              {@const priorityBadge = getPriorityBadge(task.priority)}
              <div class="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <a href={`/tasks/${task.id}`} class="font-medium hover:underline">
                      {task.title}
                    </a>
                    {#if task.description}
                      <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    {/if}
                    <div class="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span class="flex items-center gap-1">
                        <Users class="w-3 h-3" />
                        {task.team.name}
                      </span>
                      {#if task.due_date}
                        <span class="flex items-center gap-1">
                          <Calendar class="w-3 h-3" />
                          期限: {format(new Date(task.due_date), 'yyyy/MM/dd', { locale: ja })}
                        </span>
                      {/if}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    {#if statusBadge.class}
                      <Badge class={statusBadge.class}>{statusBadge.text}</Badge>
                    {:else}
                      <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    {/if}
                    
                    <Badge variant={priorityBadge.variant}>{priorityBadge.text}</Badge>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
{/if}