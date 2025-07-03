export interface Database {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    discord_id: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
  
  account: {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    scope: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  
  verification: {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  
  teams: {
    id: string;
    name: string;
    discord_server_id: string;
    created_at: string;
  };
  
  team_members: {
    team_id: string;
    user_id: string;
    role: string;
  };
  
  tasks: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    team_id: string;
    assignee_id: string | null;
    creator_id: string;
    discord_thread_id: string | null;
    discord_channel_id: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;
  };
  
  task_comments: {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
  };
}