import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe('AuthService', () => {
  let service: AuthService;
  //I declare it here, so I can assign it different values in all other contexts
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      //change implementation to be more reallistic and store users in memory.
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {id: Math.floor(Math.random() * 999999), email, password} as User;
        users.push(user);
        return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile();

    //as 'service' is in another scope than 'it', I declare it above, and here I just
    //assign a new value to it
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  describe('#signup', () => {
    it('creates a new user with a salted and hashed password', async () => {
      const user = await service.signup('some@email.com', 'password');

      expect(user.password).not.toEqual('password');
      const [salt, hash] = user.password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
      //Redefine the .find() method:
      fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'a@a.com', password: 'pass'} as User]);

      await expect(service.signup('used@email.com', 'password')).rejects.toThrow(BadRequestException);
    });
  });

  describe('#signin', () => {
    it('returns a user if correct password is provided',async () => {
      await service.signup('a@a.com', 'some-pass');

      const user = await service.signin('a@a.com', 'some-pass');
      expect(user).toBeDefined();
    });

    it('throws an error if signin is called with an unused email', async () => {
      await expect(service.signin('a@a.com', 'pass')).rejects.toThrow(NotFoundException);
    });

    it('throws an error if an invalid password is provided', async () => {
      await service.signup('a@a.com', 'some-pass');

      await expect(service.signin('a@a.com', 'wrong-pass')).rejects.toThrow(BadRequestException);
    });
  });
});
