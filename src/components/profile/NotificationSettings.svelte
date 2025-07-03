<script lang="ts">
import Card from '@/components/ui-svelte/card.svelte';
import CardContent from '@/components/ui-svelte/card-content.svelte';
import CardDescription from '@/components/ui-svelte/card-description.svelte';
import CardHeader from '@/components/ui-svelte/card-header.svelte';
import CardTitle from '@/components/ui-svelte/card-title.svelte';
import Switch from '@/components/ui-svelte/switch.svelte';
import Label from '@/components/ui-svelte/label.svelte';
import Button from '@/components/ui-svelte/button.svelte';
import Alert from '@/components/ui-svelte/alert.svelte';
import AlertDescription from '@/components/ui-svelte/alert-description.svelte';
import { Bell, CheckCircle, Info } from 'lucide-svelte';

interface Props {
  userId: string;
}

const { userId: _userId }: Props = $props();

let settings = $state({
  taskAssigned: true,
  taskDueSoon: true,
  taskOverdue: true,
  taskCommented: true,
  taskStatusChanged: false,
  teamMemberAdded: false,
});
let saving = $state(false);
let saved = $state(false);

function handleToggle(key: keyof typeof settings) {
  settings = {
    ...settings,
    [key]: !settings[key],
  };
  saved = false;
}

async function handleSave() {
  saving = true;
  // 実際の実装では、ここでAPIを呼び出して設定を保存します
  await new Promise(resolve => setTimeout(resolve, 1000));
  saving = false;
  saved = true;
}
</script>

<div class="space-y-4">
  <Alert>
    <Info class="w-4 h-4" />
    <AlertDescription>
      通知はDiscordのDMまたは指定されたチャンネルに送信されます。
      Discordの通知設定も併せてご確認ください。
    </AlertDescription>
  </Alert>

  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Bell class="w-5 h-5" />
        通知設定
      </CardTitle>
      <CardDescription>
        受け取りたい通知の種類を選択してください
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="taskAssigned" class="text-base">
              タスクが割り当てられたとき
            </Label>
            <p class="text-sm text-muted-foreground">
              新しいタスクがあなたに割り当てられたときに通知します
            </p>
          </div>
          <Switch
            id="taskAssigned"
            checked={settings.taskAssigned}
            onCheckedChange={() => handleToggle('taskAssigned')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="taskDueSoon" class="text-base">
              タスクの期限が近づいたとき
            </Label>
            <p class="text-sm text-muted-foreground">
              期限の3日前、1日前、当日に通知します
            </p>
          </div>
          <Switch
            id="taskDueSoon"
            checked={settings.taskDueSoon}
            onCheckedChange={() => handleToggle('taskDueSoon')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="taskOverdue" class="text-base">
              タスクが期限切れになったとき
            </Label>
            <p class="text-sm text-muted-foreground">
              タスクの期限を過ぎたときに通知します
            </p>
          </div>
          <Switch
            id="taskOverdue"
            checked={settings.taskOverdue}
            onCheckedChange={() => handleToggle('taskOverdue')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="taskCommented" class="text-base">
              タスクにコメントがついたとき
            </Label>
            <p class="text-sm text-muted-foreground">
              あなたが担当するタスクに新しいコメントがついたときに通知します
            </p>
          </div>
          <Switch
            id="taskCommented"
            checked={settings.taskCommented}
            onCheckedChange={() => handleToggle('taskCommented')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="taskStatusChanged" class="text-base">
              タスクのステータスが変更されたとき
            </Label>
            <p class="text-sm text-muted-foreground">
              あなたが担当するタスクのステータスが変更されたときに通知します
            </p>
          </div>
          <Switch
            id="taskStatusChanged"
            checked={settings.taskStatusChanged}
            onCheckedChange={() => handleToggle('taskStatusChanged')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="teamMemberAdded" class="text-base">
              チームに新しいメンバーが追加されたとき
            </Label>
            <p class="text-sm text-muted-foreground">
              所属するチームに新しいメンバーが参加したときに通知します
            </p>
          </div>
          <Switch
            id="teamMemberAdded"
            checked={settings.teamMemberAdded}
            onCheckedChange={() => handleToggle('teamMemberAdded')}
          />
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t">
        <div>
          {#if saved}
            <p class="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle class="w-4 h-4" />
              設定を保存しました
            </p>
          {/if}
        </div>
        <Button onclick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '設定を保存'}
        </Button>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>通知の配信について</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3 text-sm">
      <p>
        通知はDiscordを通じて配信されます。以下の方法で通知を受け取ることができます：
      </p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Discord DM（ダイレクトメッセージ）</li>
        <li>チーム専用の通知チャンネル</li>
        <li>タスクに関連するスレッド内でのメンション</li>
      </ul>
      <p class="text-muted-foreground">
        注意：通知を受け取るには、DiscordでwumtodoボットからのDMを許可する必要があります。
      </p>
    </CardContent>
  </Card>
</div>