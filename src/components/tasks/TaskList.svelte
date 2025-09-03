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
  const itemsPerPage = 25;

  // URLクエリパラメータからページ番号を初期化
  onMount(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPage = parseInt(urlParams.get('page') || '1', 10);
      if (urlPage > 0 && urlPage !== currentPage) {
        currentPage = urlPage;
      }
    }
  });

  // フィルター変更時のページリセット用の状態
  let previousFilters = $state({
    status: statusFilter,
    priority: priorityFilter,
    assignee: assigneeFilter,
    sort: sortBy,
    order: sortOrder,
    search: searchQuery
  });

  $effect(() => {
    // フィルターが変更された場合のみページをリセット
    const currentFilters = {
      status: statusFilter,
      priority: priorityFilter,
      assignee: assigneeFilter,
      sort: sortBy,
      order: sortOrder,
      search: searchQuery
    };
    
    const filtersChanged = JSON.stringify(previousFilters) !== JSON.stringify(currentFilters);
    if (filtersChanged) {
      currentPage = 1;
      previousFilters = { ...currentFilters };
    }
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
      updateURL(page);
    }
  }

  function updateURL(page: number) {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (page === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', page.toString());
      }
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }

  function getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // 総ページ数が最大表示数以下の場合、全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 総ページ数が多い場合、現在のページ周辺を表示
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      // 開始ページが後ろにずれすぎた場合の調整
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  function getPageURL(page: number): string {
    if (typeof window === 'undefined') return '#';
    const url = new URL(window.location.href);
    if (page === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page.toString());
    }
    return url.pathname + url.search;
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

  <div class="space-y-2">
    {#if loading}
      {#each Array(5) as _, i}
        <div class="h-16 bg-muted animate-pulse rounded-lg"></div>
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
          <div class="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 class="font-medium leading-tight hover:underline line-clamp-2 sm:line-clamp-1">
                  {task.title}
                </h3>
                <div class="flex gap-1 flex-shrink-0">
                  <Badge className="{statusBadge.className} text-xs py-0.5 px-1.5">{statusBadge.label}</Badge>
                  <Badge className="{priorityBadge.className} text-xs py-0.5 px-1.5">{priorityBadge.label}</Badge>
                </div>
              </div>
              {#if task.description}
                <p class="text-sm text-muted-foreground line-clamp-1 mb-2 sm:mb-1">{task.description}</p>
              {/if}
              <div class="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                <UserAvatar user={task.assignee} size="sm" showName={false} />
                {#if task.due_date}
                  <span>期限: {format(new Date(task.due_date), 'MM/dd', { locale: ja })}</span>
                {/if}
              </div>
            </div>
            <div class="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
              <UserAvatar user={task.assignee} size="sm" showName={false} />
              {#if task.due_date}
                <span>
                  {format(new Date(task.due_date), 'MM/dd', { locale: ja })}
                </span>
              {/if}
              <span class="hidden md:inline">
                {format(new Date(task.created_at), 'MM/dd HH:mm', { locale: ja })}
              </span>
            </div>
          </div>
        </a>
      {/each}
    {/if}
  </div>

  {#if totalPages > 1}
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? getPageURL(currentPage - 1) : '#'}
            on:click={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {#each getVisiblePages() as pageNumber}
          <PaginationItem>
            <PaginationLink
              href={getPageURL(pageNumber)}
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
            href={currentPage < totalPages ? getPageURL(currentPage + 1) : '#'}
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