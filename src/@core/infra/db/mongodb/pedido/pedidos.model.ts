import { Document, Schema } from 'mongoose';

const ProdutosVendidosSchema = new Schema(
  {
    idProdutoCardapio: { type: String, ref: 'ProdutoCardapio', require: true },
    quantidade: { type: Number, require: true },
  },
  { _id: false },
);

export const PedidoSchema = new Schema({
  _id: { type: String },
  idUsuario: { type: String, ref: 'Usuario', require: true },
  mesa: { type: Number, require: true },
  horaAbertura: { type: Date, require: true },
  valorConta: { type: Number, require: true },

  produtosVendidos: {
    type: [ProdutosVendidosSchema],
    require: true,
  },
});

PedidoSchema.virtual('idsProdutosVendidosValidos', {
  ref: 'ProdutoCardapio',
  localField: 'produtosVendidos.idProdutoCardapio',
  foreignField: '_id',
});

export interface PedidoMongoDB extends Document {
  id: string;
  idUsuario: string;
  mesa: number;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Array<{ idProdutoCardapio: string; quantidade: number }>;
}
