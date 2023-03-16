export interface AppConfig {
  URL_BANCO: string;
  NOME_DATABASE: {
    prod: string;
    e2e: string;
    dev: string;
  };
}

export const carregarConfiguracao = (appConfig: AppConfig) => () => ({
  URL_BANCO: appConfig.URL_BANCO,
  NOME_DATABASE: appConfig.NOME_DATABASE[process.env.NODE_ENV],
});
