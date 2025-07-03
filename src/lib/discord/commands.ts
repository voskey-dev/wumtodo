import { ApplicationCommandOptionType, type DiscordCommand } from './types';

const SUB_COMMAND = 1;

export const commands: DiscordCommand[] = [
  {
    name: 'wumtodo',
    description: 'wumtodoシステムコマンド',
    options: [
      {
        name: 'setup',
        description: 'このサーバーでwumtodoを初期化',
        type: SUB_COMMAND,
      },
    ],
  },
  {
    name: 'task',
    description: 'タスク管理コマンド',
    options: [
      {
        name: 'create',
        description: '新しいタスクを作成',
        type: SUB_COMMAND,
        options: [
          {
            name: 'title',
            description: 'タスクのタイトル',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'description',
            description: 'タスクの詳細説明',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: 'assignee',
            description: '担当者',
            type: ApplicationCommandOptionType.User,
            required: false,
          },
          {
            name: 'priority',
            description: '優先度',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
              { name: '高', value: 'high' },
              { name: '中', value: 'medium' },
              { name: '低', value: 'low' },
            ],
          },
        ],
      },
      {
        name: 'list',
        description: 'タスク一覧を表示',
        type: SUB_COMMAND,
        options: [
          {
            name: 'status',
            description: 'ステータスでフィルター',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
              { name: '未着手', value: 'todo' },
              { name: '進行中', value: 'in_progress' },
              { name: '完了', value: 'completed' },
            ],
          },
          {
            name: 'assignee',
            description: '担当者でフィルター',
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: 'status',
        description: 'タスクのステータスを変更',
        type: SUB_COMMAND,
        options: [
          {
            name: 'status',
            description: '新しいステータス',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: '未着手', value: 'todo' },
              { name: '進行中', value: 'in_progress' },
              { name: '完了', value: 'completed' },
            ],
          },
          {
            name: 'task_id',
            description: 'タスクID（省略時はスレッドから自動判定）',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'assign',
        description: 'タスクの担当者を変更',
        type: SUB_COMMAND,
        options: [
          {
            name: 'user',
            description: '新しい担当者',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'task_id',
            description: 'タスクID（省略時はスレッドから自動判定）',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'due',
        description: 'タスクの期限を設定',
        type: SUB_COMMAND,
        options: [
          {
            name: 'date',
            description: '期限（YYYY-MM-DD形式）',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'task_id',
            description: 'タスクID（省略時はスレッドから自動判定）',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'close',
        description: 'タスクを完了にする',
        type: SUB_COMMAND,
        options: [
          {
            name: 'task_id',
            description: 'タスクID（省略時はスレッドから自動判定）',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'comment',
        description: 'タスクにコメントを追加',
        type: SUB_COMMAND,
        options: [
          {
            name: 'content',
            description: 'コメント内容',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'task_id',
            description: 'タスクID（省略時はスレッドから自動判定）',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
    ],
  },
];