import { User } from "@/model/user";
import { UserRepository } from "@/repository/user-repository";

export class MemUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }

  async getById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getByIds(ids: string[]): Promise<User[]> {
    return ids.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  async getByName(name: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.name === name);
  }

  async getAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
