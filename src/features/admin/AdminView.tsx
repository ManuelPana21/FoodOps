import { useState, type FormEvent } from "react";
import { Brand } from "../../components/common/Brand";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import { Toast } from "../../components/feedback/Toast";
import { CategoryTabs } from "../orders/components/CategoryTabs";
import type { Product, ProductCategory } from "../../types/product";
import {
  addStoredProduct,
  deleteStoredProduct,
  foodPhotos,
  loadStoredProducts,
  resetStoredProducts,
  updateStoredProduct,
} from "../../services/api";

const categories: ProductCategory[] = [
  "Todos",
  "Entradas",
  "Platos Fuertes",
  "Bebidas",
  "Postres",
];

const editableCategories: Exclude<ProductCategory, "Todos">[] = [
  "Entradas",
  "Platos Fuertes",
  "Bebidas",
  "Postres",
];

const imagePresets: { label: string; url: string | null }[] = [
  { label: "Hamburguesa", url: foodPhotos.burger },
  { label: "Tacos", url: foodPhotos.tacos },
  { label: "Pasta", url: foodPhotos.pasta },
  { label: "Alitas", url: foodPhotos.wings },
  { label: "Brownie", url: foodPhotos.brownie },
  { label: "Bebida / Sin foto", url: null },
];

interface AdminViewProps {
  onOrders?: () => void;
  onKitchen?: () => void;
  onBilling?: () => void;
  onLogout?: () => void;
}

