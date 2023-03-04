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
    if (dadosUsuario) {
      if (dadosUsuario instanceof Usuario) {
        this.registrarDados(dadosUsuario);
      } else {
        this.registrarDadosBaseUsuario(dadosUsuario);
      }
    }
  }

  atualizarDados(dadosUsuario: Partial<DadosBaseUsuario>) {
    if (dadosUsuario.email) this.email = dadosUsuario.email;
    if (dadosUsuario.endereco) this.endereco = dadosUsuario.endereco;
    if (dadosUsuario.senha) this.senha = dadosUsuario.senha;
    if (dadosUsuario.nomeLanchonete)
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
    if (dadosUsuario.id) this.id = dadosUsuario.id;
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
      throw new Error('Dados incorretos/insuficientes');
  }
}
