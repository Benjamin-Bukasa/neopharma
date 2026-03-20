import React, { useMemo } from "react";
import {
  BadgeCheck,
  Boxes,
  PackageMinus,
  PackageX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductsList from "../features/ProductsList";
import StatCard from "../components/ui/statCard";
import Button from "../components/ui/button";
import { useProductsData } from "../hooks/useProductsData";
import { formatAmount } from "../utils/formatters";
import { getMonthRange, getPreviousMonthRange, isWithinRange, percentChange } from "../utils/metrics";

function Products() {
  const { products } = useProductsData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, product) =>
        sum + Number(product.quantity || 0) * Number(product.price || 0),
      0
    );
    const inStock = products.filter(
      (product) => Number(product.quantity || 0) > 0
    ).length;
    const lowStock = products.filter((product) =>
      String(product.stock || "").toLowerCase().includes("faible")
    ).length;
    const outStock = products.filter(
      (product) => Number(product.quantity || 0) <= 0
    ).length;
    const inStockRate = totalProducts
      ? Math.round((inStock / totalProducts) * 100)
      : 0;
    const outStockValue = products
      .filter((product) => Number(product.quantity || 0) <= 0)
      .reduce((sum, product) => sum + Number(product.price || 0), 0);

    const now = new Date();
    const currentRange = getMonthRange(now);
    const previousRange = getPreviousMonthRange(now);

    const inRange = (product, range) =>
      isWithinRange(product.createdAt, range.start, range.end);

    const countInStock = (list) =>
      list.filter((product) => Number(product.quantity || 0) > 0).length;
    const countLowStock = (list) =>
      list.filter((product) =>
        String(product.stock || "").toLowerCase().includes("faible")
      ).length;
    const countOutStock = (list) =>
      list.filter((product) => Number(product.quantity || 0) <= 0).length;

    const currentProducts = products.filter((product) =>
      inRange(product, currentRange)
    );
    const previousProducts = products.filter((product) =>
      inRange(product, previousRange)
    );

    const currentCounts = {
      total: currentProducts.length,
      inStock: countInStock(currentProducts),
      lowStock: countLowStock(currentProducts),
      outStock: countOutStock(currentProducts),
    };

    const previousCounts = {
      total: previousProducts.length,
      inStock: countInStock(previousProducts),
      lowStock: countLowStock(previousProducts),
      outStock: countOutStock(previousProducts),
    };

    return {
      totalProducts,
      totalValue,
      inStock,
      lowStock,
      outStock,
      inStockRate,
      outStockValue,
      change: {
        total: percentChange(currentCounts.total, previousCounts.total),
        inStock: percentChange(currentCounts.inStock, previousCounts.inStock),
        lowStock: percentChange(currentCounts.lowStock, previousCounts.lowStock),
        outStock: percentChange(currentCounts.outStock, previousCounts.outStock),
      },
    };
  }, [products]);

  const productCards = useMemo(
    () => [
      {
        title: "Produits totaux",
        value: stats.totalProducts.toString(),
        subtitle: "Références actives",
        icon: Boxes,
        change: stats.change.total,
        highlight: true,
        amountLabel: "Valeur estimée",
        amountValue: formatAmount(stats.totalValue),
      },
      {
        title: "En stock",
        value: stats.inStock.toString(),
        subtitle: "Disponibles",
        icon: BadgeCheck,
        change: stats.change.inStock,
        amountLabel: "Articles vendables",
        amountValue: `${stats.inStockRate}%`,
      },
      {
        title: "Stock faible",
        value: stats.lowStock.toString(),
        subtitle: "À réapprovisionner",
        icon: PackageMinus,
        change: stats.change.lowStock,
        amountLabel: "Alertes",
        amountValue: stats.lowStock.toString(),
      },
      {
        title: "Rupture",
        value: stats.outStock.toString(),
        subtitle: "Indisponibles",
        icon: PackageX,
        change: stats.change.outStock,
        amountLabel: "Perte estimée",
        amountValue: formatAmount(stats.outStockValue),
      },
    ],
    [stats]
  );

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Produits</h1>
          <p className="text-sm text-text-secondary">
            Gérez le catalogue et suivez l’état des stocks.
          </p>
        </div>
        <Button
          type="button"
          label="Nouvelle requisition"
          variant="primary"
          size="small"
          className="whitespace-nowrap"
          onClick={() => navigate("/operations/requisitions/nouvelle")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {productCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <ProductsList tableMaxHeightClass="max-h-[46vh]" />
    </section>
  );
}

export default Products;
