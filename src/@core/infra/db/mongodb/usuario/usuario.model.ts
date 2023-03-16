import { Document, Schema } from 'mongoose';

export const UsuarioSchema = new Schema({
  _id: { type: String },
  email: { type: String, require: true, unique: true },
  senha: { type: String, require: true },
  endereco: { type: String, require: true },
  nomeLanchonete: { type: String, require: true },
});

export interface UsuarioMongoDB extends Document {
  id: string;
  email: string;
  senha: string;
  endereco: string;
  nomeLanchonete: string;
}