export function AdminView({ onOrders, onKitchen, onBilling, onLogout }: AdminViewProps) {
  const [products, setProducts] = useState<Product[]>(() => loadStoredProducts());
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("Todos");
  const [search, setSearch] = useState("");

  // Estado del modal de creación / edición
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("Platos Fuertes");
  const [image, setImage] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      product.description.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Platos Fuertes");
    setImage(foodPhotos.burger);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setImage(product.image ?? "");
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedName) {
      setFormError("Ingresa el nombre del platillo.");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Ingresa un precio válido mayor a 0.");
      return;
    }
    if (!trimmedDesc) {
      setFormError("Ingresa una breve descripción del platillo.");
      return;
    }

    const payload: Omit<Product, "id"> = {
      name: trimmedName,
      description: trimmedDesc,
      price: Math.round(parsedPrice * 100) / 100,
      category,
      image: image.trim() ? image.trim() : null,
    };

    if (editingId !== null) {
      const updated = updateStoredProduct(editingId, payload);
      setProducts(updated);
      setToast({
        title: "Platillo actualizado",
        message: `"${trimmedName}" se guardó correctamente en el menú.`,
      });
    } else {
      const updated = addStoredProduct(payload);
      setProducts(updated);
      setToast({
        title: "Platillo agregado",
        message: `"${trimmedName}" ya está disponible para comandas.`,
      });
    }

    setFormOpen(false);
  };

  const handleDelete = (product: Product) => {
    const updated = deleteStoredProduct(product.id);
    setProducts(updated);
    setToast({
      title: "Platillo eliminado",
      message: `"${product.name}" fue removido del catálogo.`,
    });
  };

  const handleReset = () => {
    const restored = resetStoredProducts();
    setProducts(restored);
    setToast({
      title: "Menú restaurado",
      message: "Se restablecieron los 6 platillos originales del prototipo.",
    });
  };

  return (
    <div className="order-shell">
      <header className="order-header">
        <Brand />
        <div className="header-actions">
          <div className="sync-state">
            <span className="status-dot" />
            <span>Modo Admin</span>
          </div>

          <div className="server-profile">
            <div className="avatar">AD</div>
            <div className="profile-copy">
              <span className="profile-label">Panel de Control</span>
              <strong>Administrador</strong>
            </div>
          </div>

          {onBilling && (
            <Button className="kitchen-shortcut" onClick={onBilling}>
              <Icon name="tag" />
              <span>Facturas y Cupones</span>
            </Button>
          )}

          {onOrders && (
            <Button className="kitchen-shortcut" onClick={onOrders}>
              <Icon name="receipt" />
              <span>Comandas</span>
            </Button>
          )}

          {onKitchen && (
            <Button className="kitchen-shortcut" onClick={onKitchen}>
              <Icon name="chef" />
              <span>Cocina</span>
            </Button>
          )}

          {onLogout && (
            <Button className="kitchen-shortcut" onClick={onLogout}>
              <Icon name="x" />
              <span>Salir</span>
            </Button>
          )}
        </div>
      </header>

      <main className="admin-main">
        <section className="catalog">
          <div className="admin-top-bar">
            <div>
              <span className="eyebrow">Catálogo en LocalStorage · {products.length} platillos</span>
              <div className="page-title">Administración de Menú</div>
            </div>

            <div className="admin-top-actions">
              <Button className="admin-reset-button" onClick={handleReset}>
                Restaurar menú base
              </Button>
              <Button className="admin-add-button" onClick={openCreateModal}>
                <Icon name="plus" />
                <span>Nuevo Platillo</span>
              </Button>
            </div>
          </div>

          <div className="admin-filters-bar">
            <CategoryTabs
              activeCategory={activeCategory}
              categories={categories}
              onSelectCategory={setActiveCategory}
            />

            <div className="admin-search-box">
              <Icon name="search" size={18} />
              <input
                type="text"
                placeholder="Buscar platillo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setSearch("")}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    {product.image ? (
                      <img
                        alt={product.name}
                        className="product-image"
                        src={product.image}
                      />
                    ) : (
                      <div className="soda-art" aria-label={product.name}>
                        <span />
                        <strong>{product.name.slice(0, 8).toUpperCase()}</strong>
                        <i />
                      </div>
                    )}
                    <span className="product-category">{product.category}</span>
                  </div>

                  <div className="product-content">
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">
                      {product.description}
                    </div>
                    <div className="product-footer">
                      <span className="product-price">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="admin-card-actions">
                        <Button
                          className="admin-edit-btn"
                          label={`Editar ${product.name}`}
                          onClick={() => openEditModal(product)}
                        >
                          <Icon name="edit" size={17} />
                          <span>Editar</span>
                        </Button>
                        <Button
                          className="admin-delete-btn"
                          label={`Eliminar ${product.name}`}
                          onClick={() => handleDelete(product)}
                        >
                          <Icon name="trash" size={17} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <div>
                <Icon name="receipt" size={28} />
              </div>
              <strong>No se encontraron platillos</strong>
              <span>
                Prueba cambiando el filtro de categoría o agrega un nuevo
                platillo al menú.
              </span>
              <Button className="admin-add-button" onClick={openCreateModal}>
                <Icon name="plus" />
                <span>Agregar Platillo</span>
              </Button>
            </div>
          )}
        </section>
      </main>

      {formOpen && (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-labelledby="admin-modal-title"
            aria-modal="true"
            className="confirm-modal admin-modal"
            role="dialog"
          >
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">
                  {editingId !== null ? `Editando #${editingId}` : "Nuevo registro"}
                </span>
                <div className="modal-title" id="admin-modal-title">
                  {editingId !== null ? "Editar Platillo" : "Agregar Nuevo Platillo"}
                </div>
              </div>
              <Button
                className="delete-button"
                icon="x"
                label="Cerrar modal"
                onClick={() => setFormOpen(false)}
              />
            </div>

            <form className="admin-form" onSubmit={handleSubmit} noValidate>
              <div className="admin-form-row">
                <label className="login-field">
                  <span>Nombre del platillo</span>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ej. Pizza Margarita"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormError(null);
                    }}
                  />
                </label>

                <label className="login-field">
                  <span>Precio ($ USD)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="6.50"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setFormError(null);
                    }}
                  />
                </label>
              </div>

              <label className="login-field">
                <span>Categoría</span>
                <select
                  className="admin-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {editableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="login-field">
                <span>Descripción / Ingredientes</span>
                <input
                  type="text"
                  placeholder="Ej. Masa artesanal, salsa de tomate, mozzarella y albahaca"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setFormError(null);
                  }}
                />
              </label>

              <div className="login-field">
                <span>URL de imagen (o elige una foto rápida)</span>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... (dejar vacío para arte gráfico)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <div className="admin-preset-chips">
                  {imagePresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      className={`admin-preset-chip ${
                        (preset.url ?? "") === image ? "admin-preset-active" : ""
                      }`}
                      onClick={() => setImage(preset.url ?? "")}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="login-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="modal-actions admin-modal-actions">
                <Button
                  className="cancel-button"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button className="confirm-button" type="submit">
                  <Icon name="check" />
                  <span>
                    {editingId !== null ? "Guardar Cambios" : "Crear Platillo"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
