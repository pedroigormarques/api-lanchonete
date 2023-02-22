export function criarObjetoComCopiaProfunda<
  ClasseOrigem extends ClasseDestino,
  ClasseDestino,
>(
  obj: ClasseOrigem,
  classeDestino: { new (): ClasseDestino },
  listaPropriedadesExcluidas: string[],
): ClasseDestino {
  const objClasseDestino: ClasseDestino = new classeDestino();

  const propriedadesDestino = new Set<string>(Object.getOwnPropertyNames(obj));
  listaPropriedadesExcluidas.forEach((v) => propriedadesDestino.delete(v));

  Object.entries(obj).forEach(([propriedade, valor]) => {
    if (propriedadesDestino.has(propriedade)) {
      if (obj[propriedade] instanceof Map) {
        objClasseDestino[propriedade] = new Map(valor.entries());
      } else if (obj[propriedade] instanceof Date) {
        objClasseDestino[propriedade] = new Date(valor);
      } else {
        objClasseDestino[propriedade] = valor;
      }
    }
  });

  return objClasseDestino;
}
