import { UpdateUsuarioDto } from 'src/@core/dominio/DTOs/update-usuario.dto';
import { CreateUsuarioDto } from 'src/@core/dominio/DTOs/create-usuario.dto';
import { GetUsuarioDto } from 'src/@core/dominio/DTOs/get-usuario.dto';

export interface IUsuarioRepository {
  validarUsuario(email: string, senha: string): Promise<GetUsuarioDto>;
  registrarUsuario(usuario: CreateUsuarioDto): Promise<GetUsuarioDto>;
  atualizarUsuario(
    id: string,
    usuario: UpdateUsuarioDto,
  ): Promise<GetUsuarioDto>;
}
