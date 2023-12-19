import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';

//problem: param decorator exist OUTSIDE DI, we can't get and instance of UsersService directly
//We need the Interceptor!
export const CurrentUser = createParamDecorator(
  //if we dont need to pass a param, we define it as 'never'
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  }
)
