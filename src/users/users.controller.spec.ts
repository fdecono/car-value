import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'a@a.com', password: 'pass' } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'pass'} as User]);
      },
    //   remove: () => {},
    //   update: () => {}
    };
    fakeAuthService = {
    //   signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 10, email, password } as User)
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('#findAllUsers', () => {
    it('returns a list of users with the given email', async () => {
      const users = await controller.findAllUsers('a@a.com');

      expect(users.length).toEqual(1);
      expect(users[0].email).toEqual('a@a.com');
    });
  });

  describe('#findUser', () => {
    it('returns the user with the given email', async () => {
      const user = await controller.findUser('1');

      expect(user).toBeDefined;
    });

    it('throws an error if id is not found', async () => {
      fakeUsersService.findOne = () => null;

      await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('#signin', () => {
    it('updates session object and returns user',async () => {
      const session = {userId: -10};
      const user = await controller.signin(
        {email: 'a@a.com', password: 'asd'},
        session
      );

      expect(user.id).toEqual(10);
      expect(session.userId).toEqual(10);
    })
  });
});
