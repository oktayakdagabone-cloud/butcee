import AsyncStorage from "../../lib/userStorage";
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

export type SubscriptionCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type SubscriptionPreset = {
  id: string;
  name: string;
  icon: string;
  color: string;
  categoryId: string;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  paymentDay: number;
  categoryId?: string;
  categoryName?: string;
  subscriptionIcon?: string;
  subscriptionColor?: string;
  paymentSource: SubscriptionPaymentSource;
  accountId?: string;
  cardId?: string;
  note?: string;
  active: boolean;
  lastPaidAt?: string;
};

type NewSubscription = Omit<
  Subscription,
  "id"
>;

type SubscriptionContextType = {
  subscriptions: Subscription[];
  subscriptionCategories: SubscriptionCategory[];
  subscriptionPresets: SubscriptionPreset[];

  addSubscription: (
    subscription: NewSubscription
  ) => void;

  updateSubscription: (
    id: string,
    subscription: NewSubscription
  ) => void;

  deleteSubscription: (
    id: string
  ) => void;

  toggleSubscription: (
    id: string
  ) => void;
};

const SUBSCRIPTIONS_STORAGE_KEY =
  "@butce_subscriptions";

const SUBSCRIPTION_CATEGORIES_STORAGE_KEY =
  "@butce_subscription_categories";

const DEFAULT_SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] =
  [
    {
      id: "video",
      name: "Video",
      icon: "video",
      color: "#EF4444",
    },
    {
      id: "music",
      name: "Müzik",
      icon: "music",
      color: "#8B5CF6",
    },
    {
      id: "cloud",
      name: "Bulut",
      icon: "cloud",
      color: "#3B82F6",
    },
    {
      id: "software",
      name: "Yazılım",
      icon: "software",
      color: "#6366F1",
    },
    {
      id: "gaming",
      name: "Oyun",
      icon: "gaming",
      color: "#22C55E",
    },
    {
      id: "education",
      name: "Eğitim",
      icon: "education",
      color: "#F59E0B",
    },
    {
      id: "news",
      name: "Haber / Dergi",
      icon: "news",
      color: "#64748B",
    },
    {
      id: "fitness",
      name: "Spor / Fitness",
      icon: "fitness",
      color: "#F97316",
    },
    {
      id: "telecom",
      name: "Telekom",
      icon: "telecom",
      color: "#06B6D4",
    },
    {
      id: "security",
      name: "Güvenlik",
      icon: "security",
      color: "#14B8A6",
    },
    {
      id: "other",
      name: "Diğer",
      icon: "other",
      color: "#94A3B8",
    },
  ];

const DEFAULT_SUBSCRIPTION_PRESETS: SubscriptionPreset[] =
  [
    {
      id: "netflix",
      name: "Netflix",
      icon: "simple:netflix",
      color: "#E50914",
      categoryId: "video",
    },
    {
      id: "spotify",
      name: "Spotify",
      icon: "simple:spotify",
      color: "#1DB954",
      categoryId: "music",
    },
    {
      id: "youtube_premium",
      name: "YouTube Premium",
      icon: "simple:youtube",
      color: "#FF0000",
      categoryId: "video",
    },
    {
      id: "amazon_prime",
      name: "Amazon Prime",
      icon: "simple:amazon",
      color: "#00A8E1",
      categoryId: "video",
    },
    {
      id: "disney_plus",
      name: "Disney+",
      icon: "simple:disneyplus",
      color: "#113CCF",
      categoryId: "video",
    },
    {
      id: "max",
      name: "Max",
      icon: "simple:max",
      color: "#000000",
      categoryId: "video",
    },
    {
      id: "apple_music",
      name: "Apple Music",
      icon: "simple:applemusic",
      color: "#FA233B",
      categoryId: "music",
    },
    {
      id: "apple_tv",
      name: "Apple TV+",
      icon: "simple:appletv",
      color: "#111827",
      categoryId: "video",
    },
    {
      id: "icloud",
      name: "iCloud+",
      icon: "simple:icloud",
      color: "#3693F3",
      categoryId: "cloud",
    },
    {
      id: "google_one",
      name: "Google One",
      icon: "simple:googleone",
      color: "#4285F4",
      categoryId: "cloud",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      icon: "simple:openai",
      color: "#10A37F",
      categoryId: "software",
    },
    {
      id: "microsoft_365",
      name: "Microsoft 365",
      icon: "simple:microsoft365",
      color: "#D83B01",
      categoryId: "software",
    },
    {
      id: "adobe",
      name: "Adobe",
      icon: "simple:adobe",
      color: "#FF0000",
      categoryId: "software",
    },
    {
      id: "xbox",
      name: "Xbox Game Pass",
      icon: "simple:xbox",
      color: "#107C10",
      categoryId: "gaming",
    },
    {
      id: "playstation",
      name: "PlayStation Plus",
      icon: "simple:playstation",
      color: "#003791",
      categoryId: "gaming",
    },
    {
      id: "duolingo",
      name: "Duolingo",
      icon: "simple:duolingo",
      color: "#58CC02",
      categoryId: "education",
    },
    {
      id: "medium",
      name: "Medium",
      icon: "simple:medium",
      color: "#000000",
      categoryId: "news",
    },
    {
      id: "strava",
      name: "Strava",
      icon: "simple:strava",
      color: "#FC4C02",
      categoryId: "fitness",
    },
    {
      id: "notion",
      name: "Notion",
      icon: "simple:notion",
      color: "#000000",
      categoryId: "software",
    },
    {
      id: "other",
      name: "Diğer",
      icon: "other",
      color: "#94A3B8",
      categoryId: "other",
    },
  ];

