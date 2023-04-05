import { BadRequestException } from './../custom-exception/bad-request-exception.error';

export interface DadosBaseUsuario {
  email: string;
  senha: string;
  endereco: string;
  nomeLanchonete: string;
}

export interface UsuarioRetornado {
  id: string;
  email: string;
  endereco: string;
  nomeLanchonete: string;
}

export class Usuario {
  id?: string;
  email: string;
  senha: string;
  endereco: string;
  nomeLanchonete: string;

  constructor();
  constructor(dadosUsuario: DadosBaseUsuario);
  constructor(dadosUsuario: Usuario);
  constructor(dadosUsuario?: DadosBaseUsuario | Usuario) {
    if (typeof dadosUsuario !== 'undefined') {
      if (dadosUsuario instanceof Usuario) {
        this.registrarDados(dadosUsuario);
      } else {
        this.registrarDadosBaseUsuario(dadosUsuario);
      }
    }
  }

  atualizarDados(dadosUsuario: Partial<DadosBaseUsuario>) {
    if (typeof dadosUsuario.email !== 'undefined')
      this.email = dadosUsuario.email;
    if (typeof dadosUsuario.endereco !== 'undefined')
      this.endereco = dadosUsuario.endereco;
    if (typeof dadosUsuario.senha !== 'undefined')
      this.senha = dadosUsuario.senha;
    if (typeof dadosUsuario.nomeLanchonete !== 'undefined')
      this.nomeLanchonete = dadosUsuario.nomeLanchonete;
  }

  possuiTodosOsDadosValidos(): boolean {
    return Usuario.possuiTodosOsDadosValidos(this);
  }

  verificarSeDadosSaoValidosOuErro() {
    Usuario.DadosSaoValidosParaRegistroOuErro(this);
  }

  gerarUsuarioDeRetorno(): UsuarioRetornado {
    const usuarioRegistrado = { ...this };
    delete usuarioRegistrado.senha;

    return usuarioRegistrado as UsuarioRetornado;
  }

  protected registrarDados(dadosUsuario: { id?: string } & DadosBaseUsuario) {
    if (typeof dadosUsuario.id !== 'undefined') this.id = dadosUsuario.id;
    this.email = dadosUsuario.email;
    this.endereco = dadosUsuario.endereco;
    this.nomeLanchonete = dadosUsuario.nomeLanchonete;
    this.senha = dadosUsuario.senha;
  }

  private registrarDadosBaseUsuario(dadosUsuario: DadosBaseUsuario) {
    Usuario.DadosSaoValidosParaRegistroOuErro(dadosUsuario);
    this.registrarDados(dadosUsuario);
  }

  private static possuiTodosOsDadosValidos(dados: DadosBaseUsuario): boolean {
    if (
      typeof dados.nomeLanchonete === 'undefined' ||
      typeof dados.email === 'undefined' ||
      typeof dados.endereco === 'undefined' ||
      typeof dados.senha === 'undefined'
    ) {
      return false;
    }
    return true;
  }

  private static DadosSaoValidosParaRegistroOuErro(dados: DadosBaseUsuario) {
    if (!Usuario.possuiTodosOsDadosValidos(dados))
      throw new BadRequestException(
        'Dados incorretos/insuficientes para o usuário',
      );
  }
}
