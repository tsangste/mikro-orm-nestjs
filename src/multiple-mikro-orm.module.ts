import { Global, Inject, Module, RequestMethod, type MiddlewareConsumer } from '@nestjs/common';

import type { MikroORM } from '@mikro-orm/core';
import { forRoutesPath } from './middleware.helper';
import { CONTEXT_NAMES, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MultipleMikroOrmMiddleware } from './multiple-mikro-orm.middleware';
import { MultipleMikroOrmModuleOptions } from './typings';

@Global()
@Module({})
export class MultipleMikroOrmModule {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MultipleMikroOrmModuleOptions) { }

  static forRoot(options?: MultipleMikroOrmModuleOptions) {
    const inject = CONTEXT_NAMES.map(name => getMikroORMToken(name));
    return {
      module: MultipleMikroOrmModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        {
          provide: 'MikroORMs',
          useFactory: (...args: MikroORM[]) => args,
          inject,
        },
      ],
      exports: ['MikroORMs'],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(MultipleMikroOrmMiddleware)
      .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
  }

}