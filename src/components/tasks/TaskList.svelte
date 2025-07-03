<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import CardDescription from '@/components/ui-svelte/card-description.svelte';
  import CardHeader from '@/components/ui-svelte/card-header.svelte';
  import CardTitle from '@/components/ui-svelte/card-title.svelte';
  import Badge from '@/components/ui-svelte/badge.svelte';
  import TaskFilters from './TaskFilters.svelte';
  import Pagination from '@/components/ui-svelte/pagination.svelte';
  import PaginationContent from '@/components/ui-svelte/pagination-content.svelte';
  import PaginationItem from '@/components/ui-svelte/pagination-item.svelte';
  import PaginationLink from '@/components/ui-svelte/pagination-link.svelte';
  import PaginationNext from '@/components/ui-svelte/pagination-next.svelte';
  import PaginationPrevious from '@/components/ui-svelte/pagination-previous.svelte';
  import UserAvatar from '@/components/ui/UserAvatar.svelte';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';

  interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
    assignee?: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
    creator: {
      id: string;
      username: string;
    };
    due_date: string | null;
    created_at: string;
  }

  type Props = {
    userId: string;
  }

  let { userId }: Props = $props();

  let tasks = $state<Task[]>([]);
  let loading = $state(true);
  let statusFilter = $state('all');
  let priorityFilter = $state('all');
  let assigneeFilter = $state('all');
  let sortBy = $state('created_at');
  let sortOrder = $state<'asc' | 'desc'>('desc');
  let searchQuery = $state('');
  let currentPage = $state(1);
  let totalPages = $state(1);
  const itemsPerPage = 10;

  $effect.pre(() => {
    // Reset page when filters change
    currentPage = 1;
  });

  // Fetch tasks when dependencies change
  $effect(() => {
    fetchTasks(statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder, searchQuery, currentPage);
  });

  onMount(() => {
    fetchTasks(statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder, searchQuery, currentPage);
  });

  async function fetchTasks(
    status: string,
    priority: string,
    assignee: string,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
    page: number
  ) {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (priority !== 'all') params.append('priority', priority);
      if (assignee !== 'all') params.append('assignee', assignee);
      if (search) params.append('search', search);
      params.append('sort', sort);
      params.append('order', order);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as { tasks: Task[]; total: number };
        tasks = data.tasks;
        totalPages = Math.ceil(data.total / itemsPerPage);
      }
    } catch (error) {
      // Failed to fetch tasks
    } finally {
      loading = false;
    }
  }

  function getStatusBadge(status: Task['status']) {
    const variants = {
      todo: { label: '未着手', className: 'bg-gray-100 text-gray-800' },
      in_progress: { label: '進行中', className: 'bg-blue-100 text-blue-800' },
      completed: { label: '完了', className: 'bg-green-100 text-green-800' },
    };
    return variants[status];
  }

  function getPriorityBadge(priority: Task['priority']) {
    const variants = {
      high: { label: '高', className: 'bg-red-100 text-red-800' },
      medium: { label: '中', className: 'bg-yellow-100 text-yellow-800' },
      low: { label: '低', className: 'bg-blue-100 text-blue-800' },
    };
    return variants[priority];
  }

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<div class="space-y-6">
  <TaskFilters
    bind:statusFilter
    bind:priorityFilter
    bind:assigneeFilter
    bind:sortBy
    bind:sortOrder
    bind:searchQuery
  />

  <div class="grid gap-4">
    {#if loading}
      {#each Array(3) as _, i}
        <div class="h-32 bg-muted animate-pulse rounded-lg"></div>
      {/each}
    {:else if tasks.length === 0}
      <Card>
        <CardContent className="p-8 text-center">
          <p class="text-muted-foreground">
            該当するタスクがありません
          </p>
        </CardContent>
      </Card>
    {:else}
      {#each tasks as task}
        {@const statusBadge = getStatusBadge(task.status)}
        {@const priorityBadge = getPriorityBadge(task.priority)}
        <a href={`/tasks/${task.id}`} class="block transition-colors hover:no-underline">
          <Card className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <CardTitle class="hover:underline">
                    {task.title}
                  </CardTitle>
                  {#if task.description}
                    <CardDescription>{task.description}</CardDescription>
                  {/if}
                </div>
                <div class="flex gap-2">
                  <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                  <Badge className={priorityBadge.className}>{priorityBadge.label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-between text-sm text-muted-foreground">
                <div class="flex items-center gap-4">
                  <UserAvatar user={task.assignee} size="sm" />
                  {#if task.due_date}
                    <span>
                      期限: {format(new Date(task.due_date), 'yyyy/MM/dd', { locale: ja })}
                    </span>
                  {/if}
                </div>
                <span>
                  作成: {format(new Date(task.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </span>
              </div>
            </CardContent>
          </Card>
        </a>
      {/each}
    {/if}
  </div>

  {#if totalPages > 1}
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            on:click={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {#each Array(Math.min(5, totalPages)) as _, i}
          {@const pageNumber = i + 1}
          <PaginationItem>
            <PaginationLink
              href="#"
              on:click={(e) => {
                e.preventDefault();
                handlePageChange(pageNumber);
              }}
              isActive={currentPage === pageNumber}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        {/each}
        
        <PaginationItem>
          <PaginationNext
            href="#"
            on:click={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  {/if}
</div>