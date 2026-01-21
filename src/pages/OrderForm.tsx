import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useOrder } from "../hooks/useOrder";
import { useUpdateOrder } from "../hooks/useUpdateOrder";
import { useQuery } from "@tanstack/react-query";
import api from "../services/axiosConfig";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
}

interface OrderProduct {
  product: Product;
  qty: number;
}

export const OrderForm = () => {
  const [formError, setFormError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const isEdit = id !== "new";
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [qty, setQty] = useState<number>(1);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  // Fetch products dynamically
  const { data: availableProducts = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("products");
      return data;
    },
  });

  const { data: orderData, isLoading: isLoadingOrder } = useOrder(id);

  useEffect(() => {
    if (orderData && availableProducts.length > 0) {
      setOrderNumber(orderData?.orderNumber || "");
      const mappedProducts = orderData.products.map((op) => {
        const product = availableProducts.find((p) => p.id === op.productId);
        return {
          product: product ?? {
            id: op.productId,
            name: "Unknown",
            unitPrice: op.unitPrice,
          },
          qty: op.qty,
        };
      });
      setProducts(mappedProducts);
    }
  }, [orderData, availableProducts]);

  useEffect(() => {
    if (availableProducts.length > 0 && selectedProductId === 1) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [availableProducts]);

  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();

  const handleUpdateOrder = () => {
    if (!orderNumber.trim()) {
      setFormError("El número de pedido es requerido.");
      return;
    }
    if (products.length === 0) {
      setFormError("Debes agregar al menos un producto.");
      return;
    }

    setFormError(null);

    if (!id) return;

    updateOrder(
      {
        id: parseInt(id),
        orderNumber,
        status: "PENDING",
        products: products.map((p) => ({
          productId: p.product.id,
          qty: p.qty,
          unitPrice: p.product.unitPrice,
        })),
      },
      {
        onSuccess: () => {
          alert("¡Pedido actualizado exitosamente!");
          navigate("/my-orders");
        },
        onError: (err: any) => {
          console.error("Update order failed:", err);
          alert("Algo salió mal al actualizar el pedido.");
        },
      }
    );
  };

  const handleSaveProduct = () => {
    const product = availableProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newEntry: OrderProduct = { product, qty };

    setProducts((prev) => {
      if (editIndex !== null) {
        const copy = [...prev];
        copy[editIndex] = newEntry;
        return copy;
      }
      return [...prev, newEntry];
    });

    setShowModal(false);
    setEditIndex(null);
    setQty(1);
    if (availableProducts.length > 0) {
      setSelectedProductId(availableProducts[0].id);
    }
  };

  const handleEditProduct = (index: number) => {
    const { product, qty } = products[index];
    setSelectedProductId(product.id);
    setQty(qty);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
    setConfirmDeleteIndex(null);
  };

  const totalPrice = products.reduce(
    (sum, p) => sum + p.product.unitPrice * p.qty,
    0
  );

  const { mutate: createOrder, isPending } = useCreateOrder();

  const handleCreateOrder = () => {
    if (!orderNumber.trim()) {
      setFormError("El número de pedido es requerido.");
      return;
    }
    if (products.length === 0) {
      setFormError("Debes agregar al menos un producto.");
      return;
    }

    setFormError(null);

    createOrder(
      {
        orderNumber,
        status: "PENDING",
        products: products.map((p) => ({
          productId: p.product.id,
          qty: p.qty,
          unitPrice: p.product.unitPrice,
        })),
      },
      {
        onSuccess: () => {
          alert("¡Pedido creado exitosamente!");
          navigate("/my-orders");
        },
        onError: (err: any) => {
          console.error("Create order failed:", err);
          alert("Algo salió mal al crear el pedido.");
        },
      }
    );
  };

  if (isEdit && isLoadingOrder) {
    return (
      <div className="flex justify-center items-center font-bold text-4xl min-h-screen bg-black text-red-600">
        <div className="animate-pulse">Cargando pedido...</div>
      </div>
    );
  }

  if (isLoadingProducts) {
    return (
      <div className="flex justify-center items-center font-bold text-4xl min-h-screen bg-black text-red-600">
        <div className="animate-pulse">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors duration-200 mb-6 group"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Volver a pedidos</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {isEdit ? "Editar Pedido" : "Nuevo Pedido"}
          </h2>
          <div className="w-16 h-1 bg-red-600 mb-4"></div>
          <p className="text-gray-400 italic">
            Debes completar el número de pedido y agregar al menos un producto.
          </p>
        </div>

        {formError && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg mt-4 mb-6" role="alert">
            {formError}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-zinc-900 rounded-lg p-6 shadow-2xl border border-zinc-800 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                Pedido #
              </label>
              <input
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: ORD-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                Fecha
              </label>
              <input
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed"
                value={date}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                # Productos
              </label>
              <input
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed"
                value={products.length}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                Precio Final
              </label>
              <input
                type="text"
                className="w-full bg-zinc-800 border border-zinc-700 text-red-500 font-bold rounded-lg px-4 py-3 cursor-not-allowed"
                value={`$${totalPrice.toFixed(2)}`}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 mb-6"
          onClick={() => setShowModal(true)}
        >
          + Agregar Producto
        </button>

        {/* Products Table */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-2xl border border-zinc-800 mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Precio Unit.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Precio Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-zinc-800 transition-colors duration-200">
                    <td className="px-6 py-4 text-gray-300 font-medium">{p.product.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{p.product.name}</td>
                    <td className="px-6 py-4 text-gray-400">${p.product.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-300">{p.qty}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">${(p.product.unitPrice * p.qty).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                          onClick={() => handleEditProduct(i)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                          onClick={() => setConfirmDeleteIndex(i)}
                        >
                          Quitar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          onClick={isEdit ? handleUpdateOrder : handleCreateOrder}
          disabled={
            isPending ||
            isUpdating ||
            !orderNumber.trim() ||
            products.length === 0
          }
        >
          {isEdit
            ? isUpdating
              ? "Actualizando..."
              : "Actualizar Pedido"
            : isPending
            ? "Creando..."
            : "Crear Pedido"}
        </button>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editIndex !== null ? "Editar" : "Agregar"} Producto
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                }}
                className="text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                  Producto
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  disabled={editIndex !== null}
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.unitPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/50"
                onClick={handleSaveProduct}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className="text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-6 text-gray-300">
              ¿Estás seguro de que deseas quitar este producto del pedido?
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
                onClick={() => setConfirmDeleteIndex(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/50"
                onClick={() => handleRemoveProduct(confirmDeleteIndex!)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};