import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type SubscriptionPaymentSource =
  | "account"
  | "card";

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  paymentDay: number;
  categoryId?: string;
  categoryName?: string;
  paymentSource: SubscriptionPaymentSource;
  accountId?: string;
  cardId?: string;
  note?: string;
  active: boolean;
  lastPaidAt?: string;
};

type SubscriptionInput = Omit<
  Subscription,
  "id"
>;

type SubscriptionContextType = {
  subscriptions: Subscription[];

  addSubscription: (
    subscription: SubscriptionInput
  ) => void;

  updateSubscription: (
    id: string,
    subscription: SubscriptionInput
  ) => void;

  deleteSubscription: (
    id: string
  ) => void;

  toggleSubscription: (
    id: string
  ) => void;

  markSubscriptionPaid: (
    id: string,
    paidAt?: string
  ) => boolean;

  markSubscriptionUnpaid: (
    id: string
  ) => boolean;

  isSubscriptionPaidThisMonth: (
    id: string
  ) => boolean;
};

const STORAGE_KEY =
  "@butce_subscriptions";

const SubscriptionContext =
  createContext<
    SubscriptionContextType | null
  >(null);

function createId() {
  return (
    Date.now().toString() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );
}

function normalizeSubscription(
  item: any
): Subscription {
  return {
    id:
      typeof item?.id === "string" &&
      item.id.length > 0
        ? item.id
        : createId(),

    name:
      typeof item?.name === "string"
        ? item.name.trim()
        : "",

    amount:
      typeof item?.amount === "number" &&
      Number.isFinite(item.amount)
        ? item.amount
        : Number(item?.amount) || 0,

    currency:
      typeof item?.currency === "string"
        ? item.currency
        : "TRY",

    paymentDay: Math.min(
      31,
      Math.max(
        1,
        Number(item?.paymentDay) || 1
      )
    ),

    categoryId:
      typeof item?.categoryId === "string" &&
      item.categoryId.length > 0
        ? item.categoryId
        : undefined,

    categoryName:
      typeof item?.categoryName ===
        "string" &&
      item.categoryName.length > 0
        ? item.categoryName
        : undefined,

    paymentSource:
      item?.paymentSource === "card"
        ? "card"
        : "account",

    accountId:
      typeof item?.accountId === "string" &&
      item.accountId.length > 0
        ? item.accountId
        : undefined,

    cardId:
      typeof item?.cardId === "string" &&
      item.cardId.length > 0
        ? item.cardId
        : undefined,

    note:
      typeof item?.note === "string" &&
      item.note.trim().length > 0
        ? item.note.trim()
        : undefined,

    active:
      typeof item?.active === "boolean"
        ? item.active
        : true,

    lastPaidAt:
      typeof item?.lastPaidAt ===
        "string" &&
      item.lastPaidAt.length > 0
        ? item.lastPaidAt
        : undefined,
  };
}

function isSameMonth(
  dateString: string
) {
  const date = new Date(dateString);
  const now = new Date();

  if (
    Number.isNaN(date.getTime())
  ) {
    return false;
  }

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth()
  );
}

export function SubscriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    subscriptions,
    setSubscriptions,
  ] = useState<Subscription[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!stored) {
          setSubscriptions([]);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setSubscriptions([]);
          return;
        }

        const normalized =
          parsed
            .map(normalizeSubscription)
            .filter(
              (
                item: Subscription
              ) =>
                item.name.length > 0 &&
                item.amount > 0
            );

        setSubscriptions(
          normalized
        );
      } catch (error) {
        console.error(
          "Abonelikler yüklenemedi:",
          error
        );

        setSubscriptions([]);
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
      JSON.stringify(subscriptions)
    ).catch((error) => {
      console.error(
        "Abonelikler kaydedilemedi:",
        error
      );
    });
  }, [
    subscriptions,
    loaded,
  ]);

  function addSubscription(
    subscription: SubscriptionInput
  ) {
    const newSubscription =
      normalizeSubscription({
        ...subscription,
        id: createId(),
      });

    setSubscriptions(
      (current) => [
        ...current,
        newSubscription,
      ]
    );
  }

  function updateSubscription(
    id: string,
    subscription: SubscriptionInput
  ) {
    setSubscriptions(
      (current) =>
        current.map((item) =>
          item.id === id
            ? normalizeSubscription({
                ...subscription,
                id,
                lastPaidAt:
                  item.lastPaidAt,
              })
            : item
        )
    );
  }

  function deleteSubscription(
    id: string
  ) {
    setSubscriptions(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function toggleSubscription(
    id: string
  ) {
    setSubscriptions(
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

  function markSubscriptionPaid(
    id: string,
    paidAt = new Date().toISOString()
  ) {
    const subscription =
      subscriptions.find(
        (item) =>
          item.id === id
      );

    if (!subscription) {
      return false;
    }

    if (
      isSubscriptionPaidThisMonth(
        id
      )
    ) {
      return false;
    }

    setSubscriptions(
      (current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                lastPaidAt:
                  paidAt,
              }
            : item
        )
    );

    return true;
  }

  function markSubscriptionUnpaid(
    id: string
  ) {
    const subscription =
      subscriptions.find(
        (item) =>
          item.id === id
      );

    if (!subscription) {
      return false;
    }

    setSubscriptions(
      (current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                lastPaidAt:
                  undefined,
              }
            : item
        )
    );

    return true;
  }

  function isSubscriptionPaidThisMonth(
    id: string
  ) {
    const subscription =
      subscriptions.find(
        (item) =>
          item.id === id
      );

    if (
      !subscription ||
      !subscription.lastPaidAt
    ) {
      return false;
    }

    return isSameMonth(
      subscription.lastPaidAt
    );
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
        markSubscriptionPaid,
        markSubscriptionUnpaid,
        isSubscriptionPaidThisMonth,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context =
    useContext(
      SubscriptionContext
    );

  if (!context) {
    throw new Error(
      "useSubscriptions must be used inside SubscriptionProvider"
    );
  }

  return context;
}