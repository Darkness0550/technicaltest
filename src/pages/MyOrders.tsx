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
  
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useOrderStatus();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center font-bold text-4xl min-h-screen bg-black text-red-600">
        <div className="animate-pulse">Loading...</div>
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
            <h2 className="text-4xl font-bold text-white mb-2">Mis Pedidos</h2>
            <div className="w-16 h-1 bg-red-600"></div>
          </div>
          <button
            onClick={() => navigate("/add-order/new")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50"
          >
            + Nuevo Pedido
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Pedido #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider"># Productos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Precio Final</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-500 uppercase tracking-wider">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-300 font-medium">{order.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-400">{order.date}</td>
                    <td className="px-6 py-4 text-gray-300">{order.products}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">$ {order.finalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {updatingId === order.id ? (
                        <span className="text-gray-400 text-sm">Actualizando...</span>
                      ) : (
                        <select 
                          className="text-sm bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="COMPLETED">Completado</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-600"
                          onClick={() => navigate(`/add-order/${order.id}`)}
                          disabled={order.status === "COMPLETED"}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200"
                          onClick={() => {
                            setSelectedId(order.id);
                            setShowModal(true);
                          }}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex justify-between items-center border-b border-zinc-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-6 text-gray-300">
              ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 px-6 py-4">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/50"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};