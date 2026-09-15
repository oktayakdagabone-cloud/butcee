import AsyncStorage from "../../lib/userStorage";
import { useCards } from "./CardContext";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@butce_installments";

export type Installment = {
  id: string;
  name: string;
  cardId: string;
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  note?: string;
  updatedAt: string;
};

export type InstallmentInput = Omit<Installment, "id" | "updatedAt">;

type InstallmentContextValue = {
  installments: Installment[];
  addInstallment: (input: InstallmentInput) => Promise<void>;
  updateInstallment: (id: string, input: InstallmentInput) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;
  setPaidInstallments: (id: string, paidInstallments: number) => Promise<void>;
};

const InstallmentContext = createContext<InstallmentContextValue | undefined>(undefined);

function createId() {
  return `installment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toWholeNumber(value: unknown, fallback = 0) {
  const numeric = Math.floor(Number(value));
  return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
}

function normalize(item: Partial<Installment>): Installment {
  const totalInstallments = Math.max(1, toWholeNumber(item.totalInstallments, 1));
  return {
    id: typeof item.id === "string" ? item.id : createId(),
    name: typeof item.name === "string" ? item.name.trim() : "Taksit",
    cardId: typeof item.cardId === "string" ? item.cardId : "",
    totalInstallments,
    paidInstallments: Math.min(totalInstallments, toWholeNumber(item.paidInstallments)),
    installmentAmount: Math.max(0, Number(item.installmentAmount) || 0),
    note: typeof item.note === "string" && item.note.trim() ? item.note.trim() : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
  };
}

export function InstallmentProvider({ children }: { children: ReactNode }) {
  const { changeUsedLimit } = useCards();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setInstallments(parsed.map(normalize));
      })
      .catch((error) => console.error("Taksitler yüklenemedi:", error))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(installments)).catch((error) =>
      console.error("Taksitler kaydedilemedi:", error)
    );
  }, [installments, loaded]);

  const value = useMemo<InstallmentContextValue>(() => ({
    installments,
    addInstallment: async (input) => {
      const installment = normalize({ ...input, id: createId(), updatedAt: new Date().toISOString() });
      if (!installment.name || !installment.cardId) throw new Error("Taksit adı ve kart seçimi zorunludur.");
      if (installment.installmentAmount <= 0) throw new Error("Taksit tutarı zorunludur.");
      await changeUsedLimit(installment.cardId, installment.installmentAmount * installment.totalInstallments);
      setInstallments((current) => [installment, ...current]);
    },
    updateInstallment: async (id, input) => {
      const next = normalize({ ...input, id, updatedAt: new Date().toISOString() });
      if (!next.name || !next.cardId) throw new Error("Taksit adı ve kart seçimi zorunludur.");
      const previous = installments.find((item) => item.id === id);
      if (previous) await changeUsedLimit(previous.cardId, -(previous.installmentAmount * previous.totalInstallments));
      await changeUsedLimit(next.cardId, next.installmentAmount * next.totalInstallments);
      setInstallments((current) => current.map((item) => item.id === id ? next : item));
    },
    deleteInstallment: async (id) => {
      const previous = installments.find((item) => item.id === id);
      if (previous) await changeUsedLimit(previous.cardId, -(previous.installmentAmount * previous.totalInstallments));
      setInstallments((current) => current.filter((item) => item.id !== id));
    },
    setPaidInstallments: async (id, paidInstallments) => {
      setInstallments((current) => current.map((item) =>
        item.id === id
          ? { ...item, paidInstallments: Math.min(item.totalInstallments, toWholeNumber(paidInstallments)), updatedAt: new Date().toISOString() }
          : item
      ));
    },
  }), [installments, changeUsedLimit]);

  return <InstallmentContext.Provider value={value}>{children}</InstallmentContext.Provider>;
}

export function useInstallments() {
  const context = useContext(InstallmentContext);
  if (!context) throw new Error("useInstallments must be used inside InstallmentProvider");
  return context;
}
