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
    <!-- 検索バー -->
    <div class="w-full space-y-2">
      <label for="search" class="text-sm font-medium text-gray-700">タスクを検索</label>
      <Input
        id="search"
        type="text"
        placeholder="タスク名で検索..."
        bind:value={searchQuery}
        class="w-full"
      />
    </div>
    
    <!-- フィルターセクション -->
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 border-b pb-2">絞り込み条件</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- ステータスフィルター -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">ステータス</label>
          <Select
            value={statusFilter}
            onValueChange={(v) => v && (statusFilter = v)}
          >
            <SelectTrigger class="w-full">
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

        <!-- 優先度フィルター -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">優先度</label>
          <Select
            value={priorityFilter}
            onValueChange={(v) => v && (priorityFilter = v)}
          >
            <SelectTrigger class="w-full">
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

        <!-- 担当者フィルター -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">担当者</label>
          <Select
            value={assigneeFilter}
            onValueChange={(v) => v && (assigneeFilter = v)}
          >
            <SelectTrigger class="w-full">
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

        <!-- 並び順フィルター -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">並び順</label>
          <Select
            value={sortBy}
            onValueChange={(v) => v && (sortBy = v)}
          >
            <SelectTrigger class="w-full">
              <span>
                {sortBy === 'created_at' ? '作成日' : sortBy === 'due_date' ? '期限' : sortBy === 'priority' ? '優先度' : sortBy === 'status' ? 'ステータス' : '並び順'}
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
      </div>
      
      <!-- アクションボタン -->
      <div class="flex flex-wrap gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
          class="flex items-center gap-1"
          title="表示順序を切り替えます"
        >
          <span class="text-xs">📈</span>
          {sortOrder === 'asc' ? '昇順' : '降順'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onclick={resetFilters}
          class="flex items-center gap-1"
          title="すべての絞り込み条件をリセットします"
        >
          <span class="text-xs">🔄</span>
          リセット
        </Button>
      </div>
    </div>
  </CardContent>
</Card>