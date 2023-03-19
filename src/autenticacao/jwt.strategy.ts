import { ConfigService } from '@nestjs/config/dist';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_CONSTANTS_SECRET'),
    });
  }

  async validate(payload: any) {
    return { idUsuarioLogado: payload.sub, email: payload.email };
  }
}
