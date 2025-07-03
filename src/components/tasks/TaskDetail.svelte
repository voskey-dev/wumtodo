<script lang="ts">
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import CardDescription from '@/components/ui-svelte/card-description.svelte';
  import CardHeader from '@/components/ui-svelte/card-header.svelte';
  import CardTitle from '@/components/ui-svelte/card-title.svelte';
  import Button from '@/components/ui-svelte/button.svelte';
  import Badge from '@/components/ui-svelte/badge.svelte';
  import Textarea from '@/components/ui-svelte/textarea.svelte';
  import Select from '@/components/ui-svelte/select.svelte';
  import SelectContent from '@/components/ui-svelte/select-content.svelte';
  import SelectItem from '@/components/ui-svelte/select-item.svelte';
  import SelectTrigger from '@/components/ui-svelte/select-trigger.svelte';
  import UserAvatar from '@/components/ui/UserAvatar.svelte';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { Calendar, MessageSquare, User, Clock } from 'lucide-svelte';

  interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    discordThreadId: string | null;
    discordChannelId: string | null;
    assignee: {
      id: string;
      username: string;
      avatar_url: string | null;
    } | null;
    creator: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    team: {
      id: string;
      name: string;
      discordServerId: string;
    };
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      user: {
        id: string;
        username: string;
        avatar_url: string | null;
      };
    }>;
  }

  interface Props {
    task: Task;
    currentUserId: string;
  }

  let { task, currentUserId }: Props = $props();

  let isEditing = $state(false);
  let editData = $state({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
  });
  let newComment = $state('');
  let isSubmitting = $state(false);

  const statusVariants = {
    todo: { label: '未着手', className: 'bg-gray-100 text-gray-800' },
    in_progress: { label: '進行中', className: 'bg-blue-100 text-blue-800' },
    completed: { label: '完了', className: 'bg-green-100 text-green-800' },
  };

  const priorityVariants = {
    high: { label: '高', className: 'bg-red-100 text-red-800' },
    medium: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
    low: { label: '低', className: 'bg-blue-100 text-blue-800' },
  };

  const getStatusBadge = (status: Task['status']) => {
    const variant = statusVariants[status];
    return { label: variant.label, className: variant.className };
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const variant = priorityVariants[priority];
    return { label: variant.label, className: variant.className };
  };

  const statusBadge = $derived(getStatusBadge(isEditing ? editData.status : task.status));
  const priorityBadge = $derived(getPriorityBadge(isEditing ? editData.priority : task.priority));

  const handleUpdate = async () => {
    isSubmitting = true;
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Failed to update task
    } finally {
      isSubmitting = false;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    isSubmitting = true;
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Failed to add comment
    } finally {
      isSubmitting = false;
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // キャンセル時は元のデータに戻す
      editData = {
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
      };
    }
    isEditing = !isEditing;
  };
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <a href="/tasks" class="text-muted-foreground hover:text-foreground">
      ← タスク一覧に戻る
    </a>
    {#if task.discordThreadId}
      <Button variant="outline" size="sm">
        <a 
          href={`https://discord.com/channels/${task.team.discordServerId}/${task.discordThreadId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageSquare class="w-4 h-4 mr-2" />
          Discordで開く
        </a>
      </Button>
    {/if}
  </div>

  <Card>
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="space-y-1 flex-1">
          {#if isEditing}
            <input
              type="text"
              bind:value={editData.title}
              class="text-2xl font-bold w-full border-b-2 border-primary px-1 py-1"
            />
          {:else}
            <CardTitle class="text-2xl">{task.title}</CardTitle>
          {/if}
          <CardDescription>
            ID: {task.id} | チーム: {task.team.name}
          </CardDescription>
        </div>
        <div class="flex gap-2">
          {#if isEditing}
            <Button size="sm" onclick={handleUpdate} disabled={isSubmitting}>
              保存
            </Button>
            <Button size="sm" variant="outline" onclick={handleEditToggle}>
              キャンセル
            </Button>
          {:else}
            <Button size="sm" variant="outline" onclick={handleEditToggle}>
              編集
            </Button>
          {/if}
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <div class="text-sm text-muted-foreground">ステータス</div>
          {#if isEditing}
            <Select bind:value={editData.status}>
              <SelectTrigger>
                <span>
                  {editData.status === 'todo' ? '未着手' : editData.status === 'in_progress' ? '進行中' : '完了'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">未着手</SelectItem>
                <SelectItem value="in_progress">進行中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
              </SelectContent>
            </Select>
          {:else}
            <Badge class={statusBadge.className}>{statusBadge.label}</Badge>
          {/if}
        </div>

        <div class="space-y-2">
          <div class="text-sm text-muted-foreground">優先度</div>
          {#if isEditing}
            <Select bind:value={editData.priority}>
              <SelectTrigger>
                <span>
                  {editData.priority === 'high' ? '高' : editData.priority === 'medium' ? '中' : '低'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          {:else}
            <Badge class={priorityBadge.className}>{priorityBadge.label}</Badge>
          {/if}
        </div>

        <div class="space-y-2">
          <div class="text-sm text-muted-foreground flex items-center gap-1">
            <User class="w-3 h-3" />
            担当者
          </div>
          <UserAvatar user={task.assignee} size="sm" showName={true} />
        </div>

        <div class="space-y-2">
          <div class="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar class="w-3 h-3" />
            期限
          </div>
          <div>
            {#if task.dueDate}
              {format(new Date(task.dueDate), 'yyyy年MM月dd日', { locale: ja })}
            {:else}
              <span class="text-muted-foreground">未設定</span>
            {/if}
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">説明</div>
        {#if isEditing}
          <Textarea
            bind:value={editData.description}
            rows={4}
            placeholder="タスクの詳細説明..."
          />
        {:else}
          <div class="whitespace-pre-wrap">
            {#if task.description}
              {task.description}
            {:else}
              <span class="text-muted-foreground">説明なし</span>
            {/if}
          </div>
        {/if}
      </div>

      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-1">
          <Clock class="w-3 h-3" />
          作成: {format(new Date(task.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
        </div>
        <div class="flex items-center gap-1">
          作成者: <UserAvatar user={task.creator} size="sm" showName={true} className="ml-1" />
        </div>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>コメント</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      {#each task.comments as comment (comment.id)}
        <div class="flex gap-3">
          <UserAvatar user={comment.user} size="md" showName={false} />
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium">{comment.user.username}</span>
              <span class="text-muted-foreground">
                {format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
              </span>
            </div>
            <div class="text-sm whitespace-pre-wrap">{comment.content}</div>
          </div>
        </div>
      {/each}

      <div class="border-t pt-4">
        <Textarea
          bind:value={newComment}
          placeholder="コメントを入力..."
          rows={3}
        />
        <Button
          size="sm"
          class="mt-2"
          onclick={handleAddComment}
          disabled={isSubmitting || !newComment.trim()}
        >
          コメントを追加
        </Button>
      </div>
    </CardContent>
  </Card>
</div>