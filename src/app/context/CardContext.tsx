import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "../../lib/userStorage";
import { useAccounts } from "./AccountContext";

export type CardType =
  | "credit"
  | "debit";

export type CardNetwork =
  | "visa"
  | "mastercard"
  | "troy"
  | "amex"
  | "other";

export type Card = {
  id: string;
  name: string;
  bankName: string;

  type: CardType;
  network: CardNetwork;

  limit: number;
  usedLimit: number;

  statementDebt: number;
  statementGeneratedAt?: string;

  statementDay: number;
  dueDay: number;
  minimumPaymentRate: number;

  color: string;
};

export type CardPayment = {
  id: string;
  cardId: string;
  amount: number;
  date: string;

  paymentSource:
    | "account"
    | "manual";

  accountId?: string;

  note?: string;
};

export type CardDebtSummary = {
  id: string;

  currentPeriodDebt: number;
  lastStatementDebt: number;
  totalOutstandingDebt: number;

  minimumPaymentRate: number;
  minimumPaymentAmount: number;

  statementDate: Date | null;
  nextStatementDate: Date | null;
  nextDueDate: Date | null;
};

type CardInput = {
  name: string;
  bankName: string;

  type: CardType;
  network?: CardNetwork;

  limit: number;
  usedLimit: number;

  statementDebt?: number;
  statementGeneratedAt?: string;

  statementDay: number;
  dueDay: number;
  minimumPaymentRate: number;

  color: string;
};

type PaymentOptions = {
  paymentSource?:
    | "account"
    | "manual";

  accountId?: string;

  note?: string;
};

type CardContextValue = {
  cards: Card[];

  payments: CardPayment[];

  addCard: (
    input: CardInput
  ) => Promise<void>;

  updateCard: (
    id: string,
    input: CardInput
  ) => Promise<void>;

  deleteCard: (
    id: string
  ) => Promise<void>;

  changeUsedLimit: (
    id: string,
    amount: number
  ) => Promise<void>;

  closeStatement: (
    cardId: string
  ) => Promise<void>;

  makeCardPayment: (
    cardId: string,
    amount: number,
    options?: PaymentOptions
  ) => Promise<void>;

  undoCardPayment: (
    paymentId: string
  ) => Promise<CardPayment>;

  getCardDebtSummary: (
    cardOrId: Card | string,
    transactions?: unknown[],
    today?: Date
  ) => CardDebtSummary;

  getCardPaymentHistory: (
    cardId: string
  ) => CardPayment[];

  getCardById: (
    id: string
  ) => Card | undefined;
};

const CardContext =
  createContext<
    CardContextValue | undefined
  >(undefined);

const CARDS_STORAGE_KEY =
  "@butce_cards";

const PAYMENTS_STORAGE_KEY =
  "@butce_card_payments";

function createId(
  prefix: string
) {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function safeNumber(
  value: unknown,
  fallback = 0
) {
  const numeric =
    Number(value);

  return Number.isFinite(
    numeric
  )
    ? Math.max(
        0,
        numeric
      )
    : fallback;
}

function roundMoney(
  value: number
) {
  return (
    Math.round(
      value * 100
    ) / 100
  );
}

function clampDay(
  value: unknown
) {
  const numeric =
    Math.floor(
      Number(value)
    );

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return 0;
  }

  return Math.min(
    31,
    Math.max(
      0,
      numeric
    )
  );
}

function normalizeNetwork(
  value: unknown
): CardNetwork {
  if (
    value === "visa" ||
    value === "mastercard" ||
    value === "troy" ||
    value === "amex"
  ) {
    return value;
  }

  return "other";
}

function normalizeCard(
  item: any
): Card {
  const limit =
    safeNumber(
      item?.limit
    );

  const usedLimit =
    Math.min(
      safeNumber(
        item?.usedLimit
      ),
      limit
    );

  const statementDebt =
    Math.min(
      safeNumber(
        item?.statementDebt
      ),
      usedLimit
    );

  return {
    id:
      typeof item?.id ===
      "string"
        ? item.id
        : createId(
            "card"
          ),

    name:
      typeof item?.name ===
      "string"
        ? item.name
        : "Kart",

    bankName:
      typeof item?.bankName ===
      "string"
        ? item.bankName
        : "",

    type:
      item?.type ===
      "debit"
        ? "debit"
        : "credit",

    network:
      normalizeNetwork(
        item?.network
      ),

    limit,

    usedLimit,

    statementDebt,

    statementGeneratedAt:
      typeof item?.statementGeneratedAt ===
      "string"
        ? item.statementGeneratedAt
        : undefined,

    statementDay:
      item?.type ===
      "credit"
        ? clampDay(
            item?.statementDay
          )
        : 0,

    dueDay:
      item?.type ===
      "credit"
        ? clampDay(
            item?.dueDay
          )
        : 0,

    minimumPaymentRate:
      item?.type ===
      "credit"
        ? Math.min(
            100,
            safeNumber(
              item?.minimumPaymentRate
            )
          )
        : 0,

    color:
      typeof item?.color ===
      "string"
        ? item.color
        : "#8B5CF6",
  };
}

