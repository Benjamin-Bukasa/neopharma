import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, buildQuery } from "../services/apiClient";
import useToastStore from "../stores/toastStore";

const buildInventoryMap = (inventory = []) => {
  const byProduct = new Map();
  inventory.forEach((item) => {
    if (!item?.productId) return;
    const current = byProduct.get(item.productId) || {
      quantity: 0,
      minLevel: 0,
    };
    current.quantity += Number(item.quantity || 0);
    current.minLevel += Number(item.minLevel || 0);
    byProduct.set(item.productId, current);
  });
  return byProduct;
};

const resolveStockLabel = (quantity, minLevel) => {
  if (quantity <= 0) return "Epuisé";
  if (minLevel && quantity <= minLevel) return "Faible";
  return "En stock";
};

const mapProducts = (products, inventoryMap) =>
  (products || []).map((product) => {
    const inventory = inventoryMap.get(product.id) || {
      quantity: 0,
      minLevel: 0,
    };
    const quantity = Number(inventory.quantity || 0);
    const minLevel = Number(inventory.minLevel || 0);
    return {
      id: product.id,
      product: product.name,
      category: product.category?.name || "N/A",
      status: product.isActive ? "Actif" : "Inactif",
      quantity,
      stock: resolveStockLabel(quantity, minLevel),
      price: Number(product.unitPrice || 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  });

export const useProductsData = ({ storeId } = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const inventoryQuery = buildQuery(storeId ? { storeId } : {});
      const [productsResponse, inventoryResponse] = await Promise.all([
        apiGet("/api/products"),
        apiGet(`/api/inventory${inventoryQuery ? `?${inventoryQuery}` : ""}`),
      ]);
      const inventoryMap = buildInventoryMap(inventoryResponse);
      setProducts(mapProducts(productsResponse, inventoryMap));
    } catch (error) {
      showToast({
        title: "Erreur",
        message: error.message || "Impossible de charger les produits.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, storeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      products,
      loading,
      refresh,
    }),
    [products, loading, refresh]
  );
};
