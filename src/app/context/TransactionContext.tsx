import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "../../lib/userStorage";

import { useAccounts } from "./AccountContext";
import { useBudgets } from "./BudgetContext";
import { useCards } from "./CardContext";

export type TransactionType =
  | "income"
  | "expense";

export type PaymentSource =
  | "account"
  | "card";

export type Transaction = {
  id: string;

  type: TransactionType;

  amount: number;

  description: string;

  categoryId: string;

  categoryName?: string;

  date: string;

  accountId: string;

  paymentSource: PaymentSource;

  cardId?: string;

  /*
   * İşlem bir sabit giderden oluşturulduysa
   * burada ilgili sabit giderin ID'si tutulur.
   *
   * Normal işlemlerde boş kalır.
   */
  fixedExpenseId?: string;
};

type NewTransaction = Omit<
  Transaction,
  "id" | "date"
>;

type TransactionContextType = {
  transactions: Transaction[];

  addTransaction: (
    transaction: NewTransaction
  ) => void;

  updateTransaction: (
    id: string,
    transaction: Partial<NewTransaction>
  ) => void;

  deleteTransaction: (
    id: string
  ) => void;

  getTransactionByFixedExpenseId: (
    fixedExpenseId: string
  ) => Transaction | undefined;
};

const TransactionContext =
  createContext<TransactionContextType | null>(
    null
  );

