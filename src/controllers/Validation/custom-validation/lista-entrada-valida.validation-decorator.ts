import { registerDecorator, ValidationOptions } from 'class-validator';

export function MapaPossuiDadosValidos(
  validadoresParaChave: ((value: unknown) => boolean)[],
  validadoresParaValor: ((value: unknown) => boolean)[],
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'MapaPossuiDadosValidos',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          const valorTeste = mapaPossuiDadosValidos(
            value,
            validadoresParaChave,
            validadoresParaValor,
          );

          return valorTeste;
        },
        defaultMessage() {
          return 'Erro no tipo de informação passado ou no formato dos itens para lista de entrada';
        },
      },
    });
  };
}

export function mapaPossuiDadosValidos(
  value: unknown,
  validadoresParaChave: ((value: unknown) => boolean)[],
  validadoresParaValor: ((value: unknown) => boolean)[],
) {
  if (!(value instanceof Map<string, number>)) return false;

  const map: Map<string, unknown> = value;

  const chaves = [...map.keys()];
  const valores = [...map.values()];

  const conjuntoInvalido = chaves.some((chave, index) => {
    const chaveInvalida = validadoresParaChave.some(
      (validator) => !validator(chave),
    );
    if (chaveInvalida) return true;

    const valorInvalido = validadoresParaValor.some(
      (validator) => !validator(valores[index]),
    );
    return valorInvalido;
  });

  return !conjuntoInvalido;
}
