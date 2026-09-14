import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  Subscription,
  useSubscriptions,
} from "./context/SubscriptionContext";

import { useAccounts } from "./context/AccountContext";
import { useCards } from "./context/CardContext";
import { useTransactions } from "./context/TransactionContext";

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

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  border: "#E9EDF2",
  green: "#22C55E",
  blue: "#3B82F6",
  orange: "#FF8A3D",
  purple: "#8B5CF6",
  red: "#EF4444",
};

function formatMoney(
  amount: number,
  currency = "TRY"
) {
  const formatted =
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  if (currency === "TRY") {
    return `₺${formatted}`;
  }

  return `${currency} ${formatted}`;
}

function getNextPaymentDate(
  paymentDay: number
) {
  const today = new Date();

  let year =
    today.getFullYear();

  let month =
    today.getMonth();

  const daysInCurrentMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let paymentDate =
    new Date(
      year,
      month,
      Math.min(
        paymentDay,
        daysInCurrentMonth
      )
    );

  const todayStart =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  if (paymentDate < todayStart) {
    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }

    const daysInNextMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    paymentDate =
      new Date(
        year,
        month,
        Math.min(
          paymentDay,
          daysInNextMonth
        )
      );
  }

  return paymentDate;
}

function formatPaymentDate(
  date: Date
) {
  return `${date.getDate()} ${
    turkishMonths[
      date.getMonth()
    ]
  }`;
}

