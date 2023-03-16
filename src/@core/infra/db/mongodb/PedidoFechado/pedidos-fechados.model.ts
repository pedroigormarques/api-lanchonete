import { Document, Schema } from 'mongoose';

const ProdutosVendidosSchema = new Schema(
  {
    produtoCardapio: {
      type: String,
      require: true,
    },
    quantidade: { type: Number, require: true },
  },
  { _id: false },
);

const ProdutosUtilizadosSchema = new Schema(
  {
    produtoEstoque: {
      type: String,
      require: true,
    },
    quantidade: { type: Number, require: true },
  },
  { _id: false },
);

export const PedidoFechadoSchema = new Schema({
  _id: { type: String },
  idUsuario: { type: String, ref: 'Usuario', require: true },
  mesa: { type: Number, require: true },
  horaAbertura: { type: Date, require: true },
  horaFechamento: { type: Date, require: true },
  valorConta: { type: Number, require: true },

  produtosVendidos: {
    type: [ProdutosVendidosSchema],
    require: true,
  },

  produtosUtilizados: {
    type: [ProdutosUtilizadosSchema],
    require: true,
  },
});

export interface PedidoFechadoMongoDB extends Document {
  produtosVendidos: Array<{
    produtoCardapio: string;
    quantidade: number;
  }>;

  produtosUtilizados: Array<{
    produtoEstoque: string;
    quantidade: number;
  }>;

  id: string;
  idUsuario: string;
  mesa: number;
  horaAbertura: Date;
  horaFechamento: Date;
  valorConta: number;
}
