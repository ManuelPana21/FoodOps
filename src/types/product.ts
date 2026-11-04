export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
}

export type ProductCategory =
  | 'Todos'
  | 'Entradas'
  | 'Platos Fuertes'
  | 'Bebidas'
  | 'Postres';