const TRANSACTIONS_STORAGE_KEY =
  "@butce_transactions";

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { changeBalance } =
    useAccounts();

  const { cards, changeUsedLimit } =
    useCards();

  const { budgets, changeSpent } =
    useBudgets();

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const savedTransactions =
          await AsyncStorage.getItem(
            TRANSACTIONS_STORAGE_KEY
          );

        if (savedTransactions) {
          const parsedTransactions =
            JSON.parse(savedTransactions);

          if (
            Array.isArray(
              parsedTransactions
            )
          ) {
            const normalizedTransactions =
              parsedTransactions.map(
                (transaction: any) => {
                  const paymentSource =
                    transaction.paymentSource ===
                      "card"
                      ? "card"
                      : "account";

                  return {
                    ...transaction,

                    categoryId:
                      transaction.categoryId ??
                      transaction.category ??
                      "",

                    categoryName:
                      transaction.categoryName ??
                      transaction.category ??
                      "",

                    accountId:
                      transaction.accountId ??
                      "",

                    paymentSource,

                    cardId:
                      transaction.cardId ??
                      undefined,

                    fixedExpenseId:
                      transaction.fixedExpenseId ??
                      undefined,
                  };
                }
              );

            setTransactions(
              normalizedTransactions
            );
          } else {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.log(
          "İşlemler yüklenemedi:",
          error
        );

        setTransactions([]);
      } finally {
        setIsLoaded(true);
      }
    }

    loadTransactions();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveTransactions() {
      try {
        await AsyncStorage.setItem(
          TRANSACTIONS_STORAGE_KEY,
          JSON.stringify(transactions)
        );
      } catch (error) {
        console.log(
          "İşlemler kaydedilemedi:",
          error
        );
      }
    }

    saveTransactions();
  }, [transactions, isLoaded]);

  function getBudgetCategory(
    transaction: Transaction
  ) {
    return (
      transaction.categoryName ??
      transaction.categoryId
    );
  }

  function getMonthLabel(
    date: string
  ) {
    const turkishMonths = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const transactionDate =
      new Date(date);

    if (
      isNaN(
        transactionDate.getTime()
      )
    ) {
      return "";
    }

    return `${turkishMonths[
      transactionDate.getMonth()
    ]} ${transactionDate.getFullYear()}`;
  }

  function updateBudgetForTransaction(
    transaction: Transaction,
    multiplier: number
  ) {
    if (
      transaction.type !==
      "expense"
    ) {
      return;
    }

    const transactionMonth =
      getMonthLabel(
        transaction.date
      );

    const category =
      getBudgetCategory(
        transaction
      );

    const matchingBudgets =
      budgets.filter(
        (budget) =>
          budget.category ===
            category &&
          budget.month ===
            transactionMonth
      );

    matchingBudgets.forEach(
      (budget) => {
        changeSpent(
          budget.id,
          transaction.amount *
            multiplier
        );
      }
    );
  }

  function updateAccountForTransaction(
    transaction: Transaction,
    multiplier: number
  ) {
    if (
      transaction.paymentSource ===
        "card" ||
      transaction.cardId
    ) {
      return;
    }

    const balanceChange =
      transaction.type ===
      "income"
        ? transaction.amount
        : -transaction.amount;

    if (!transaction.accountId) {
      return;
    }

    changeBalance(
      transaction.accountId,
      balanceChange * multiplier
    );
  }

  function updateCardForTransaction(
    transaction: Transaction,
    multiplier: number
  ) {
    if (
      transaction.type !==
        "expense" ||
      transaction.paymentSource !==
        "card" ||
      !transaction.cardId
    ) {
      return;
    }

    const cardExists = cards.some(
      (card) =>
        card.id ===
        transaction.cardId
    );

    if (!cardExists) {
      return;
    }

    changeUsedLimit(
      transaction.cardId,
      transaction.amount *
        multiplier
    );
  }

  function addTransaction(
    transaction: NewTransaction
  ) {
    const newTransaction: Transaction =
      {
        ...transaction,

        id:
          Date.now().toString() +
          Math.random()
            .toString(36)
            .slice(2, 8),

        date:
          new Date().toISOString(),

        paymentSource:
          transaction.paymentSource ??
          "account",

        accountId:
          transaction.accountId ??
          "",

        cardId:
          transaction.cardId ??
          undefined,

        fixedExpenseId:
          transaction.fixedExpenseId ??
          undefined,
      };

    setTransactions(
      (current) => [
        newTransaction,
        ...current,
      ]
    );

    updateAccountForTransaction(
      newTransaction,
      1
    );

    updateCardForTransaction(
      newTransaction,
      1
    );

    updateBudgetForTransaction(
      newTransaction,
      1
    );
  }

  function updateTransaction(
    id: string,
    updatedData: Partial<NewTransaction>
  ) {
    const oldTransaction =
      transactions.find(
        (item) =>
          item.id === id
      );

    if (!oldTransaction) {
      return;
    }

    const updatedTransaction: Transaction =
      {
        ...oldTransaction,
        ...updatedData,
      };

    updateAccountForTransaction(
      oldTransaction,
      -1
    );

    updateCardForTransaction(
      oldTransaction,
      -1
    );

    updateBudgetForTransaction(
      oldTransaction,
      -1
    );

    updateAccountForTransaction(
      updatedTransaction,
      1
    );

    updateCardForTransaction(
      updatedTransaction,
      1
    );

    updateBudgetForTransaction(
      updatedTransaction,
      1
    );

    setTransactions(
      (current) =>
        current.map(
          (transaction) =>
            transaction.id === id
              ? updatedTransaction
              : transaction
        )
    );
  }

  function deleteTransaction(
    id: string
  ) {
    const transaction =
      transactions.find(
        (item) =>
          item.id === id
      );

    if (!transaction) {
      return;
    }

    updateAccountForTransaction(
      transaction,
      -1
    );

    updateCardForTransaction(
      transaction,
      -1
    );

    updateBudgetForTransaction(
      transaction,
      -1
    );

    setTransactions(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function getTransactionByFixedExpenseId(
    fixedExpenseId: string
  ) {
    return transactions.find(
      (transaction) =>
        transaction.fixedExpenseId ===
        fixedExpenseId
    );
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionByFixedExpenseId,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context =
    useContext(
      TransactionContext
    );

  if (!context) {
    throw new Error(
      "useTransactions must be used inside TransactionProvider"
    );
  }

  return context;
}
