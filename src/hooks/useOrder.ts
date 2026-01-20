import { useQuery } from "@tanstack/react-query";
import api from "../services/axiosConfig";

interface RawOrderProduct {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  unitPrice: number;
}

interface RawOrderResponse {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  products: RawOrderProduct[];
}

export const useOrder = (id?: string) => {
  return useQuery<RawOrderResponse | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id || id === "new") return null;

      const { data } = await api.get<RawOrderResponse>(`/orders/${id}`);

      return data;
    },
    enabled: !!id && id !== "new",
  });
};