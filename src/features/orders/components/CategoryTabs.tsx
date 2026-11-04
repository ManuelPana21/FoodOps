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
    <nav className="category-row" aria-label="Filtrar por categoría">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <Button
            key={category}
            className={`category-pill ${isActive ? "category-active" : ""}`}
            label={`Categoría ${category}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        );
      })}
    </nav>
  );
}
