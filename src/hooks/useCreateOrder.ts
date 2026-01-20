import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/axiosConfig";

interface useCreateOrderPayload {
  orderNumber: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  products: {
    productId: number;
    qty: number;
    unitPrice: number;
  }[];
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOrder: useCreateOrderPayload) => api.post("orders", newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};