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
  useFixedExpenses,
} from "./context/FixedExpenseContext";

import {
  useTransactions,
} from "./context/TransactionContext";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  border: "#E3E7EC",
  green: "#22C55E",
  blue: "#3B82F6",
  red: "#DC2626",
  orange: "#FF8A3D",
};

function formatMoney(
  value: number
) {
  return `${Number(
    value || 0
  ).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

export default function FixedExpensesScreen() {
  const {
    fixedExpenses,
    deleteFixedExpense,
    toggleFixedExpense,
    markFixedExpensePaid,
    markFixedExpenseUnpaid,
    isFixedExpensePaidThisMonth,
  } = useFixedExpenses();

  const {
    addTransaction,
    deleteTransaction,
    getTransactionByFixedExpenseId,
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

  const activeExpenses =
    fixedExpenses.filter(
      (item) => item.active
    );

  const monthlyExpenses =
    activeExpenses.reduce(
      (total, item) => {
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
      },
      0
    );

  const yearlyExpenses =
    activeExpenses.reduce(
      (total, item) => {
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
      },
      0
    );

  async function payFixedExpense(
    expenseId: string
  ) {
    if (processingId) {
      return;
    }

    setMessage(null);

    const expense =
      fixedExpenses.find(
        (item) =>
          item.id === expenseId
      );

    if (!expense) {
      setMessage({
        type: "error",
        text: "Sabit gider bulunamadı.",
      });
      return;
    }

    if (
      isFixedExpensePaidThisMonth(
        expense.id
      )
    ) {
      setMessage({
        type: "error",
        text: `"${expense.name}" bu ay zaten ödendi.`,
      });
      return;
    }

    if (!expense.categoryId) {
      setMessage({
        type: "error",
        text: `"${expense.name}" için kategori seçilmemiş.`,
      });
      return;
    }

    const paymentSource =
      expense.cardId
        ? "card"
        : expense.accountId
          ? "account"
          : null;

    if (!paymentSource) {
      setMessage({
        type: "error",
        text: `"${expense.name}" için hesap veya kredi kartı seçilmemiş.`,
      });
      return;
    }

    try {
      setProcessingId(
        expense.id
      );

      addTransaction({
        type: "expense",
        amount: expense.amount,
        description:
          expense.name,
        categoryId:
          expense.categoryId,
        categoryName:
          expense.categoryName,
        accountId:
          expense.accountId ||
          "",
        paymentSource,
        cardId:
          expense.cardId,
        fixedExpenseId:
          expense.id,
      });

      const marked =
        await markFixedExpensePaid(
          expense.id
        );

      if (!marked) {
        setMessage({
          type: "error",
          text: "İşlem oluşturuldu ancak ödeme durumu işaretlenemedi.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `"${expense.name}" ödendi ve gerçek işlem olarak kaydedildi.`,
      });
    } catch (error) {
      console.error(
        "Sabit gider ödeme hatası:",
        error
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ödeme sırasında hata oluştu.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function undoFixedExpense(
    expenseId: string
  ) {
    if (processingId) {
      return;
    }

    setMessage(null);

    const expense =
      fixedExpenses.find(
        (item) =>
          item.id === expenseId
      );

    if (!expense) {
      return;
    }

    const transaction =
      getTransactionByFixedExpenseId(
        expense.id
      );

    if (!transaction) {
      const reset =
        await markFixedExpenseUnpaid(
          expense.id
        );

      setMessage({
        type: reset
          ? "success"
          : "error",
        text: reset
          ? `"${expense.name}" tekrar bekleyen ödeme olarak işaretlendi.`
          : "Ödeme durumu geri alınamadı.",
      });

      return;
    }

    try {
      setProcessingId(
        expense.id
      );

      deleteTransaction(
        transaction.id
      );

      const reset =
        await markFixedExpenseUnpaid(
          expense.id
        );

      if (!reset) {
        setMessage({
          type: "error",
          text: "İşlem silindi ancak ödeme durumu geri alınamadı.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `"${expense.name}" ödemesi geri alındı. Bakiye/kart ve bütçe eski haline döndü.`,
      });
    } catch (error) {
      console.error(
        "Sabit gider geri alma hatası:",
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

  async function removeExpense(
    id: string,
    name: string
  ) {
    setMessage(null);

    await deleteFixedExpense(
      id
    );

    setMessage({
      type: "success",
      text: `"${name}" sabit gideri silindi.`,
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Sabit Giderler
          </Text>

          <Text style={styles.subtitle}>
            Düzenli giderlerini tek yerden yönet.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push(
              "/add-fixed-expense"
            )
          }
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={styles.addButtonText}
          >
            Sabit Gider Ekle
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

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  "#EAF9EF",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={22}
              color={
                COLORS.green
              }
            />
          </View>

          <Text style={styles.statLabel}>
            Aylık yük
          </Text>

          <Text style={styles.statValue}>
            {formatMoney(
              monthlyExpenses
            )}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  "#EEF6FF",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-range"
              size={22}
              color={
                COLORS.blue
              }
            />
          </View>

          <Text style={styles.statLabel}>
            Yıllık yük
          </Text>

          <Text style={styles.statValue}>
            {formatMoney(
              yearlyExpenses
            )}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor:
                  "#FFF3EB",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="repeat"
              size={22}
              color={
                COLORS.orange
              }
            />
          </View>

          <Text style={styles.statLabel}>
            Aktif gider
          </Text>

          <Text style={styles.statValue}>
            {activeExpenses.length}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Giderlerim
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {fixedExpenses.length} kayıt
            </Text>
          </View>
        </View>

        {fixedExpenses.length ===
        0 ? (
          <View style={styles.empty}>
            <View
              style={
                styles.emptyIcon
              }
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={32}
                color={
                  COLORS.secondary
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Henüz sabit gider yok
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Kira, aidat, internet ve diğer düzenli giderlerini buraya ekleyebilirsin.
            </Text>

            <Pressable
              style={
                styles.emptyButton
              }
              onPress={() =>
                router.push(
                  "/add-fixed-expense"
                )
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                İlk Sabit Gideri Ekle
              </Text>
            </Pressable>
          </View>
        ) : (
          fixedExpenses.map(
            (expense) => {
              const paid =
                isFixedExpensePaidThisMonth(
                  expense.id
                );

              const processing =
                processingId ===
                expense.id;

              return (
                <View
                  key={expense.id}
                  style={[
                    styles.expenseItem,
                    !expense.active &&
                      styles.inactiveItem,
                    paid &&
                      styles.paidItem,
                  ]}
                >
                  <View
                    style={[
                      styles.expenseIcon,
                      paid && {
                        backgroundColor:
                          "#EAF9EF",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        paid
                          ? "check-circle"
                          : "calendar-check"
                      }
                      size={23}
                      color={
                        paid
                          ? COLORS.green
                          : expense.active
                            ? COLORS.blue
                            : COLORS.secondary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.expenseMain
                    }
                  >
                    <Text
                      style={[
                        styles.expenseName,
                        !expense.active &&
                          styles.inactiveText,
                      ]}
                      numberOfLines={1}
                    >
                      {expense.name}
                    </Text>

                    <View
                      style={
                        styles.metaRow
                      }
                    >
                      <View
                        style={
                          styles.metaBadge
                        }
                      >
                        <Text
                          style={
                            styles.metaText
                          }
                        >
                          {expense.frequency ===
                          "monthly"
                            ? "Aylık"
                            : "Yıllık"}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.dayText
                        }
                      >
                        {expense.frequency ===
                        "monthly"
                          ? `Her ayın ${expense.paymentDay}. günü`
                          : `Her yıl ${expense.paymentDay}. gün`}
                      </Text>
                    </View>

                    {expense.categoryName && (
                      <Text
                        style={
                          styles.categoryText
                        }
                      >
                        {expense.categoryName}
                      </Text>
                    )}

                    {paid && (
                      <View
                        style={
                          styles.paidBadge
                        }
                      >
                        <MaterialCommunityIcons
                          name="check"
                          size={11}
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

                  <View
                    style={
                      styles.amountArea
                    }
                  >
                    <Text
                      style={[
                        styles.amount,
                        !expense.active &&
                          styles.inactiveText,
                      ]}
                    >
                      {formatMoney(
                        expense.amount
                      )}
                    </Text>

                    <Text
                      style={
                        styles.currencyText
                      }
                    >
                      {expense.frequency ===
                      "monthly"
                        ? "/ ay"
                        : "/ yıl"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.actions
                    }
                  >
                    <Switch
                      value={
                        expense.active
                      }
                      onValueChange={() =>
                        toggleFixedExpense(
                          expense.id
                        )
                      }
                      trackColor={{
                        false:
                          "#D9DEE5",
                        true:
                          "#A7E8BB",
                      }}
                      thumbColor={
                        expense.active
                          ? COLORS.green
                          : "#FFFFFF"
                      }
                    />

                    {paid ? (
                      <Pressable
                        disabled={
                          processing
                        }
                        style={[
                          styles.undoButton,
                          processing &&
                            styles.payButtonDisabled,
                        ]}
                        onPress={() =>
                          undoFixedExpense(
                            expense.id
                          )
                        }
                      >
                        <MaterialCommunityIcons
                          name="undo"
                          size={17}
                          color={
                            processing
                              ? COLORS.green
                              : "#FFFFFF"
                          }
                        />

                        <Text
                          style={[
                            styles.payButtonText,
                            processing &&
                              styles.payButtonTextPaid,
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
                          !expense.active ||
                          processing
                        }
                        style={[
                          styles.payButton,
                          (!expense.active ||
                            processing) &&
                            styles.payButtonDisabled,
                        ]}
                        onPress={() =>
                          payFixedExpense(
                            expense.id
                          )
                        }
                      >
                        <MaterialCommunityIcons
                          name={
                            processing
                              ? "loading"
                              : "cash-check"
                          }
                          size={17}
                          color={
                            processing
                              ? COLORS.green
                              : "#FFFFFF"
                          }
                        />

                        <Text
                          style={[
                            styles.payButtonText,
                            processing &&
                              styles.payButtonTextPaid,
                          ]}
                        >
                          {processing
                            ? "İşleniyor"
                            : "Öde"}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        router.push(
                          `/edit-fixed-expense?id=${expense.id}`
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={18}
                        color={
                          COLORS.text
                        }
                      />
                    </Pressable>

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        removeExpense(
                          expense.id,
                          expense.name
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={18}
                        color={
                          COLORS.red
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              );
            }
          )
        )}
      </View>
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
    maxWidth: 1200,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  messageBox: {
    marginTop: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
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

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  statCard: {
    flex: 1,
    minHeight: 125,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    padding: 18,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    marginTop: 11,
    fontSize: 12,
    color: COLORS.secondary,
  },

  statValue: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  card: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.secondary,
  },

  expenseItem: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 11,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  paidItem: {
    borderColor: "#C8EFD4",
    backgroundColor: "#FBFFFC",
  },

  inactiveItem: {
    opacity: 0.65,
  },

  expenseIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  expenseMain: {
    flex: 1,
    minWidth: 150,
  },

  expenseName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  inactiveText: {
    color: COLORS.secondary,
  },

  metaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metaBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
  },

  metaText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  dayText: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  categoryText: {
    marginTop: 4,
    fontSize: 10,
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

  amountArea: {
    alignItems: "flex-end",
    minWidth: 105,
  },

  amount: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  currencyText: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.secondary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  payButton: {
    height: 35,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  undoButton: {
    height: 35,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  payButtonDisabled: {
    backgroundColor: "#EAF9EF",
  },

  payButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  payButtonTextPaid: {
    color: COLORS.green,
  },

  editButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#FFF1F1",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    paddingVertical: 38,
    alignItems: "center",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyText: {
    maxWidth: 450,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondary,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: COLORS.text,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});