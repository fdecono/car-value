import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

it('can create an instance of auth service', async () => {
  // Create a fake copy of users service:
  // Partial<UsersService> means we are asking TS to validate the methods we are adding
  // and allowing it to be a partial version of UsersService
  const fakeUsersService: Partial<UsersService> = {
    find: () => Promise.resolve([]),
    create: (email: string, password: string) => Promise.resolve({id: 1, email, password} as User)
  };

  //basically, we're creating a DI container:
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UsersService, //when something asks for UsersService
        useValue: fakeUsersService //this value will be used to respond to that call
      }
    ]
  }).compile();

  const service = module.get(AuthService);

  expect(service).toBeDefined();
});
