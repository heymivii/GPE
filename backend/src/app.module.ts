import { Module } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
})
export class AppModule {}