function normalizePayment(
  item: any
): CardPayment | null {
  if (
    !item ||
    typeof item.id !==
      "string" ||
    typeof item.cardId !==
      "string"
  ) {
    return null;
  }

  const amount =
    safeNumber(
      item.amount
    );

  if (
    amount <= 0
  ) {
    return null;
  }

  return {
    id: item.id,

    cardId:
      item.cardId,

    amount,

    date:
      typeof item.date ===
      "string"
        ? item.date
        : new Date().toISOString(),

    paymentSource:
      item.paymentSource ===
      "account"
        ? "account"
        : "manual",

    accountId:
      typeof item.accountId ===
      "string"
        ? item.accountId
        : undefined,

    note:
      typeof item.note ===
      "string"
        ? item.note
        : undefined,
  };
}

function getDateForDay(
  year: number,
  month: number,
  day: number
) {
  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const safeDay =
    Math.min(
      Math.max(
        day,
        1
      ),
      daysInMonth
    );

  return new Date(
    year,
    month,
    safeDay
  );
}

/**
 * Bu ayın ekstre tarihini döndürür.
 *
 * Örneğin bugün 7 Eylül,
 * ekstre günü 5 ise:
 *
 * 5 Eylül
 *
 * döndürür.
 */
function getCurrentMonthStatementDate(
  statementDay: number,
  referenceDate = new Date()
) {
  if (
    statementDay < 1
  ) {
    return null;
  }

  return getDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    statementDay
  );
}

/**
 * En son gerçekleşmiş ekstre tarihini bulur.
 *
 * Bugün 7 Eylül ve ekstre günü 5:
 * → 5 Eylül
 *
 * Bugün 3 Eylül ve ekstre günü 5:
 * → 5 Ağustos
 */
function getMostRecentStatementDate(
  statementDay: number,
  referenceDate = new Date()
) {
  if (
    statementDay < 1
  ) {
    return null;
  }

  const currentMonthDate =
    getCurrentMonthStatementDate(
      statementDay,
      referenceDate
    );

  if (
    currentMonthDate &&
    currentMonthDate <=
      referenceDate
  ) {
    return currentMonthDate;
  }

  return getDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 1,
    statementDay
  );
}

function getNextStatementDate(
  statementDay: number,
  referenceDate = new Date()
) {
  if (
    statementDay < 1
  ) {
    return null;
  }

  const currentMonthDate =
    getCurrentMonthStatementDate(
      statementDay,
      referenceDate
    );

  const todayStart =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );

  if (
    currentMonthDate &&
    currentMonthDate >
      todayStart
  ) {
    return currentMonthDate;
  }

  return getDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    statementDay
  );
}

function getNextDueDate(
  dueDay: number,
  referenceDate = new Date()
) {
  if (
    dueDay < 1
  ) {
    return null;
  }

  const todayStart =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );

  let date =
    getDateForDay(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      dueDay
    );

  if (
    date <= todayStart
  ) {
    date =
      getDateForDay(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        dueDay
      );
  }

  return date;
}

function shouldAutomaticallyCloseStatement(
  card: Card,
  now = new Date()
) {
  if (
    card.type !==
    "credit"
  ) {
    return false;
  }

  if (
    card.statementDay <
    1
  ) {
    return false;
  }

  const latestStatementDate =
    getMostRecentStatementDate(
      card.statementDay,
      now
    );

  if (
    !latestStatementDate
  ) {
    return false;
  }

  /*
   * Henüz hiç ekstre kesilmemişse
   * geçmişteki ilk ekstre tarihini de
   * otomatik olarak dikkate alıyoruz.
   */
  if (
    !card.statementGeneratedAt
  ) {
    return (
      latestStatementDate <=
      now
    );
  }

  const generatedAt =
    new Date(
      card.statementGeneratedAt
    );

  if (
    isNaN(
      generatedAt.getTime()
    )
  ) {
    return true;
  }

  /*
   * Son oluşturulan ekstre,
   * olması gereken son ekstre tarihinden
   * önceyse yeni ekstre oluşturulmalı.
   */
  return (
    generatedAt.getTime() <
    latestStatementDate.getTime()
  );
}

