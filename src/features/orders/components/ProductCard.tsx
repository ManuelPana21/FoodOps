import { Button } from "../../../components/common/Button";
import type { Product } from "../../../types/product";
import { formatCurrency } from "../../../utils/formatters";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.image ? (
          <img
            alt={product.name}
            className="product-image"
            src={product.image}
            loading="lazy"
          />
        ) : (
          <div className="soda-art" aria-label={product.name}>
            <span />
            <strong>SODA</strong>
            <i />
          </div>
        )}
        <span className="product-category">{product.category}</span>
      </div>

      <div className="product-content">
        <div className="product-name">{product.name}</div>
        <div className="product-description">{product.description}</div>
        <div className="product-footer">
          <span className="product-price">{formatCurrency(product.price)}</span>
          <Button
            className="add-button"
            icon="plus"
            label={`Agregar ${product.name} a la comanda`}
            onClick={() => onAdd(product)}
          >
            <span>Agregar</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
