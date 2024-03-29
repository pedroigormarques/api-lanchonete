import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { isEvento } from './../@core/dominio/notificacao.entity';
import { PedidoFechado } from './../@core/dominio/pedido-fechado.entity';
import { Pedido } from './../@core/dominio/pedido.entity';
import { ProdutoCardapio } from './../@core/dominio/produto-cardapio.entity';

@Injectable()
export class MapInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(filtroDeTipo));
  }
}

function filtroDeTipo(value: unknown): unknown {
  if (isEvento(value)) {
    value.data.forEach((a) => (a.data = conversorDeMap(a.data)));
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(conversorDeMap);
  }

  if (value !== null && typeof value === 'object') {
    return conversorDeMap(value);
  }

  return value;
}

function conversorDeMap(value: unknown): unknown {
  if (value instanceof ProdutoCardapio) {
    return transformarProdutoCardapio(value);
  }
  if (value instanceof Pedido) {
    return transformarPedido(value);
  }
  if (value instanceof PedidoFechado) {
    return transformarPedidoFechado(value);
  }

  return value;
}

function transformarProdutoCardapio(produto: ProdutoCardapio) {
  return { ...produto, composicao: [...produto.composicao.entries()] };
}

function transformarPedido(pedido: Pedido) {
  return {
    ...pedido,
    produtosVendidos: [...pedido.produtosVendidos.entries()],
  };
}

function transformarPedidoFechado(pedidoFechado: PedidoFechado) {
  return {
    ...pedidoFechado,
    produtosUtilizados: [...pedidoFechado.produtosUtilizados.entries()].map(
      (item) => [{ ...item[0] }, item[1]],
    ),
    produtosVendidos: [...pedidoFechado.produtosVendidos.entries()].map(
      (value) =>
        [transformarProdutoCardapio(value[0]), value[1]] as [object, number],
    ),
  };
}
