export type UserConnection = {
  id: string;
  login: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  joinedChannels: string[];
};

export type CommandDefinition = {
  trigger: string;
  response: string;
};