export function CardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accounts, changeBalance } = useAccounts();
  const [cards, setCards] =
    useState<Card[]>([]);

  const [payments, setPayments] =
    useState<CardPayment[]>([]);

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [
          storedCards,
          storedPayments,
        ] = await Promise.all([
          AsyncStorage.getItem(
            CARDS_STORAGE_KEY
          ),

          AsyncStorage.getItem(
            PAYMENTS_STORAGE_KEY
          ),
        ]);

        if (
          storedCards
        ) {
          const parsed =
            JSON.parse(
              storedCards
            );

          if (
            Array.isArray(
              parsed
            )
          ) {
            setCards(
              parsed.map(
                normalizeCard
              )
            );
          }
        }

        if (
          storedPayments
        ) {
          const parsed =
            JSON.parse(
              storedPayments
            );

          if (
            Array.isArray(
              parsed
            )
          ) {
            setPayments(
              parsed
                .map(
                  normalizePayment
                )
                .filter(
                  (
                    item
                  ): item is CardPayment =>
                    item !== null
                )
            );
          }
        }
      } catch (
        error
      ) {
        console.error(
          "Kart verileri yüklenemedi:",
          error
        );
      } finally {
        setHydrated(
          true
        );
      }
    }

    load();
  }, []);

  /*
   * OTOMATİK EKSTRE KONTROLÜ
   *
   * Uygulama açıldığında ve kartlar yüklendiğinde
   * her kredi kartının ekstre gününü kontrol ediyoruz.
   *
   * Örnek:
   *
   * Ekstre günü: 5
   * Son ekstre: 5 Ağustos
   * Bugün: 7 Eylül
   *
   * → 5 Eylül ekstresi otomatik kesilir.
   *
   * Uygulama 5 Eylül'de kapalıysa bile,
   * 7 Eylül'de açıldığında bu kontrol
   * geçmiş ekstreyi yakalar.
   */
  useEffect(() => {
    if (
      !hydrated ||
      cards.length === 0
    ) {
      return;
    }

    const now =
      new Date();

    let changed = false;

    const updatedCards =
      cards.map(
        (card) => {
          if (
            !shouldAutomaticallyCloseStatement(
              card,
              now
            )
          ) {
            return card;
          }

          const latestStatementDate =
            getMostRecentStatementDate(
              card.statementDay,
              now
            );

          if (
            !latestStatementDate
          ) {
            return card;
          }

          /*
           * Ekstre kesildiği anda,
           * toplam açık borç içindeki
           * henüz ekstreye girmemiş kısmı
           * ekstre borcuna aktarıyoruz.
           *
           * current period =
           * usedLimit - statementDebt
           */
          const currentPeriodDebt =
            Math.max(
              0,
              roundMoney(
                card.usedLimit -
                  card.statementDebt
              )
            );

          const nextStatementDebt =
            Math.min(
              card.usedLimit,
              roundMoney(
                card.statementDebt +
                  currentPeriodDebt
              )
            );

          changed = true;

          return {
            ...card,

            statementDebt:
              nextStatementDebt,

            statementGeneratedAt:
              latestStatementDate.toISOString(),
          };
        }
      );

    if (
      changed
    ) {
      setCards(
        updatedCards
      );
    }
  }, [
    hydrated,
    cards,
  ]);

  useEffect(() => {
    if (
      !hydrated
    ) {
      return;
    }

    AsyncStorage.setItem(
      CARDS_STORAGE_KEY,
      JSON.stringify(
        cards
      )
    ).catch(
      (error) => {
        console.error(
          "Kartlar kaydedilemedi:",
          error
        );
      }
    );
  }, [
    cards,
    hydrated,
  ]);

  useEffect(() => {
    if (
      !hydrated
    ) {
      return;
    }

    AsyncStorage.setItem(
      PAYMENTS_STORAGE_KEY,
      JSON.stringify(
        payments
      )
    ).catch(
      (error) => {
        console.error(
          "Ödemeler kaydedilemedi:",
          error
        );
      }
    );
  }, [
    payments,
    hydrated,
  ]);

  const addCard =
    async (
      input: CardInput
    ) => {
      const limit =
        safeNumber(
          input.limit
        );

      const usedLimit =
        Math.min(
          safeNumber(
            input.usedLimit
          ),
          limit
        );

      const card: Card = {
        id: createId(
          "card"
        ),

        name:
          input.name.trim(),

        bankName:
          input.bankName.trim(),

        type:
          input.type,

        network:
          normalizeNetwork(
            input.network
          ),

        limit,

        usedLimit,

        statementDebt:
          Math.min(
            safeNumber(
              input.statementDebt
            ),
            usedLimit
          ),

        statementGeneratedAt:
          input.statementGeneratedAt,

        statementDay:
          input.type ===
          "credit"
            ? clampDay(
                input.statementDay
              )
            : 0,

        dueDay:
          input.type ===
          "credit"
            ? clampDay(
                input.dueDay
              )
            : 0,

        minimumPaymentRate:
          input.type ===
          "credit"
            ? Math.min(
                100,
                safeNumber(
                  input.minimumPaymentRate
                )
              )
            : 0,

        color:
          input.color ||
          "#8B5CF6",
      };

      setCards(
        (current) => [
          ...current,
          card,
        ]
      );
    };

  const updateCard =
    async (
      id: string,
      input: CardInput
    ) => {
      setCards(
        (current) =>
          current.map(
            (card) => {
              if (
                card.id !==
                id
              ) {
                return card;
              }

              const limit =
                safeNumber(
                  input.limit
                );

              const usedLimit =
                Math.min(
                  safeNumber(
                    input.usedLimit
                  ),
                  limit
                );

              const statementDebt =
                Math.min(
                  typeof input.statementDebt ===
                    "number"
                    ? safeNumber(
                        input.statementDebt
                      )
                    : card.statementDebt,
                  usedLimit
                );

              return {
                ...card,

                name:
                  input.name.trim(),

                bankName:
                  input.bankName.trim(),

                type:
                  input.type,

                network:
                  normalizeNetwork(
                    input.network ??
                      card.network
                  ),

                limit,

                usedLimit,

                statementDebt:
                  input.type ===
                  "credit"
                    ? statementDebt
                    : 0,

                statementGeneratedAt:
                  input.type ===
                  "credit"
                    ? input.statementGeneratedAt ??
                      card.statementGeneratedAt
                    : undefined,

                statementDay:
                  input.type ===
                  "credit"
                    ? clampDay(
                        input.statementDay
                      )
                    : 0,

                dueDay:
                  input.type ===
                  "credit"
                    ? clampDay(
                        input.dueDay
                      )
                    : 0,

                minimumPaymentRate:
                  input.type ===
                  "credit"
                    ? Math.min(
                        100,
                        safeNumber(
                          input.minimumPaymentRate
                        )
                      )
                    : 0,

                color:
                  input.color ||
                  card.color ||
                  "#8B5CF6",
              };
            }
          )
      );
    };

  const deleteCard =
    async (
      id: string
    ) => {
      setCards(
        (current) =>
          current.filter(
            (card) =>
              card.id !==
              id
          )
      );

      setPayments(
        (current) =>
          current.filter(
            (payment) =>
              payment.cardId !==
              id
          )
      );
    };

  const changeUsedLimit =
    async (
      id: string,
      amount: number
    ) => {
      setCards(
        (current) =>
          current.map(
            (card) => {
              if (
                card.id !==
                id
              ) {
                return card;
              }

              const next =
                Math.min(
                  Math.max(
                    0,
                    roundMoney(
                      safeNumber(
                        amount
                      )
                    )
                  ),
                  card.limit
                );

              return {
                ...card,

                usedLimit:
                  next,

                statementDebt:
                  Math.min(
                    card.statementDebt,
                    next
                  ),
              };
            }
          )
      );
    };

  const closeStatement =
    async (
      cardId: string
    ) => {
      setCards(
        (current) =>
          current.map(
            (card) => {
              if (
                card.id !==
                  cardId ||
                card.type !==
                  "credit"
              ) {
                return card;
              }

              const currentPeriod =
                Math.max(
                  0,
                  roundMoney(
                    card.usedLimit -
                      card.statementDebt
                  )
                );

              const statementDebt =
                Math.min(
                  card.usedLimit,
                  roundMoney(
                    card.statementDebt +
                      currentPeriod
                  )
                );

              return {
                ...card,

                statementDebt,

                statementGeneratedAt:
                  new Date().toISOString(),
              };
            }
          )
      );
    };

  const makeCardPayment =
    async (
      cardId: string,
      amount: number,
      options?: PaymentOptions
    ) => {
      const paymentAmount =
        roundMoney(
          safeNumber(
            amount
          )
        );

      if (
        paymentAmount <=
        0
      ) {
        throw new Error(
          "Ödeme tutarı 0'dan büyük olmalıdır."
        );
      }

      const card =
        cards.find(
          (item) =>
            item.id ===
            cardId
        );

      if (!card) {
        throw new Error(
          "Kart bulunamadı."
        );
      }

      if (
        card.type !==
        "credit"
      ) {
        throw new Error(
          "Banka kartına kredi kartı ödemesi yapılamaz."
        );
      }

      const debt =
        roundMoney(
          Math.max(
            0,
            card.usedLimit
          )
        );

      if (
        debt <= 0
      ) {
        throw new Error(
          "Bu kartın açık borcu bulunmuyor."
        );
      }

      if (
        paymentAmount >
        debt
      ) {
        throw new Error(
          `Ödeme tutarı açık borçtan yüksek olamaz. Maksimum: ${debt.toFixed(
            2
          )} ₺`
        );
      }

      if (options?.paymentSource === "account") {
        if (!options.accountId) {
          throw new Error("Ödeme yapılacak banka hesabını seçmelisin.");
        }

        const account = accounts.find((item) => item.id === options.accountId);

        if (!account) {
          throw new Error("Ödeme yapılacak banka hesabı bulunamadı.");
        }

        if (Number(account.balance) < paymentAmount) {
          throw new Error("Seçilen hesapta yeterli bakiye bulunmuyor.");
        }
      }

      /*
       * Ödeme önce ekstre borcundan,
       * sonra güncel dönem borcundan düşer.
       */
      const statementReduction =
        Math.min(
          card.statementDebt,
          paymentAmount
        );

      const remaining =
        paymentAmount -
        statementReduction;

      const currentPeriod =
        Math.max(
          0,
          roundMoney(
            card.usedLimit -
              card.statementDebt
          )
        );

      const currentPeriodReduction =
        Math.min(
          currentPeriod,
          remaining
        );

      const nextStatementDebt =
        Math.max(
          0,
          roundMoney(
            card.statementDebt -
              statementReduction
          )
        );

      const nextUsedLimit =
        Math.max(
          0,
          roundMoney(
            card.usedLimit -
              statementReduction -
              currentPeriodReduction
          )
        );

      setCards(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              cardId
                ? {
                    ...item,

                    usedLimit:
                      nextUsedLimit,

                    statementDebt:
                      Math.min(
                        nextStatementDebt,
                        nextUsedLimit
                      ),
                  }
                : item
          )
      );

      const payment: CardPayment = {
        id: createId(
          "card_payment"
        ),

        cardId,

        amount:
          paymentAmount,

        date:
          new Date().toISOString(),

        paymentSource:
          options?.paymentSource ??
          "manual",

        accountId:
          options?.accountId,

        note:
          options?.note?.trim() ||
          undefined,
      };

      setPayments(
        (current) => [
          payment,
          ...current,
        ]
      );

      if (options?.paymentSource === "account" && options.accountId) {
        changeBalance(options.accountId, -paymentAmount);
      }
    };

  const undoCardPayment =
    async (
      paymentId: string
    ) => {
      const payment =
        payments.find(
          (item) =>
            item.id ===
            paymentId
        );

      if (!payment) {
        throw new Error(
          "Ödeme kaydı bulunamadı."
        );
      }

      const card =
        cards.find(
          (item) =>
            item.id ===
            payment.cardId
        );

      if (!card) {
        throw new Error(
          "Ödemeye ait kart bulunamadı."
        );
      }

      if (
        card.type !==
        "credit"
      ) {
        throw new Error(
          "Ödeme yapılan kart kredi kartı değil."
        );
      }

      if (payment.paymentSource === "account" && payment.accountId) {
        const account = accounts.find((item) => item.id === payment.accountId);

        if (!account) {
          throw new Error("Ödemenin kaynak hesabı artık bulunamadığı için geri alma yapılamaz.");
        }
      }

      const restoredUsedLimit =
        Math.min(
          card.limit,
          roundMoney(
            card.usedLimit +
              payment.amount
          )
        );

      const restoredStatementDebt =
        Math.min(
          restoredUsedLimit,
          roundMoney(
            card.statementDebt +
              payment.amount
          )
        );

      setCards(
        (current) =>
          current.map(
            (item) => {
              if (
                item.id !==
                card.id
              ) {
                return item;
              }

              return {
                ...item,

                usedLimit:
                  restoredUsedLimit,

                statementDebt:
                  restoredStatementDebt,
              };
            }
          )
      );

      setPayments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              paymentId
          )
      );

      if (payment.paymentSource === "account" && payment.accountId) {
        changeBalance(payment.accountId, payment.amount);
      }

      return payment;
    };

  const getCardDebtSummary =
    (
      cardOrId:
        | Card
        | string,
      _transactions?: unknown[],
      today = new Date()
    ): CardDebtSummary => {
      const card =
        typeof cardOrId ===
        "string"
          ? cards.find(
              (item) =>
                item.id ===
                cardOrId
            )
          : cardOrId;

      if (!card) {
        return {
          id:
            typeof cardOrId ===
            "string"
              ? cardOrId
              : cardOrId.id,

          currentPeriodDebt:
            0,

          lastStatementDebt:
            0,

          totalOutstandingDebt:
            0,

          minimumPaymentRate:
            0,

          minimumPaymentAmount:
            0,

          statementDate:
            null,

          nextStatementDate:
            null,

          nextDueDate:
            null,
        };
      }

      if (
        card.type !==
        "credit"
      ) {
        return {
          id:
            card.id,

          currentPeriodDebt:
            0,

          lastStatementDebt:
            0,

          totalOutstandingDebt:
            0,

          minimumPaymentRate:
            0,

          minimumPaymentAmount:
            0,

          statementDate:
            null,

          nextStatementDate:
            null,

          nextDueDate:
            null,
        };
      }

      const totalOutstandingDebt =
        Math.max(
          0,
          roundMoney(
            card.usedLimit
          )
        );

      const lastStatementDebt =
        Math.min(
          totalOutstandingDebt,
          Math.max(
            0,
            roundMoney(
              card.statementDebt
            )
          )
        );

      const currentPeriodDebt =
        Math.max(
          0,
          roundMoney(
            totalOutstandingDebt -
              lastStatementDebt
          )
        );

      const minimumPaymentRate =
        Math.min(
          100,
          Math.max(
            0,
            safeNumber(
              card.minimumPaymentRate
            )
          )
        );

      const minimumPaymentAmount =
        roundMoney(
          lastStatementDebt *
            (
              minimumPaymentRate /
              100
            )
        );

      let statementDate:
        | Date
        | null = null;

      if (
        card.statementGeneratedAt
      ) {
        const parsed =
          new Date(
            card.statementGeneratedAt
          );

        if (
          !isNaN(
            parsed.getTime()
          )
        ) {
          statementDate =
            parsed;
        }
      }

      return {
        id:
          card.id,

        currentPeriodDebt,

        lastStatementDebt,

        totalOutstandingDebt,

        minimumPaymentRate,

        minimumPaymentAmount,

        statementDate,

        nextStatementDate:
          getNextStatementDate(
            card.statementDay,
            today
          ),

        nextDueDate:
          getNextDueDate(
            card.dueDay,
            today
          ),
      };
    };

  const getCardPaymentHistory =
    (
      cardId: string
    ) => {
      return payments
        .filter(
          (payment) =>
            payment.cardId ===
            cardId
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );
    };

  const getCardById =
    (
      id: string
    ) => {
      return cards.find(
        (card) =>
          card.id ===
          id
      );
    };

  const value =
    useMemo<CardContextValue>(
      () => ({
        cards,

        payments,

        addCard,

        updateCard,

        deleteCard,

        changeUsedLimit,

        closeStatement,

        makeCardPayment,

        undoCardPayment,

        getCardDebtSummary,

        getCardPaymentHistory,

        getCardById,
      }),
      [
        cards,
        payments,
        accounts,
      ]
    );

  return (
    <CardContext.Provider
      value={value}
    >
      {children}
    </CardContext.Provider>
  );
}

export function useCards() {
  const context =
    useContext(
      CardContext
    );

  if (!context) {
    throw new Error(
      "useCards must be used inside CardProvider"
    );
  }

  return context;
}
