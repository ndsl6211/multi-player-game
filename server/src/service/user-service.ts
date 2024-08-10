import { getLogger } from "@/logger";
import { User } from "@/model/user";
import { UserRepository } from "@/repository/user-repository";

export class UserService {
  private readonly _logger = getLogger('UserService');
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async registerOrLoginUser(id: string, name: string): Promise<User> {
    let user = await this.userRepository.getByName(name)
    if (user !== undefined) {
      this._logger.info(`User ${name} already exists, skipping registration`)
      return user;
    }

    user = new User(id, name);
    await this.userRepository.save(user);

    this._logger.info(`User ${name} registered`)
    return user
  }

  public async getUserByName(user: string): Promise<User | undefined> {
    return this.userRepository.getByName(user);
  }
}
