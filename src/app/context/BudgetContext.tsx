import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "../../lib/userStorage";

export type Budget = {
  id: string;

  // Kategori adı eski kayıtlarla uyumluluk için korunuyor.
  category: string;

  // Yeni sistemde kategori ID'si kullanılacak.
  // Eski bütçelerde boş olabilir.
  categoryId?: string;

  month: string;
  limit: number;
  spent: number;
};

type NewBudget = Omit<Budget, "id">;

type BudgetContextType = {
  budgets: Budget[];

  addBudget: (
    budget: NewBudget
  ) => void;

  updateBudget: (
    id: string,
    budget: NewBudget
  ) => void;

  deleteBudget: (
    id: string
  ) => void;

  changeSpent: (
    id: string,
    amount: number
  ) => void;
};

const BudgetContext =
  createContext<BudgetContextType | null>(
    null
  );

const BUDGETS_STORAGE_KEY =
  "@butce_budgets";

export function BudgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    async function loadBudgets() {
      try {
        const savedBudgets =
          await AsyncStorage.getItem(
            BUDGETS_STORAGE_KEY
          );

        if (savedBudgets) {
          const parsedBudgets =
            JSON.parse(savedBudgets);

          const normalizedBudgets =
            parsedBudgets.map(
              (budget: any) => ({
                ...budget,

                category:
                  budget.category ?? "",

                categoryId:
                  budget.categoryId ??
                  undefined,

                month:
                  budget.month ?? "",

                limit:
                  Number(
                    budget.limit
                  ) || 0,

                spent:
                  Number(
                    budget.spent
                  ) || 0,
              })
            );

          setBudgets(
            normalizedBudgets
          );
        }
      } catch (error) {
        console.log(
          "Bütçeler yüklenemedi:",
          error
        );
      } finally {
        setIsLoaded(true);
      }
    }

    loadBudgets();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveBudgets() {
      try {
        await AsyncStorage.setItem(
          BUDGETS_STORAGE_KEY,
          JSON.stringify(budgets)
        );
      } catch (error) {
        console.log(
          "Bütçeler kaydedilemedi:",
          error
        );
      }
    }

    saveBudgets();
  }, [budgets, isLoaded]);

  function addBudget(
    budget: NewBudget
  ) {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent:
        Number(budget.spent) || 0,
      limit:
        Number(budget.limit) || 0,
    };

    setBudgets((current) => [
      ...current,
      newBudget,
    ]);
  }

  function updateBudget(
    id: string,
    budget: NewBudget
  ) {
    setBudgets((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...budget,
              id,
              spent:
                Number(
                  budget.spent
                ) || 0,
              limit:
                Number(
                  budget.limit
                ) || 0,
            }
          : item
      )
    );
  }

  function deleteBudget(
    id: string
  ) {
    setBudgets((current) =>
      current.filter(
        (budget) =>
          budget.id !== id
      )
    );
  }

  function changeSpent(
    id: string,
    amount: number
  ) {
    setBudgets((current) =>
      current.map((budget) =>
        budget.id === id
          ? {
              ...budget,
              spent:
                budget.spent +
                amount,
            }
          : budget
      )
    );
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        changeSpent,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context =
    useContext(BudgetContext);

  if (!context) {
    throw new Error(
      "useBudgets must be used inside BudgetProvider"
    );
  }

  return context;
}
