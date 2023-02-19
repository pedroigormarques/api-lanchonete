import { Usuario } from 'src/@core/dominio/user.entity';

export interface IUserRepository {
  validarUsuario(email: string, senha: string): Promise<Usuario>;
  registrarUsuario(usuario: Usuario): Promise<Usuario>;
  atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario>;

  /*insert(todo: TodoM): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
  deleteById(id: number): Promise<void>;*/
}
