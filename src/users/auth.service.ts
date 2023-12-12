import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email is in use');
    }

    // hash pass
    // generate a salt
    const salt = randomBytes(8).toString('hex');

    // hash salt + pass
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // join hashed result + salt
    const result = salt + '.' + hash.toString('hex');

    // create new user and save it
    const user = await this.usersService.create(email, result);

    // return it
    return user;
  }

  signin() {

  }
}
