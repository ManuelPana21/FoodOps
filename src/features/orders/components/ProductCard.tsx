import { Button } from "../../../components/common/Button";
import { Icon } from "../../../components/common/Icon";
import type { Product } from "../../../types/product";

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
          />
        ) : (
          <div className="soda-art" aria-label="Soda fría">
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
          <span className="product-price">${product.price.toFixed(2)}</span>
          <Button
            className="add-button"
            label={`Agregar ${product.name}`}
            onClick={() => onAdd(product)}
          >
            <Icon name="plus" />
            <span>Agregar</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
