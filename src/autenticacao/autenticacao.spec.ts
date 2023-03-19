import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { Usuario } from './../@core/dominio/usuario.entity';
import { GeradorDeObjetos } from './../test/gerador-objetos.faker';
import { AutenticacaoModule } from './autenticacao.module';
import { AutenticacaoService } from './autenticacao.service';
import { JwtStrategy } from './jwt.strategy';

describe('Autenticacao - Service e module', () => {
  let autenticacaoService: AutenticacaoService;
  let modulo: TestingModule;
  beforeEach(async () => {
    modulo = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          isGlobal: true,
        }),
        JwtModule.registerAsync({
          useFactory: async (config: ConfigService) => ({
            secret: config.getOrThrow('JWT_CONSTANTS_SECRET'),
            signOptions: { expiresIn: config.getOrThrow('JWT_EXPIRES_IN') },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [AutenticacaoService, JwtStrategy],
      exports: [AutenticacaoService],
    }).compile();

    autenticacaoService = modulo.get<AutenticacaoService>(AutenticacaoService);
  });

  it('Instanciado', () => {
    expect(modulo).toBeDefined();
    expect(autenticacaoService).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AutenticacaoModule,
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          isGlobal: true,
        }),
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });

  it('Gerar token válido', async () => {
    const usuarioAux = GeradorDeObjetos.criarUsuario(true);
    const usuarioTeste = new Usuario(usuarioAux);

    usuarioTeste.email = 'a@a.com';

    const { token } = await autenticacaoService.login(usuarioTeste);

    expect(token).toBeDefined();
  });
});
