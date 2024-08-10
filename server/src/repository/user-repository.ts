import { User } from "@/model/user";

export interface UserRepository {
  save(user: User): Promise<void>;
  getById(id: string): Promise<User | undefined>;
  getByIds(ids: string[]): Promise<User[]>;
  getByName(name: string): Promise<User | undefined>;
  getAll(): Promise<User[]>;
}
