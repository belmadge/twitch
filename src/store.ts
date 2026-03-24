import { CommandDefinition, UserConnection } from "./types.js";

const users = new Map<string, UserConnection>();
const commandsByChannel = new Map<string, CommandDefinition[]>();

export const store = {
  upsertUser(user: UserConnection): void {
    users.set(user.login.toLowerCase(), user);
  },

  getUser(login: string): UserConnection | undefined {
    return users.get(login.toLowerCase());
  },

  allUsers(): UserConnection[] {
    return [...users.values()];
  },

  addCommand(channel: string, command: CommandDefinition): void {
    const normalized = channel.toLowerCase();
    const commands = commandsByChannel.get(normalized) ?? [];
    const existingIndex = commands.findIndex((item) => item.trigger === command.trigger);

    if (existingIndex >= 0) {
      commands[existingIndex] = command;
    } else {
      commands.push(command);
    }

    commandsByChannel.set(normalized, commands);
  },

  findCommand(channel: string, trigger: string): CommandDefinition | undefined {
    const commands = commandsByChannel.get(channel.toLowerCase()) ?? [];
    return commands.find((command) => command.trigger === trigger.toLowerCase());
  },

  listCommands(channel: string): CommandDefinition[] {
    return commandsByChannel.get(channel.toLowerCase()) ?? [];
  }
};
