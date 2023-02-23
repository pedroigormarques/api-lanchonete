export function geraValorEnumAleatorio(nomeEnum) {
  const values = Object.keys(nomeEnum);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  return nomeEnum[enumKey];
}

export function possuiUmValorValidoParaOEnum(valor, nomeEnum): boolean {
  return Object.values(nomeEnum).includes(valor);
}
