<script lang="ts">
  import Select from '@/components/ui-svelte/select.svelte';
  import SelectContent from '@/components/ui-svelte/select-content.svelte';
  import SelectItem from '@/components/ui-svelte/select-item.svelte';
  import SelectTrigger from '@/components/ui-svelte/select-trigger.svelte';
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import Button from '@/components/ui-svelte/button.svelte';
  import Input from '@/components/ui-svelte/input.svelte';

  type Props = {
    statusFilter?: string;
    priorityFilter?: string;
    assigneeFilter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchQuery?: string;
  }

  let { 
    statusFilter = $bindable('all'),
    priorityFilter = $bindable('all'),
    assigneeFilter = $bindable('all'),
    sortBy = $bindable('created_at'),
    sortOrder = $bindable<'asc' | 'desc'>('desc'),
    searchQuery = $bindable('')
  }: Props = $props();

  function resetFilters() {
    statusFilter = 'all';
    priorityFilter = 'all';
    assigneeFilter = 'all';
    sortBy = 'created_at';
    sortOrder = 'desc';
    searchQuery = '';
  }
</script>

<Card>
  <CardContent class="p-4 space-y-4">
    <div class="w-full">
      <Input
        type="text"
        placeholder="タスク名で検索..."
        bind:value={searchQuery}
        class="w-full"
      />
    </div>
    <div class="flex flex-wrap gap-4 items-center">
      <div class="flex-1 min-w-[150px]">
        <Select
          value={statusFilter}
          onValueChange={(v) => v && (statusFilter = v)}
        >
          <SelectTrigger>
            <span>
              {statusFilter === 'all' ? 'すべて' : statusFilter === 'todo' ? '未着手' : statusFilter === 'in_progress' ? '進行中' : statusFilter === 'completed' ? '完了' : 'ステータス'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="todo">未着手</SelectItem>
            <SelectItem value="in_progress">進行中</SelectItem>
            <SelectItem value="completed">完了</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex-1 min-w-[150px]">
        <Select
          value={priorityFilter}
          onValueChange={(v) => v && (priorityFilter = v)}
        >
          <SelectTrigger>
            <span>
              {priorityFilter === 'all' ? 'すべて' : priorityFilter === 'high' ? '高' : priorityFilter === 'medium' ? '中' : priorityFilter === 'low' ? '低' : '優先度'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex-1 min-w-[150px]">
        <Select
          value={assigneeFilter}
          onValueChange={(v) => v && (assigneeFilter = v)}
        >
          <SelectTrigger>
            <span>
              {assigneeFilter === 'all' ? 'すべて' : assigneeFilter === 'me' ? '自分' : assigneeFilter === 'unassigned' ? '未割当' : '担当者'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="me">自分</SelectItem>
            <SelectItem value="unassigned">未割当</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex-1 min-w-[150px]">
        <Select
          value={sortBy}
          onValueChange={(v) => v && (sortBy = v)}
        >
          <SelectTrigger>
            <span>
              {sortBy === 'created_at' ? '作成日' : sortBy === 'due_date' ? '期限' : sortBy === 'priority' ? '優先度' : '並び順'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">作成日</SelectItem>
            <SelectItem value="due_date">期限</SelectItem>
            <SelectItem value="priority">優先度</SelectItem>
            <SelectItem value="status">ステータス</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
      >
        {sortOrder === 'asc' ? '昇順' : '降順'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onclick={resetFilters}
      >
        リセット
      </Button>
    </div>
  </CardContent>
</Card>