function getDaysUntil(
  date: Date
) {
  const today = new Date();

  const todayStart =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  const targetStart =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  return Math.round(
    (
      targetStart.getTime() -
      todayStart.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );
}

function isPaidThisMonth(
  dateString?: string
) {
  if (!dateString) {
    return false;
  }

  const paidDate =
    new Date(dateString);

  const now = new Date();

  if (
    Number.isNaN(
      paidDate.getTime()
    )
  ) {
    return false;
  }

  return (
    paidDate.getFullYear() ===
      now.getFullYear() &&
    paidDate.getMonth() ===
      now.getMonth()
  );
}

export default function SubscriptionsScreen() {
  const {
    subscriptions,
    deleteSubscription,
    toggleSubscription,
    updateSubscription,
  } = useSubscriptions();

  const { accounts } =
    useAccounts();

  const { cards } =
    useCards();

  const {
    transactions,
    addTransaction,
    deleteTransaction,
  } = useTransactions();

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(
    null
  );

  const [
    message,
    setMessage,
  ] = useState<{
    type:
      | "success"
      | "error";
    text: string;
  } | null>(null);

  const activeSubscriptions =
    subscriptions.filter(
      (item) => item.active
    );

  const monthlyTotal =
    activeSubscriptions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const yearlyTotal =
    monthlyTotal * 12;

  const upcomingPayments =
    activeSubscriptions
      .map((subscription) => ({
        subscription,
        date:
          getNextPaymentDate(
            subscription.paymentDay
          ),
      }))
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      );

  const nextPayment =
    upcomingPayments.length
      ? upcomingPayments[0]
      : null;

  function getPaymentSourceName(
    subscription: Subscription
  ) {
    if (
      subscription.paymentSource ===
      "card"
    ) {
      const card =
        cards.find(
          (item) =>
            item.id ===
            subscription.cardId
        );

      return card
        ? `💳 ${card.name}`
        : "💳 Kredi Kartı";
    }

    const account =
      accounts.find(
        (item) =>
          item.id ===
          subscription.accountId
      );

    return account
      ? `🏦 ${account.name}`
      : "🏦 Hesap";
  }

  function replaceSubscription(
    subscription: Subscription,
    extra: Partial<Subscription>
  ) {
    updateSubscription(
      subscription.id,
      {
        ...subscription,
        ...extra,
      }
    );
  }

  function paySubscription(
    subscriptionId: string
  ) {
    if (processingId) {
      return;
    }

    setMessage(null);

    const subscription =
      subscriptions.find(
        (item) =>
          item.id ===
          subscriptionId
      );

    if (!subscription) {
      setMessage({
        type: "error",
        text: "Abonelik bulunamadı.",
      });
      return;
    }

    if (
      isPaidThisMonth(
        subscription.lastPaidAt
      )
    ) {
      setMessage({
        type: "error",
        text: `"${subscription.name}" bu ay zaten ödendi.`,
      });
      return;
    }

    if (!subscription.categoryId) {
      setMessage({
        type: "error",
        text: `"${subscription.name}" için kategori seçilmemiş.`,
      });
      return;
    }

    if (
      subscription.paymentSource ===
        "account" &&
      !subscription.accountId
    ) {
      setMessage({
        type: "error",
        text: `"${subscription.name}" için ödeme hesabı seçilmemiş.`,
      });
      return;
    }

    if (
      subscription.paymentSource ===
        "card" &&
      !subscription.cardId
    ) {
      setMessage({
        type: "error",
        text: `"${subscription.name}" için kredi kartı seçilmemiş.`,
      });
      return;
    }

    try {
      setProcessingId(
        subscription.id
      );

      addTransaction({
        type: "expense",
        amount:
          subscription.amount,
        description:
          subscription.name,
        categoryId:
          subscription.categoryId,
        categoryName:
          subscription.categoryName,
        accountId:
          subscription.accountId ||
          "",
        paymentSource:
          subscription.paymentSource,
        cardId:
          subscription.cardId,
        fixedExpenseId:
          `subscription:${subscription.id}`,
      });

      replaceSubscription(
        subscription,
        {
          lastPaidAt:
            new Date().toISOString(),
        }
      );

      setMessage({
        type: "success",
        text: `"${subscription.name}" ödendi ve gerçek işlem olarak kaydedildi.`,
      });
    } catch (error) {
      console.error(
        "Abonelik ödeme hatası:",
        error
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Abonelik ödemesi sırasında hata oluştu.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  function undoSubscriptionPayment(
    subscriptionId: string
  ) {
    if (processingId) {
      return;
    }

    setMessage(null);

    const subscription =
      subscriptions.find(
        (item) =>
          item.id ===
          subscriptionId
      );

    if (!subscription) {
      return;
    }

    try {
      setProcessingId(
        subscription.id
      );

      const transaction =
        transactions.find(
          (item) =>
            item.fixedExpenseId ===
            `subscription:${subscription.id}`
        );

      if (transaction) {
        deleteTransaction(
          transaction.id
        );
      }

      replaceSubscription(
        subscription,
        {
          lastPaidAt:
            undefined,
        }
      );

      setMessage({
        type: "success",
        text: `"${subscription.name}" ödemesi geri alındı. Bakiye/kart ve bütçe eski haline döndü.`,
      });
    } catch (error) {
      console.error(
        "Abonelik geri alma hatası:",
        error
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ödeme geri alınamadı.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  function handleDelete(
    subscription: Subscription
  ) {
    deleteSubscription(
      subscription.id
    );

    setMessage({
      type: "success",
      text: `"${subscription.name}" aboneliği silindi.`,
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Abonelikler
          </Text>

          <Text style={styles.subtitle}>
            Aylık düzenli ödemelerini
            tek yerden takip et.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push(
              "/add-subscription"
            )
          }
        >
          <Text
            style={
              styles.addButtonText
            }
          >
            ＋ Abonelik Ekle
          </Text>
        </Pressable>
      </View>

      {message && (
        <View
          style={[
            styles.messageBox,
            message.type ===
              "success"
              ? styles.successMessage
              : styles.errorMessage,
          ]}
        >
          <MaterialCommunityIcons
            name={
              message.type ===
              "success"
                ? "check-circle"
                : "alert-circle"
            }
            size={21}
            color={
              message.type ===
              "success"
                ? COLORS.green
                : COLORS.red
            }
          />

          <Text
            style={[
              styles.messageText,
              message.type ===
                "success"
                ? styles.successMessageText
                : styles.errorMessageText,
            ]}
          >
            {message.text}
          </Text>

          <Pressable
            onPress={() =>
              setMessage(null)
            }
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={
                COLORS.secondary
              }
            />
          </Pressable>
        </View>
      )}

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            AYLIK TOPLAM
          </Text>

          <Text
            style={[
              styles.summaryValue,
              styles.orange,
            ]}
          >
            {formatMoney(
              monthlyTotal
            )}
          </Text>

          <Text
            style={
              styles.summaryDescription
            }
          >
            Aktif abonelikler
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            YILLIK TOPLAM
          </Text>

          <Text
            style={[
              styles.summaryValue,
              styles.blue,
            ]}
          >
            {formatMoney(
              yearlyTotal
            )}
          </Text>

          <Text
            style={
              styles.summaryDescription
            }
          >
            12 aylık tahmini maliyet
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            AKTİF ABONELİK
          </Text>

          <Text
            style={[
              styles.summaryValue,
              styles.green,
            ]}
          >
            {activeSubscriptions.length}
          </Text>

          <Text
            style={
              styles.summaryDescription
            }
          >
            Toplam{" "}
            {subscriptions.length}{" "}
            kayıt
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            YAKLAŞAN ÖDEME
          </Text>

          {nextPayment ? (
            <>
              <Text
                style={[
                  styles.summaryValue,
                  styles.purple,
                ]}
              >
                {getDaysUntil(
                  nextPayment.date
                ) === 0
                  ? "Bugün"
                  : `${getDaysUntil(
                      nextPayment.date
                    )} gün`}
              </Text>

              <Text
                style={
                  styles.summaryDescription
                }
                numberOfLines={1}
              >
                {
                  nextPayment
                    .subscription.name
                }
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.summaryValue,
                  styles.purple,
                ]}
              >
                —
              </Text>

              <Text
                style={
                  styles.summaryDescription
                }
              >
                Yaklaşan ödeme yok
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text
          style={styles.sectionTitle}
        >
          Tüm Abonelikler
        </Text>

        <Text
          style={styles.sectionCount}
        >
          {subscriptions.length} abonelik
        </Text>
      </View>

      {subscriptions.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🔄
          </Text>

          <Text
            style={styles.emptyTitle}
          >
            Henüz abonelik yok
          </Text>

          <Text
            style={styles.emptyText}
          >
            Netflix, Spotify, internet,
            telefon gibi düzenli
            ödemelerini buraya ekleyebilirsin.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() =>
              router.push(
                "/add-subscription"
              )
            }
          >
            <Text
              style={
                styles.emptyButtonText
              }
            >
              ＋ İlk Aboneliği Ekle
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={
            styles.subscriptionList
          }
        >
          {subscriptions.map(
            (subscription) => {
              const nextDate =
                getNextPaymentDate(
                  subscription.paymentDay
                );

              const daysUntil =
                getDaysUntil(
                  nextDate
                );

              const paid =
                isPaidThisMonth(
                  subscription.lastPaidAt
                );

              const processing =
                processingId ===
                subscription.id;

              return (
                <View
                  key={
                    subscription.id
                  }
                  style={[
                    styles.subscriptionCard,
                    !subscription.active &&
                      styles.inactiveCard,
                    paid &&
                      styles.paidCard,
                  ]}
                >
                  <View
                    style={
                      styles.subscriptionTop
                    }
                  >
                    <View
                      style={
                        styles.subscriptionInfo
                      }
                    >
                      <View
                        style={[
                          styles.subscriptionIcon,
                          paid
                            ? styles.paidIcon
                            : subscription.active
                              ? styles.activeIcon
                              : styles.inactiveIcon,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            paid
                              ? "check-circle"
                              : "refresh"
                          }
                          size={24}
                          color={
                            paid
                              ? COLORS.green
                              : subscription.active
                                ? COLORS.blue
                                : COLORS.secondary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.nameContainer
                        }
                      >
                        <Text
                          style={[
                            styles.subscriptionName,
                            !subscription.active &&
                              styles.inactiveText,
                          ]}
                        >
                          {
                            subscription.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.paymentSource
                          }
                        >
                          {getPaymentSourceName(
                            subscription
                          )}
                        </Text>

                        {paid && (
                          <View
                            style={
                              styles.paidBadge
                            }
                          >
                            <MaterialCommunityIcons
                              name="check"
                              size={10}
                              color={
                                COLORS.green
                              }
                            />

                            <Text
                              style={
                                styles.paidBadgeText
                              }
                            >
                              Bu ay ödendi
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View
                      style={
                        styles.amountContainer
                      }
                    >
                      <Text
                        style={[
                          styles.subscriptionAmount,
                          !subscription.active &&
                            styles.inactiveText,
                        ]}
                      >
                        {formatMoney(
                          subscription.amount,
                          subscription.currency
                        )}
                      </Text>

                      <Text
                        style={
                          styles.monthlyText
                        }
                      >
                        / ay
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.subscriptionDivider
                    }
                  />

                  <View
                    style={
                      styles.subscriptionBottom
                    }
                  >
                    <View
                      style={
                        styles.paymentDayBox
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        ÖDEME GÜNÜ
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          !subscription.active &&
                            styles.inactiveText,
                        ]}
                      >
                        Her ayın{" "}
                        {
                          subscription.paymentDay
                        }
                        'i
                      </Text>
                    </View>

                    <View
                      style={
                        styles.nextPaymentBox
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        SONRAKİ ÖDEME
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          !subscription.active &&
                            styles.inactiveText,
                        ]}
                      >
                        {formatPaymentDate(
                          nextDate
                        )}
                        {" • "}
                        {daysUntil === 0
                          ? "Bugün"
                          : daysUntil === 1
                          ? "Yarın"
                          : `${daysUntil} gün sonra`}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.actionRow
                      }
                    >
                      <Switch
                        value={
                          subscription.active
                        }
                        onValueChange={() =>
                          toggleSubscription(
                            subscription.id
                          )
                        }
                        trackColor={{
                          false:
                            "#D9DEE5",
                          true:
                            "#A7E8BB",
                        }}
                        thumbColor={
                          subscription.active
                            ? COLORS.green
                            : "#FFFFFF"
                        }
                      />

                      {subscription.active &&
                        (paid ? (
                          <Pressable
                            disabled={
                              processing
                            }
                            style={[
                              styles.undoButton,
                              processing &&
                                styles.disabledButton,
                            ]}
                            onPress={() =>
                              undoSubscriptionPayment(
                                subscription.id
                              )
                            }
                          >
                            <MaterialCommunityIcons
                              name="undo"
                              size={16}
                              color={
                                processing
                                  ? COLORS.green
                                  : "#FFFFFF"
                              }
                            />

                            <Text
                              style={[
                                styles.actionText,
                                processing &&
                                  styles.disabledActionText,
                              ]}
                            >
                              {processing
                                ? "İşleniyor"
                                : "Geri Al"}
                            </Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            disabled={
                              processing
                            }
                            style={[
                              styles.payButton,
                              processing &&
                                styles.disabledButton,
                            ]}
                            onPress={() =>
                              paySubscription(
                                subscription.id
                              )
                            }
                          >
                            <MaterialCommunityIcons
                              name={
                                processing
                                  ? "loading"
                                  : "cash-check"
                              }
                              size={16}
                              color={
                                processing
                                  ? COLORS.green
                                  : "#FFFFFF"
                              }
                            />

                            <Text
                              style={[
                                styles.actionText,
                                processing &&
                                  styles.disabledActionText,
                              ]}
                            >
                              {processing
                                ? "İşleniyor"
                                : "Öde"}
                            </Text>
                          </Pressable>
                        ))}

                      <Pressable
                        style={
                          styles.editButton
                        }
                        onPress={() =>
                          router.push(
                            `/edit-subscription?id=${subscription.id}`
                          )
                        }
                      >
                        <Text
                          style={
                            styles.editText
                          }
                        >
                          Düzenle
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          handleDelete(
                            subscription
                          )
                        }
                      >
                        <Text
                          style={
                            styles.deleteText
                          }
                        >
                          Sil
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    gap: 20,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: COLORS.secondary,
  },

  addButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  messageBox: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  successMessage: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  errorMessage: {
    backgroundColor: "#FFF7F7",
    borderColor: "#FECACA",
  },

  messageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  successMessageText: {
    color: "#166534",
  },

  errorMessageText: {
    color: "#991B1B",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 210,
    minHeight: 140,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 12,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
  },

  summaryDescription: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.secondary,
  },

  orange: {
    color: COLORS.orange,
  },

  blue: {
    color: COLORS.blue,
  },

  green: {
    color: COLORS.green,
  },

  purple: {
    color: COLORS.purple,
  },

  sectionHeader: {
    marginTop: 32,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionCount: {
    fontSize: 12,
    color: COLORS.secondary,
  },

  subscriptionList: {
    gap: 14,
  },

  subscriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  paidCard: {
    borderColor: "#C8EFD4",
    backgroundColor: "#FBFFFC",
  },

  inactiveCard: {
    opacity: 0.62,
  },

  subscriptionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },

  subscriptionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIcon: {
    backgroundColor: "#EEF4FF",
  },

  paidIcon: {
    backgroundColor: "#EAF9EF",
  },

  inactiveIcon: {
    backgroundColor: "#EEF1F4",
  },

  nameContainer: {
    flex: 1,
  },

  subscriptionName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  paymentSource: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.secondary,
  },

  paidBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#EAF9EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  paidBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.green,
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  subscriptionAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  monthlyText: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.secondary,
  },

  subscriptionDivider: {
    height: 1,
    backgroundColor: "#EEF1F4",
    marginVertical: 18,
  },

  subscriptionBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  paymentDayBox: {
    flex: 1,
  },

  nextPaymentBox: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#A0A8B3",
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  payButton: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  undoButton: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  disabledButton: {
    backgroundColor: "#EAF9EF",
  },

  actionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabledActionText: {
    color: COLORS.green,
  },

  editButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#EEF4FF",
  },

  editText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.blue,
  },

  deleteButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#FFF1F2",
  },

  deleteText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.red,
  },

  inactiveText: {
    color: COLORS.secondary,
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 8,
    maxWidth: 560,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
    color: COLORS.secondary,
  },

  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: COLORS.green,
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});