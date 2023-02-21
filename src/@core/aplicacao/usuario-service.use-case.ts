import { Usuario } from 'src/@core/dominio/usuario.entity';
import { CreateUsuarioDto } from 'src/@core/dominio/DTOs/create-usuario.dto';
import { UpdateUsuarioDto } from 'src/@core/dominio/DTOs/update-usuario.dto';
import { IUsuarioRepository } from 'src/@core/infra/contratos/usuario.repository.interface';

export class UsuarioService {
  constructor(private usuarioRepositorio: IUsuarioRepository) {}

  async validarUsuario(email: string, senha: string) {
    return await this.usuarioRepositorio.validarUsuario(email, senha);
  }

  async registrarUsuario(dadosUsuario: CreateUsuarioDto) {
    const usuario = new Usuario();
    usuario.email = dadosUsuario.email;
    usuario.endereco = dadosUsuario.endereco;
    usuario.nomeLanchonete = dadosUsuario.nomeLanchonete;
    usuario.senha = dadosUsuario.senha;

    return await this.usuarioRepositorio.registrarUsuario(usuario);
  }

  async atualizarUsuario(idUsuario: string, dadosUsuario: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepositorio.carregarUsuario(idUsuario);
    if (dadosUsuario.email) usuario.email = dadosUsuario.email;
    if (dadosUsuario.endereco) usuario.endereco = dadosUsuario.endereco;
    if (dadosUsuario.senha) usuario.senha = dadosUsuario.senha;
    if (dadosUsuario.nomeLanchonete)
      usuario.nomeLanchonete = dadosUsuario.nomeLanchonete;

    return await this.usuarioRepositorio.atualizarUsuario(idUsuario, usuario);
  }
}
