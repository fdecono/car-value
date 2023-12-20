import {
  CanActivate,
  ExecutionContext
} from '@nestjs/common'

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    //if the user ir logged, the ID will be in the session and this
    //return will not be 'falsy'
    return request.session.userId;
  }
}