const SubscriptionContext =
  createContext<
    SubscriptionContextType | null
  >(null);

export function SubscriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  const [
    subscriptionCategories,
    setSubscriptionCategories,
  ] = useState<
    SubscriptionCategory[]
  >(
    DEFAULT_SUBSCRIPTION_CATEGORIES
  );

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    saveData();
  }, [
    subscriptions,
    subscriptionCategories,
    isLoaded,
  ]);

  async function loadData() {
    try {
      const [
        savedSubscriptions,
        savedCategories,
      ] = await Promise.all([
        AsyncStorage.getItem(
          SUBSCRIPTIONS_STORAGE_KEY
        ),
        AsyncStorage.getItem(
          SUBSCRIPTION_CATEGORIES_STORAGE_KEY
        ),
      ]);

      if (savedSubscriptions) {
        const parsed =
          JSON.parse(
            savedSubscriptions
          );

        if (Array.isArray(parsed)) {
          const normalized =
            parsed
              .map((item) => ({
                ...item,

                id:
                  typeof item.id ===
                  "string"
                    ? item.id
                    : `${Date.now()}-${Math.random()}`,

                name:
                  typeof item.name ===
                  "string"
                    ? item.name
                    : "",

                amount:
                  typeof item.amount ===
                  "number"
                    ? item.amount
                    : 0,

                currency:
                  typeof item.currency ===
                  "string"
                    ? item.currency
                    : "TRY",

                paymentDay:
                  typeof item.paymentDay ===
                  "number"
                    ? item.paymentDay
                    : 1,

                paymentSource:
                  item.paymentSource ===
                  "card"
                    ? "card"
                    : "account",

                categoryId:
                  typeof item.categoryId ===
                  "string"
                    ? item.categoryId
                    : undefined,

                categoryName:
                  typeof item.categoryName ===
                  "string"
                    ? item.categoryName
                    : undefined,

                subscriptionIcon:
                  typeof item.subscriptionIcon ===
                  "string"
                    ? item.subscriptionIcon
                    : undefined,

                subscriptionColor:
                  typeof item.subscriptionColor ===
                  "string"
                    ? item.subscriptionColor
                    : undefined,

                accountId:
                  typeof item.accountId ===
                  "string"
                    ? item.accountId
                    : undefined,

                cardId:
                  typeof item.cardId ===
                  "string"
                    ? item.cardId
                    : undefined,

                note:
                  typeof item.note ===
                  "string"
                    ? item.note
                    : "",

                active:
                  typeof item.active ===
                  "boolean"
                    ? item.active
                    : true,
              }))
              .filter(
                (item) =>
                  item.name.trim() !== "" &&
                  item.amount > 0 &&
                  item.paymentDay >= 1 &&
                  item.paymentDay <= 31
              );

          setSubscriptions(
            normalized
          );
        }
      }

      if (savedCategories) {
        const parsed =
          JSON.parse(
            savedCategories
          );

        if (Array.isArray(parsed)) {
          setSubscriptionCategories(
            parsed
          );
        }
      }
    } catch (error) {
      console.log(
        "Abonelik verileri yüklenemedi:",
        error
      );
    } finally {
      setIsLoaded(true);
    }
  }

  async function saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          SUBSCRIPTIONS_STORAGE_KEY,
          JSON.stringify(
            subscriptions
          )
        ),
        AsyncStorage.setItem(
          SUBSCRIPTION_CATEGORIES_STORAGE_KEY,
          JSON.stringify(
            subscriptionCategories
          )
        ),
      ]);
    } catch (error) {
      console.log(
        "Abonelik verileri kaydedilemedi:",
        error
      );
    }
  }

  function addSubscription(
    subscription: NewSubscription
  ) {
    const newSubscription: Subscription =
      {
        ...subscription,
        id: `${Date.now()}-${Math.random()}`,
      };

    setSubscriptions((current) => [
      ...current,
      newSubscription,
    ]);
  }

  function updateSubscription(
    id: string,
    subscription: NewSubscription
  ) {
    setSubscriptions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...subscription,
              id,
            }
          : item
      )
    );
  }

  function deleteSubscription(
    id: string
  ) {
    setSubscriptions((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function toggleSubscription(
    id: string
  ) {
    setSubscriptions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              active: !item.active,
            }
          : item
      )
    );
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        subscriptionCategories,
        subscriptionPresets:
          DEFAULT_SUBSCRIPTION_PRESETS,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
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
