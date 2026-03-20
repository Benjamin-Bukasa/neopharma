import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Smartphone,
  UserPlus,
  X,
} from "lucide-react";
import CustomerCreateModal from "./customerCreateModal";
import { apiGet, apiPatch, apiPost } from "../../services/apiClient";
import useToastStore from "../../stores/toastStore";
import { formatName } from "../../utils/formatters";

const PaymentModal = ({
  isOpen,
  onClose,
  cartItems = [],
  totalAmount = 0,
  onConfirm,
}) => {
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const normalizeCustomer = useCallback(
    (customer) => ({
      ...customer,
      name: formatName(customer),
      phone: customer?.phone || "",
      points: Number(customer?.points || 0),
    }),
    []
  );

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const data = await apiGet("/api/customers");
      const list = Array.isArray(data?.data) ? data.data : data;
      const normalized = Array.isArray(list)
        ? list.map(normalizeCustomer)
        : [];
      setCustomers(normalized);
    } catch (error) {
      showToast({
        title: "Erreur",
        message: error.message || "Impossible de charger les clients.",
        variant: "danger",
      });
    } finally {
      setLoadingCustomers(false);
    }
  }, [normalizeCustomer, showToast]);

  useEffect(() => {
    if (!isOpen) return;
    setAmount(totalAmount ? totalAmount.toFixed(2) : "");
    setCustomerQuery("");
    setSelectedCustomer(null);
    setIsCustomerMenuOpen(false);
    setMethod("cash");
    loadCustomers();
  }, [isOpen, loadCustomers, totalAmount]);

  const numericAmount = useMemo(() => {
    const value = parseFloat(amount.replace(",", "."));
    return Number.isNaN(value) ? 0 : value;
  }, [amount]);

  const change = Math.max(0, numericAmount - totalAmount);
  const pointsEarned =
    selectedCustomer && totalAmount > 0 ? Math.max(1, Math.floor(totalAmount / 10)) : 0;

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  const handleKey = (key) => {
    if (key === "⌫") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    setAmount((prev) => `${prev}${key}`);
  };

  const quickAmounts = [5, 10, 20, 50];

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    if (!query) return customers;
    const digits = query.replace(/\D/g, "");
    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(query);
      const phoneMatch = digits
        ? customer.phone.replace(/\s/g, "").includes(digits)
        : false;
      return nameMatch || phoneMatch;
    });
  }, [customerQuery, customers]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerQuery(`${customer.name} • ${customer.phone}`);
    setIsCustomerMenuOpen(false);
  };

  const handleCreateCustomer = () => {
    setIsCustomerMenuOpen(false);
    setIsCreateOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-xs text-text-secondary">Vente</p>
            <h3 className="text-xl font-semibold text-text-primary">Paiement</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface/70 hover:text-text-primary"
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase text-text-secondary">
                Client
              </p>
              <div className="mt-2 relative">
                <input
                  type="text"
                  value={customerQuery}
                  onChange={(event) => {
                    setCustomerQuery(event.target.value);
                    setIsCustomerMenuOpen(true);
                  }}
                  onFocus={() => setIsCustomerMenuOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsCustomerMenuOpen(false), 120);
                  }}
                  placeholder="Nom ou téléphone"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {isCustomerMenuOpen ? (
                  <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-surface shadow-lg">
                    {loadingCustomers ? (
                      <div className="p-3 text-sm text-text-secondary">
                        Chargement des clients...
                      </div>
                    ) : filteredCustomers.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSelectCustomer(customer)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-primary hover:bg-surface/70"
                          >
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-text-secondary">
                                {customer.phone}
                              </p>
                            </div>
                            <span className="text-xs text-text-secondary">
                              {customer.points} pts
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-text-secondary">
                        <p>Client introuvable.</p>
                        <p className="mt-1">Créer un compte ?</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCreateCustomer}
                            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary/90"
                          >
                            <UserPlus size={14} strokeWidth={1.5} />
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCustomerMenuOpen(false)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface/70"
                          >
                            Non
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              {selectedCustomer ? (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Points:{" "}
                    <span className="font-semibold text-text-primary">
                      {selectedCustomer.points}
                    </span>
                  </div>
                </div>
              ) : null}
              {selectedCustomer && pointsEarned > 0 ? (
                <p className="mt-2 text-xs text-text-secondary">
                  +{pointsEarned} points à l&apos;achat
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase text-text-secondary">
                Détails de la transaction
              </p>
              <div className="no-scrollbar mt-3 max-h-[28vh] overflow-y-auto space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-text-secondary">Panier vide</p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {item.product}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {item.cartQty} x {item.price?.toFixed(2)} €
                        </p>
                      </div>
                      <p className="font-semibold text-text-primary">
                        {(item.cartQty * (item.price ?? 0)).toFixed(2)} €
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Sous-total</span>
                <span className="font-semibold text-text-primary">
                  {totalAmount.toFixed(2)} €
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Montant reçu</span>
                <span className="font-semibold text-text-primary">
                  {numericAmount.toFixed(2)} €
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Monnaie</span>
                <span className="font-semibold text-text-primary">
                  {change.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase text-text-secondary">
                Mode de paiement
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { id: "cash", label: "Cash", icon: DollarSign },
                  { id: "card", label: "Carte", icon: CreditCard },
                  { id: "mobile", label: "Mobile", icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={[
                        "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                        active
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-border bg-surface text-text-primary hover:bg-surface/70",
                      ].join(" ")}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase text-text-secondary">
                Montant reçu
              </p>
              <input
                type="text"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="0.00"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value.toString())}
                    className="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-neutral-300 dark:bg-surface dark:border dark:border-border dark:hover:bg-surface/70"
                  >
                    {value} €
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {keypad.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKey(key)}
                    className="rounded-lg border border-border bg-surface py-2 text-sm font-semibold text-text-primary hover:bg-surface/70"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                let updatedCustomer = selectedCustomer;
                if (selectedCustomer && pointsEarned > 0) {
                  const updatedPoints = selectedCustomer.points + pointsEarned;
                  try {
                    const response = await apiPatch(
                      `/api/customers/${selectedCustomer.id}`,
                      { points: updatedPoints }
                    );
                    updatedCustomer = normalizeCustomer(response);
                    setCustomers((prev) =>
                      prev.map((customer) =>
                        customer.id === updatedCustomer.id
                          ? updatedCustomer
                          : customer
                      )
                    );
                    setSelectedCustomer(updatedCustomer);
                  } catch (error) {
                    showToast({
                      title: "Erreur",
                      message:
                        error.message || "Impossible de mettre à jour les points.",
                      variant: "danger",
                    });
                  }
                }
                onConfirm?.({
                  amount: numericAmount,
                  method,
                  customer: updatedCustomer,
                  pointsEarned,
                });
              }}
              disabled={totalAmount <= 0}
              className={[
                "w-full rounded-lg px-4 py-3 text-sm font-semibold text-white",
                totalAmount <= 0
                  ? "cursor-not-allowed bg-neutral-300 text-text-secondary"
                  : "bg-secondary hover:bg-secondary/90",
              ].join(" ")}
            >
              Payer maintenant
            </button>
          </div>
        </div>
      </div>

      <CustomerCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        nextSequence={customers.length + 1}
        onSubmit={async (payload) => {
          try {
            const created = await apiPost("/api/customers", payload);
            const normalized = normalizeCustomer(created);
            setCustomers((prev) => [normalized, ...prev]);
            handleSelectCustomer(normalized);
            setIsCreateOpen(false);
            return normalized;
          } catch (error) {
            showToast({
              title: "Erreur",
              message: error.message || "Impossible de créer le client.",
              variant: "danger",
            });
            throw error;
          }
        }}
      />
    </div>
  );
};

export default PaymentModal;
