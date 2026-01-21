import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useOrder } from "../hooks/useOrder";
import { useUpdateOrder } from "../hooks/useUpdateOrder";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
}

interface OrderProduct {
  product: Product;
  qty: number;
}

const availableProducts: Product[] = [
  { id: 1, name: "Azucar", unitPrice: 2.80 },
  { id: 2, name: "Anchor", unitPrice: 38.90 },
  { id: 3, name: "Mortadela", unitPrice: 2.50 },
  { id: 4, name: "Alitas", unitPrice: 8.90 },
];

export const OrderForm = () => {
  const [formError, setFormError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const isEdit = id !== "new";
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]); // format YYYY-MM-DD
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [qty, setQty] = useState<number>(1);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );

 
  const { data: orderData, isLoading: isLoadingOrder } = useOrder(id);

  useEffect(() => {
    if (orderData) {
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
  }, [orderData]);

  // Edit hook
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();

  const handleUpdateOrder = () => {
    if (!orderNumber.trim()) {
      setFormError("Order number is required.");
      return;
    }
    if (products.length === 0) {
      setFormError("You must add at least one product.");
      return;
    }

    setFormError(null);

    if (!id) return;

    updateOrder(
      {
        id: parseInt(id),
        orderNumber,
        status: "PENDING", // Or use real status if editable
        products: products.map((p) => ({
          productId: p.product.id,
          qty: p.qty,
          unitPrice: p.product.unitPrice,
        })),
      },
      {
        onSuccess: () => {
          alert("Order updated successfully!");
          navigate("/my-orders");
        },
        onError: (err: any) => {
          console.error("Update order failed:", err);
          alert("Something went wrong while updating the order.");
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
    setSelectedProductId(1);
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

  // Create order
  const { mutate: createOrder, isPending } = useCreateOrder();

  const handleCreateOrder = () => {
    if (!orderNumber.trim()) {
      setFormError("Order number is required.");
      return;
    }
    if (products.length === 0) {
      setFormError("You must add at least one product.");
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
          alert("Order created successfully!");
          navigate("/my-orders");
        },
        onError: (err: any) => {
          console.error("Create order failed:", err);
          alert("Something went wrong while creating the order.");
        },
      }
    );
  };

  if (isEdit && isLoadingOrder) {
    return <div className="container mx-auto mt-8 px-4">Loading order...</div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{isEdit ? "Edit Order" : "Add Order"}</h2>
        <Link to="/my-orders" className="text-blue-600 hover:text-blue-800 underline">
          Back to orders
        </Link>
      </div>
      <p className="italic mt-2 text-gray-600">
        You need to fill the Order # and add at least one product to create or
        update an order.
      </p>
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
          {formError}
        </div>
      )}
      <div className="mt-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Order #</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={date}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2"># Products</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={products.length}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Final Price</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={`$${totalPrice.toFixed(2)}`}
            disabled
          />
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mb-4"
          onClick={() => setShowModal(true)}
        >
          Add Product
        </button>

        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Total Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Options</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{p.product.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">${p.product.unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.qty}</td>
                  <td className="border border-gray-300 px-4 py-2">${(p.product.unitPrice * p.qty).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded mr-2"
                      onClick={() => handleEditProduct(i)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                      onClick={() => setConfirmDeleteIndex(i)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? "Updating..."
              : "Update Order"
            : isPending
            ? "Creating..."
            : "Create Order"}
        </button>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-semibold">
                {editIndex !== null ? "Edit" : "Add"} Product
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
                <label className="block text-sm font-medium mb-2">Product</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
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
                onClick={handleSaveProduct}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-semibold">Confirm Delete</h3>
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              Are you sure you want to remove this product from the order?
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => setConfirmDeleteIndex(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                onClick={() => handleRemoveProduct(confirmDeleteIndex!)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};