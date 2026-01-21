import { useState } from "react";
import api from "../services/axiosConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
}

export const ProductManagement = () => {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("products");
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: (newProduct: Omit<Product, "id">) =>
      api.post("products", newProduct),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: (updated: Product) =>
      api.patch(`products/${updated.id}`, updated),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const handleSave = () => {
    if (!name.trim() || unitPrice <= 0) return alert("Invalid product data.");

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

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestor de registros</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Add Product
        </button>
      </div>
      <p className="italic text-gray-600">Productos cargados de la base de datos</p>
      <p className="italic font-bold text-gray-700 mb-4">
        No se pueden eliminar los primeros 3 productos (ID 1, 2, 3)
      </p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Unit Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Options</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-4 py-2">{p.id}</td>
                <td className="border border-gray-300 px-4 py-2">{p.name}</td>
                <td className="border border-gray-300 px-4 py-2">${p.unitPrice.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm py-1 px-3 rounded mr-2"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="border border-red-600 text-red-600 hover:bg-red-50 text-sm py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleDelete(p.id)}
                    disabled={p.id <= 3} // Disable delete for first 3 products
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-semibold">
                {editingProduct ? "Edit" : "Add"} Product
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={handleSave}
              >
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};