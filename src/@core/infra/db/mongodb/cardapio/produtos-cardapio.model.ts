import { CATEGORIAS } from './../../../../dominio/enums/categorias.enum';
import { Document, Schema } from 'mongoose';

const ComposicaoSchema = new Schema(
  {
    idProdutoEstoque: { type: String, ref: 'ProdutoEstoque', require: true },
    quantidade: { type: Number, require: true },
  },
  { _id: false },
);

export const ProdutoCardapioSchema = new Schema({
  _id: { type: String },
  idUsuario: { type: String, ref: 'Usuario', require: true },
  nomeProduto: { type: String, require: true },
  descricao: { type: String, require: true },
  categoria: { type: String, require: true, enum: Object.values(CATEGORIAS) },
  preco: { type: Number, require: true },

  composicao: {
    type: [ComposicaoSchema],
    require: true,
  },
});

ProdutoCardapioSchema.virtual('usadoPor', {
  ref: 'Pedido',
  localField: '_id',
  foreignField: 'produtosVendidos.idProdutoCardapio',
  count: true,
});

ProdutoCardapioSchema.virtual('idsComposicaoValidos', {
  ref: 'ProdutoEstoque',
  localField: 'composicao.idProdutoEstoque',
  foreignField: '_id',
});

export interface ProdutoCardapioMongoDB extends Document {
  id: string;
  idUsuario: string;
  nomeProduto: string;
  categoria: string;
  descricao: string;
  preco: number;
  composicao: Array<{ idProdutoEstoque: string; quantidade: number }>;
}
