import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsuarioSchema } from './usuario.model';
import { UsuarioRepository } from './usuario.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Usuario', schema: UsuarioSchema }]),
  ],
  providers: [{ provide: 'IUsuarioRepository', useClass: UsuarioRepository }],
  exports: ['IUsuarioRepository'],
})
export class UsuarioMongoDBModule {}
