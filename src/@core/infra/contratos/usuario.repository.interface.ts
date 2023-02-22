import { Usuario } from './../../dominio/usuario.entity';

export interface IUsuarioRepository {
  validarUsuario(email: string, senha: string): Promise<Usuario>;
  registrarUsuario(usuario: Usuario): Promise<Usuario>;
  atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario>;
  carregarUsuario(id: string): Promise<Usuario>;
}
