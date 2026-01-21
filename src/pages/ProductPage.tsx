import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
}

export const ProductManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("products");
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: (newProduct: Omit<Product, "id">) =>
      api.post("products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("¡Producto creado exitosamente!");
    },
  });

  const updateProduct = useMutation({
    mutationFn: (updated: Product) =>
      api.patch(`products/${updated.id}`, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("¡Producto actualizado exitosamente!");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("¡Producto eliminado exitosamente!");
    },
  });

  const handleSave = () => {
    if (!name.trim() || unitPrice <= 0) {
      alert("Datos de producto inválidos.");
      return;
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, name, unitPrice });
    } else {
      createProduct.mutate({ name, unitPrice });
    }

    setShowModal(false);
    setEditingProduct(null);
    setName("");
    setUnitPrice(0);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setUnitPrice(product.unitPrice);
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingProductId !== null) {
      deleteProduct.mutate(deletingProductId);
      setShowDeleteModal(false);
      setDeletingProductId(null);
    }
  };

  if (isLoading) {
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
          onClick={() => navigate("/")}
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
          <span className="font-medium">Volver al inicio</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Gestor de Productos</h2>
            <div className="w-16 h-1 bg-red-600"></div>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setName("");
              setUnitPrice(0);
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50"
          >
            + Nuevo Producto
          </button>
        </div>

        {/* Info Messages */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-400 italic">
            Productos cargados de la base de datos
          </p>
          <p className="text-red-400 italic font-semibold">
            ⚠️ No se pueden eliminar los primeros 3 productos (ID 1, 2, 3)
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Precio Unitario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-300 font-medium">{p.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{p.name}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">${p.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                          onClick={() => handleEdit(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                          onClick={() => handleDeleteClick(p.id)}
                          disabled={p.id <= 3}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? "Editar" : "Agregar"} Producto
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setName("");
                  setUnitPrice(0);
                }}
                className="text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Leche Entera"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-red-500 mb-2 uppercase tracking-wide">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setName("");
                  setUnitPrice(0);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/50"
                onClick={handleSave}
              >
                {editingProduct ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProductId(null);
                }}
                className="text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-6 text-gray-300">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProductId(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/50"
                onClick={confirmDelete}
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