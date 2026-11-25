import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderView } from "./OrderView";

describe("OrderView - Toma de pedidos y doble confirmación", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("actualiza el subtotal al agregar productos y requiere doble confirmación antes de enviar", async () => {
    const user = userEvent.setup();
    render(<OrderView />);

    // El carrito inicial tiene: Hamburguesa ($6.50) + Tacos ($5.00) + Soda ($1.50) = $13.00
    const cartPanel = screen.getByRole("complementary");
    expect(within(cartPanel).getByText("Subtotal")).toBeInTheDocument();
    expect(within(cartPanel).getAllByText("$13.00").length).toBeGreaterThan(0);

    // 1. Agregar una Pasta Cremosa ($7.50) -> Subtotal debe subir a $20.50
    const addPastaBtn = screen.getByRole("button", {
      name: /Agregar Pasta Cremosa/i,
    });
    await user.click(addPastaBtn);

    expect(within(cartPanel).getAllByText("$20.50").length).toBeGreaterThan(0);

    // 2. Primer toque en "Enviar a Cocina y Facturar": abre el modal de doble confirmación,
    //    NO envía el pedido ni muestra el toast todavía.
    const sendButton = within(cartPanel).getByRole("button", {
      name: /Enviar a Cocina/i,
    });
    await user.click(sendButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText(/¿Confirmar Envío de Comanda\?/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/¡Pedido enviado!/i)).not.toBeInTheDocument();

    // 3. Segundo toque en el botón de confirmación dentro del modal -> envía el pedido
    const confirmButton = within(dialog).getByRole("button", {
      name: /Enviar y Facturar|Sí, Enviar Pedido/i,
    });
    await user.click(confirmButton);

    expect(screen.queryByRole("dialog", { name: /¿Confirmar Envío de Comanda\?/i })).not.toBeInTheDocument();
    expect(screen.getByText(/¡Pedido enviado!/i)).toBeInTheDocument();
  });
});
