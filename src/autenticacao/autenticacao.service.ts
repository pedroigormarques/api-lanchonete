import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Usuario } from './../@core/dominio/usuario.entity';

@Injectable()
export class AutenticacaoService {
  constructor(private jwtService: JwtService) {}

  async login(usuario: Usuario) {
    const payload = { email: usuario.email, sub: usuario.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
