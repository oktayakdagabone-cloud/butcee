import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "../../lib/userStorage";

const STORAGE_KEY =
  "@butce_fixed_expenses";

export type FixedExpenseFrequency =
  | "monthly"
  | "yearly";

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
  paymentDay: number;
  frequency: FixedExpenseFrequency;
  active: boolean;
  note?: string;
  accountId?: string;
  cardId?: string;
  lastPaidAt?: string;
};

type FixedExpenseInput = {
  name: string;
  amount: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
  paymentDay: number;
  frequency: FixedExpenseFrequency;
  active: boolean;
  note?: string;
  accountId?: string;
  cardId?: string;
};

type FixedExpenseContextValue = {
  fixedExpenses: FixedExpense[];

  addFixedExpense: (
    input: FixedExpenseInput
  ) => Promise<FixedExpense>;

  updateFixedExpense: (
    id: string,
    updates: Partial<FixedExpenseInput>
  ) => Promise<boolean>;

  deleteFixedExpense: (
    id: string
  ) => Promise<void>;

  toggleFixedExpense: (
    id: string
  ) => Promise<void>;

  markFixedExpensePaid: (
    id: string,
    paidAt?: string
  ) => Promise<boolean>;

  markFixedExpenseUnpaid: (
    id: string
  ) => Promise<boolean>;

  isFixedExpensePaidThisMonth: (
    id: string
  ) => boolean;

  getMonthlyTotal: () => number;

  getYearlyTotal: () => number;
};

const FixedExpenseContext =
  createContext<
    FixedExpenseContextValue | undefined
  >(undefined);

function createId() {
  return (
    `${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );
}

function normalizeFixedExpense(
  item: Partial<FixedExpense>
): FixedExpense {
  return {
    id: item.id || createId(),

    name:
      typeof item.name === "string"
        ? item.name
        : "",

    amount:
      typeof item.amount === "number" &&
      Number.isFinite(item.amount)
        ? item.amount
        : Number(item.amount) || 0,

    currency:
      item.currency || "TRY",

    categoryId:
      item.categoryId || undefined,

    categoryName:
      item.categoryName || undefined,

    paymentDay: Math.min(
      31,
      Math.max(
        1,
        Number(item.paymentDay) || 1
      )
    ),

    frequency:
      item.frequency === "yearly"
        ? "yearly"
        : "monthly",

    active:
      item.active !== false,

    note:
      item.note || undefined,

    accountId:
      item.accountId || undefined,

    cardId:
      item.cardId || undefined,

    lastPaidAt:
      item.lastPaidAt || undefined,
  };
}

function sameMonth(
  first: string,
  second: string
) {
  const firstDate = new Date(first);
  const secondDate = new Date(second);

  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth()
  );
}

export function FixedExpenseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    fixedExpenses,
    setFixedExpenses,
  ] = useState<FixedExpense[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const raw =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!raw) {
          setFixedExpenses([]);
          return;
        }

        const parsed =
          JSON.parse(raw);

        if (!Array.isArray(parsed)) {
          setFixedExpenses([]);
          return;
        }

        setFixedExpenses(
          parsed.map(
            normalizeFixedExpense
          )
        );
      } catch (error) {
        console.error(
          "Sabit giderler yüklenemedi:",
          error
        );

        setFixedExpenses([]);
      } finally {
        setLoaded(true);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(fixedExpenses)
    ).catch((error) => {
      console.error(
        "Sabit giderler kaydedilemedi:",
        error
      );
    });
  }, [
    fixedExpenses,
    loaded,
  ]);

  async function addFixedExpense(
    input: FixedExpenseInput
  ) {
    const item =
      normalizeFixedExpense(input);

    setFixedExpenses(
      (current) => [
        ...current,
        item,
      ]
    );

    return item;
  }

  async function updateFixedExpense(
    id: string,
    updates: Partial<FixedExpenseInput>
  ) {
    let found = false;

    setFixedExpenses(
      (current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item;
          }

          found = true;

          return normalizeFixedExpense({
            ...item,
            ...updates,
            id: item.id,
            lastPaidAt:
              item.lastPaidAt,
          });
        })
    );

    return found;
  }

  async function deleteFixedExpense(
    id: string
  ) {
    setFixedExpenses(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  async function toggleFixedExpense(
    id: string
  ) {
    setFixedExpenses(
      (current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                active:
                  !item.active,
              }
            : item
        )
    );
  }

  async function markFixedExpensePaid(
    id: string,
    paidAt = new Date().toISOString()
  ) {
    const item =
      fixedExpenses.find(
        (expense) =>
          expense.id === id
      );

    if (!item) {
      return false;
    }

    if (
      isFixedExpensePaidThisMonth(
        id
      )
    ) {
      return false;
    }

    setFixedExpenses(
      (current) =>
        current.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                lastPaidAt:
                  paidAt,
              }
            : expense
        )
    );

    return true;
  }

  async function markFixedExpenseUnpaid(
    id: string
  ) {
    const item =
      fixedExpenses.find(
        (expense) =>
          expense.id === id
      );

    if (!item) {
      return false;
    }

    setFixedExpenses(
      (current) =>
        current.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                lastPaidAt:
                  undefined,
              }
            : expense
        )
    );

    return true;
  }

  function isFixedExpensePaidThisMonth(
    id: string
  ) {
    const item =
      fixedExpenses.find(
        (expense) =>
          expense.id === id
      );

    if (
      !item ||
      !item.lastPaidAt
    ) {
      return false;
    }

    return sameMonth(
      item.lastPaidAt,
      new Date().toISOString()
    );
  }

  function getMonthlyTotal() {
    return fixedExpenses
      .filter(
        (item) => item.active
      )
      .reduce((total, item) => {
        if (
          item.frequency ===
          "monthly"
        ) {
          return (
            total + item.amount
          );
        }

        return (
          total +
          item.amount / 12
        );
      }, 0);
  }

  function getYearlyTotal() {
    return fixedExpenses
      .filter(
        (item) => item.active
      )
      .reduce((total, item) => {
        if (
          item.frequency ===
          "yearly"
        ) {
          return (
            total + item.amount
          );
        }

        return (
          total +
          item.amount * 12
        );
      }, 0);
  }

  const value = useMemo(
    () => ({
      fixedExpenses,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      toggleFixedExpense,
      markFixedExpensePaid,
      markFixedExpenseUnpaid,
      isFixedExpensePaidThisMonth,
      getMonthlyTotal,
      getYearlyTotal,
    }),
    [fixedExpenses]
  );

  return (
    <FixedExpenseContext.Provider
      value={value}
    >
      {children}
    </FixedExpenseContext.Provider>
  );
}

export function useFixedExpenses() {
  const context =
    useContext(
      FixedExpenseContext
    );

  if (!context) {
    throw new Error(
      "useFixedExpenses must be used inside FixedExpenseProvider"
    );
  }

  return context;
}
