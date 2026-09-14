import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "../../lib/userStorage";

export type AccountType =
  | "bank"
  | "cash"
  | "savings";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
};

type AccountContextType = {
  accounts: Account[];

  addAccount: (
    account: Omit<Account, "id">
  ) => void;

  updateAccount: (
    id: string,
    account: Omit<Account, "id">
  ) => void;

  deleteAccount: (
    id: string
  ) => void;

  changeBalance: (
    id: string,
    amount: number
  ) => void;
};

const AccountContext =
  createContext<AccountContextType | null>(
    null
  );

const ACCOUNTS_STORAGE_KEY =
  "@butce_accounts";

export function AccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const savedAccounts =
          await AsyncStorage.getItem(
            ACCOUNTS_STORAGE_KEY
          );

        if (savedAccounts) {
          setAccounts(
            JSON.parse(savedAccounts)
          );
        }
      } catch (error) {
        console.log(
          "Hesaplar yüklenemedi:",
          error
        );
      } finally {
        setIsLoaded(true);
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveAccounts() {
      try {
        await AsyncStorage.setItem(
          ACCOUNTS_STORAGE_KEY,
          JSON.stringify(accounts)
        );
      } catch (error) {
        console.log(
          "Hesaplar kaydedilemedi:",
          error
        );
      }
    }

    saveAccounts();
  }, [accounts, isLoaded]);

  function addAccount(
    account: Omit<Account, "id">
  ) {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };

    setAccounts((current) => [
      ...current,
      newAccount,
    ]);
  }

  function updateAccount(
    id: string,
    account: Omit<Account, "id">
  ) {
    setAccounts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...account,
              id,
            }
          : item
      )
    );
  }

  function deleteAccount(id: string) {
    setAccounts((current) =>
      current.filter(
        (account) =>
          account.id !== id
      )
    );
  }

  function changeBalance(
    id: string,
    amount: number
  ) {
    const delta = Number(amount);

    if (!Number.isFinite(delta)) {
      throw new Error("Geçersiz bakiye değişikliği.");
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === id
          ? {
              ...account,
              balance: Math.round((Number(account.balance) + delta) * 100) / 100,
            }
          : account
      )
    );
  }

  return (
    <AccountContext.Provider
      value={{
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        changeBalance,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context =
    useContext(AccountContext);

  if (!context) {
    throw new Error(
      "useAccounts must be used inside AccountProvider"
    );
  }

  return context;
}
