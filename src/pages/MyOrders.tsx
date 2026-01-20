import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";

import { useOrderStatus } from "../hooks/useOrderStatus";
import { useDeleteOrder } from "../hooks/useDeleteOrder";

export const MyOrders = () => {
  
  const { data: orders, isLoading } = useOrders();
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();

  const { mutate: deleteOrder, isPending } = useDeleteOrder();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleDelete = () => {
    if (selectedId !== null) {
      deleteOrder(selectedId, {
        onSuccess: () => {
          setShowModal(false);
          setSelectedId(null);
        },
        onError: (err) => {
          console.error("Error deleting order:", err);
          alert("Error deleting order");
        },
      });
    }
  };

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useOrderStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center font-bold text-4xl min-h-[60vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <button
          onClick={() => navigate("/add-order/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Add Order
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Order #</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left"># Products</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Final Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Options</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, index) => (
              <tr
                key={order.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                <td className="border border-gray-300 px-4 py-2">{order.orderNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{order.date}</td>
                <td className="border border-gray-300 px-4 py-2">{order.products}</td>
                <td className="border border-gray-300 px-4 py-2">$ {order.finalPrice.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {updatingId === order.id ? (
                    "Updating..."
                  ) : (
                    <select 
                      className="text-sm border border-gray-300 rounded px-2 py-1 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      value={order.status}
                      onChange={(e) => {
                        const status = e.target.value as any;
                        setUpdatingId(order.id);
                        updateStatus(
                          {
                            id: order.id,
                            status,
                          },
                          {
                            onSettled: () => {
                              setUpdatingId(null);
                            },
                          }
                        );
                      }}
                      disabled={isUpdatingStatus || order.status === "COMPLETED"}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm py-1 px-3 rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => navigate(`/add-order/${order.id}`)}
                    disabled={order.status === "COMPLETED"}
                  >
                    Edit
                  </button>
                  <button
                    className="border border-red-600 text-red-600 hover:bg-red-50 text-sm py-1 px-3 rounded"
                    onClick={() => {
                      setSelectedId(order.id);
                      setShowModal(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-semibold">Confirm Deletion</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              Are you sure you want to delete this order?
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};