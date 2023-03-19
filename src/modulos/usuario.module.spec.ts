import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { IUsuarioRepository } from './../@core/infra/contratos/usuario.repository.interface';
import { AutenticacaoModule } from './../autenticacao/autenticacao.module';
import { AutenticacaoService } from './../autenticacao/autenticacao.service';
import { UsuarioController } from './../controllers/usuario.controller';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';
import { UsuarioModule } from './usuario.module';

describe('Usuario Module', () => {
  let usuarioService: UsuarioService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          isGlobal: true,
        }),
        AutenticacaoModule,
        RepositorioInMemoryModule,
      ],
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useFactory: (
            usuarioRepositorio: IUsuarioRepository,
            autenticacaoService: AutenticacaoService,
          ) => new UsuarioService(usuarioRepositorio, autenticacaoService),
          inject: ['IUsuarioRepository', AutenticacaoService],
        },
      ],
      exports: [UsuarioService],
    }).compile();

    usuarioService = moduleRef.get<UsuarioService>(UsuarioService);
  });

  it('Usuario Service Instanciado', async () => {
    expect(usuarioService).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          isGlobal: true,
        }),
        UsuarioModule,
        AutenticacaoModule,
        RepositorioInMemoryModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
