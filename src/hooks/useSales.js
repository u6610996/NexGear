import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEY, CUSTOM_PRODUCTS_KEY } from "../data/products";

export function useSales() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customProducts));
  }, [customProducts]);

  const addTransaction = useCallback((transaction) => {
    const newTx = {
      ...transaction,
      id: `TX${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const addCustomProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: `CUSTOM_${Date.now()}`,
      isCustom: true,
    };
    setCustomProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const totalSales = transactions.reduce((sum, tx) => sum + tx.totalPrice, 0);

  return {
    transactions,
    customProducts,
    addTransaction,
    deleteTransaction,
    addCustomProduct,
    totalSales,
  };
}
