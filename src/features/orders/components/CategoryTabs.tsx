import { Button } from "../../../components/common/Button";
import type { ProductCategory } from "../../../types/product";

interface CategoryTabsProps {
  categories: ProductCategory[];
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="category-row" aria-label="Categorías">
      {categories.map((category) => (
        <Button
          className={`category-pill ${activeCategory === category ? "category-active" : ""}`}
          key={category}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
