import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AutenticacaoService } from './autenticacao.service';
import { jwtConstants } from './constantes';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  providers: [AutenticacaoService, JwtStrategy],
  exports: [AutenticacaoService],
})
export class AutenticacaoModule {}
