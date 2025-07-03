<script lang="ts">
  import Card from '@/components/ui-svelte/card.svelte';
  import CardContent from '@/components/ui-svelte/card-content.svelte';
  import CardDescription from '@/components/ui-svelte/card-description.svelte';
  import CardHeader from '@/components/ui-svelte/card-header.svelte';
  import CardTitle from '@/components/ui-svelte/card-title.svelte';
  import Alert from '@/components/ui-svelte/alert.svelte';
  import AlertDescription from '@/components/ui-svelte/alert-description.svelte';
  import { Info, Users, Shield, CheckCircle2 } from 'lucide-svelte';
</script>

<Card>
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <Users class="w-5 h-5" />
      メンバーの招待方法
    </CardTitle>
    <CardDescription>
      wumtodo はDiscordサーバーと連携しています
    </CardDescription>
  </CardHeader>
  <CardContent class="space-y-4">
    <Alert>
      <Info class="w-4 h-4" />
      <AlertDescription>
        新しいメンバーの追加は、Discord サーバーへの招待を通じて行います。
        Discord サーバーに参加したユーザーは、自動的にチームメンバーとして登録されます。
      </AlertDescription>
    </Alert>

    <div class="space-y-3">
      <h4 class="font-medium">メンバー追加の流れ</h4>
      
      <div class="space-y-2">
        <div class="flex gap-3">
          <div class="mt-1">
            <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              1
            </div>
          </div>
          <div>
            <p class="font-medium">Discord サーバーに招待</p>
            <p class="text-sm text-muted-foreground">
              Discordの招待リンクを使用して、新しいメンバーをサーバーに招待します
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="mt-1">
            <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              2
            </div>
          </div>
          <div>
            <p class="font-medium">自動登録</p>
            <p class="text-sm text-muted-foreground">
              Discord サーバーに参加すると、自動的にwumtodoのチームメンバーとして登録されます
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="mt-1">
            <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              3
            </div>
          </div>
          <div>
            <p class="font-medium">wumtodoにログイン</p>
            <p class="text-sm text-muted-foreground">
              メンバーがDiscordアカウントでwumtodoにログインすると、タスク管理機能を利用できます
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-4">
      <h4 class="font-medium mb-2">権限について</h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <Shield class="w-4 h-4 text-purple-600" />
          <span class="font-medium">管理者</span>
          <span class="text-muted-foreground">- メンバーの権限変更、削除が可能</span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-gray-600" />
          <span class="font-medium">メンバー</span>
          <span class="text-muted-foreground">- タスクの作成、編集、表示が可能</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>