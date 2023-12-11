import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // run something before the request is handled by the request handler
    console.log('Im running before the handler', context);

    return handler.handle().pipe(
      map((data: any) => {
        // run something before the response is sent out
        console.log('Im running before the response is sent out', data);

        //I'm passing the UserDto as 1st arg and the UserEntity a the 2nd
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, //this setting will expose the desired properties
        })
      })
    )
  }
}
