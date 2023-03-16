import { Document, Schema } from 'mongoose';
import { UNIDADES } from '../../../../dominio/enums/unidades.enum';

export const ProdutoEstoqueSchema = new Schema({
  _id: { type: String },
  idUsuario: { type: String, ref: 'Usuario', require: true },
  descricao: { type: String, require: true },
  nomeProduto: { type: String, require: true },
  quantidade: { type: Number, require: true },

  unidade: { type: String, require: true, enum: Object.values(UNIDADES) },
});

ProdutoEstoqueSchema.virtual('usadoPor', {
  ref: 'ProdutoCardapio',
  localField: '_id',
  foreignField: 'composicao.idProdutoEstoque',
  count: true,
});

export interface ProdutoEstoqueMongoDB extends Document {
  id: string;
  idUsuario: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: string;
}
