import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTransactions } from "./context/TransactionContext";
import { useCategories } from "./context/CategoryContext";

type TransactionFilter =
  | "all"
  | "account"
  | "card";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(
    "tr-TR"
  );
}

export default function TransactionsScreen() {
  const {
    transactions,
    deleteTransaction,
  } = useTransactions();

  const { categories } =
    useCategories();

  const [deleteId, setDeleteId] =
    React.useState<string | null>(null);

  const [deleteDescription, setDeleteDescription] =
    React.useState("");

  const [filter, setFilter] =
    React.useState<TransactionFilter>("all");

  function getPaymentSource(
    transaction: (typeof transactions)[number]
  ) {
    if (
      transaction.paymentSource === "card" ||
      transaction.cardId
    ) {
      return "card";
    }

    return "account";
  }

  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        if (filter === "all") {
          return true;
        }

        return (
          getPaymentSource(transaction) ===
          filter
        );
      }
    );

  const totalIncome =
    filteredTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const totalExpense =
    filteredTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const net =
    totalIncome - totalExpense;

  const allCount =
    transactions.length;

  const accountCount =
    transactions.filter(
      (transaction) =>
        getPaymentSource(
          transaction
        ) === "account"
    ).length;

  const cardCount =
    transactions.filter(
      (transaction) =>
        getPaymentSource(
          transaction
        ) === "card"
    ).length;

  function getCategory(
    categoryId?: string,
    categoryName?: string
  ) {
    if (categoryId) {
      const foundById =
        categories.find(
          (category) =>
            category.id ===
            categoryId
        );

      if (foundById) {
        return foundById;
      }
    }

    if (categoryName) {
      const foundByName =
        categories.find(
          (category) =>
            category.name.toLocaleLowerCase(
              "tr-TR"
            ) ===
            categoryName.toLocaleLowerCase(
              "tr-TR"
            )
        );

      if (foundByName) {
        return foundByName;
      }
    }

    return null;
  }

  function askDelete(
    id: string,
    description: string
  ) {
    setDeleteId(id);

    setDeleteDescription(
      description
    );
  }

  function cancelDelete() {
    setDeleteId(null);
    setDeleteDescription("");
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteTransaction(deleteId);

    setDeleteId(null);
    setDeleteDescription("");
  }

  function getFilterTitle() {
    if (filter === "account") {
      return "Banka / Hesap İşlemleri";
    }

    if (filter === "card") {
      return "Kredi Kartı İşlemleri";
    }

    return "Tüm İşlemler";
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            İşlemler
          </Text>

          <Text style={styles.subtitle}>
            Gelir ve giderlerini burada
            yönet.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push(
              "/add-transaction"
            )
          }
        >
          <Text
            style={styles.addButtonText}
          >
            ＋ İşlem Ekle
          </Text>
        </Pressable>
      </View>

      <View style={styles.summaryGrid}>
        <View
          style={[
            styles.summaryCard,
            styles.incomeCard,
          ]}
        >
          <Text
            style={styles.summaryLabel}
          >
            Toplam Gelir
          </Text>

          <Text
            style={[
              styles.summaryAmount,
              styles.income,
            ]}
          >
            +₺{formatMoney(totalIncome)}
          </Text>
        </View>

        <View
          style={[
            styles.summaryCard,
            styles.expenseCard,
          ]}
        >
          <Text
            style={styles.summaryLabel}
          >
            Toplam Gider
          </Text>

          <Text
            style={[
              styles.summaryAmount,
              styles.expense,
            ]}
          >
            -₺{formatMoney(totalExpense)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryLabel}
          >
            Net Durum
          </Text>

          <Text
            style={[
              styles.summaryAmount,
              net >= 0
                ? styles.income
                : styles.expense,
            ]}
          >
            {net >= 0 ? "+" : "-"}₺
            {formatMoney(
              Math.abs(net)
            )}
          </Text>
        </View>
      </View>

      <View style={styles.filterCard}>
        <Pressable
          style={[
            styles.filterButton,
            filter === "all" &&
              styles.activeAllFilter,
          ]}
          onPress={() =>
            setFilter("all")
          }
        >
          <MaterialCommunityIcons
            name="view-list-outline"
            size={19}
            color={
              filter === "all"
                ? "#FFFFFF"
                : "#17202A"
            }
          />

          <View style={styles.filterTextWrap}>
            <Text
              style={[
                styles.filterText,
                filter === "all" &&
                  styles.activeFilterText,
              ]}
            >
              Tümü
            </Text>

            <Text
              style={[
                styles.filterCount,
                filter === "all" &&
                  styles.activeFilterCount,
              ]}
            >
              {allCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            filter === "account" &&
              styles.activeAccountFilter,
          ]}
          onPress={() =>
            setFilter("account")
          }
        >
          <MaterialCommunityIcons
            name="bank-outline"
            size={19}
            color={
              filter === "account"
                ? "#FFFFFF"
                : "#3B82F6"
            }
          />

          <View style={styles.filterTextWrap}>
            <Text
              style={[
                styles.filterText,
                filter === "account" &&
                  styles.activeFilterText,
              ]}
            >
              Banka / Hesap
            </Text>

            <Text
              style={[
                styles.filterCount,
                filter === "account" &&
                  styles.activeFilterCount,
              ]}
            >
              {accountCount}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            filter === "card" &&
              styles.activeCardFilter,
          ]}
          onPress={() =>
            setFilter("card")
          }
        >
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={19}
            color={
              filter === "card"
                ? "#FFFFFF"
                : "#8B5CF6"
            }
          />

          <View style={styles.filterTextWrap}>
            <Text
              style={[
                styles.filterText,
                filter === "card" &&
                  styles.activeFilterText,
              ]}
            >
              Kredi Kartı
            </Text>

            <Text
              style={[
                styles.filterCount,
                filter === "card" &&
                  styles.activeFilterCount,
              ]}
            >
              {cardCount}
            </Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        {getFilterTitle()}
      </Text>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name={
                filter === "card"
                  ? "credit-card-outline"
                  : filter === "account"
                  ? "bank-outline"
                  : "receipt-text-outline"
              }
              size={28}
              color={
                filter === "card"
                  ? "#8B5CF6"
                  : filter === "account"
                  ? "#3B82F6"
                  : "#22C55E"
              }
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            {filter === "all"
              ? "Henüz işlem yok"
              : filter === "card"
              ? "Kart işlemi yok"
              : "Hesap işlemi yok"}
          </Text>

          <Text
            style={styles.emptyText}
          >
            {filter === "all"
              ? "İlk gelir veya giderini eklediğinde işlemlerin burada görünecek."
              : filter === "card"
              ? "Kredi kartından yaptığın giderler burada görünecek."
              : "Banka hesaplarından ve nakit hesaplarından yaptığın işlemler burada görünecek."}
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() =>
              router.push(
                "/add-transaction"
              )
            }
          >
            <Text
              style={
                styles.emptyButtonText
              }
            >
              İşlem Ekle
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.transactionsCard}>
          {filteredTransactions.map(
            (
              transaction,
              index
            ) => {
              const category =
                getCategory(
                  transaction.categoryId,
                  transaction.categoryName
                );

              const categoryName =
                category?.name ||
                transaction.categoryName ||
                transaction.categoryId ||
                "Kategorisiz";

              const source =
                getPaymentSource(
                  transaction
                );

              const isDeleting =
                deleteId ===
                transaction.id;

              const isLast =
                index ===
                filteredTransactions.length -
                  1;

              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionWrapper,
                    isLast &&
                      styles.lastWrapper,
                  ]}
                >
                  <View
                    style={
                      styles.transaction
                    }
                  >
                    <View
                      style={
                        styles.transactionInfo
                      }
                    >
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              category?.color ||
                              "#64748B",
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            (category?.icon ||
                              "dots-horizontal") as any
                          }
                          size={21}
                          color="#FFFFFF"
                        />
                      </View>

                      <View
                        style={
                          styles.transactionText
                        }
                      >
                        <Text
                          style={
                            styles.transactionTitle
                          }
                        >
                          {transaction.description ||
                            "İşlem"}
                        </Text>

                        <View
                          style={
                            styles.transactionMetaRow
                          }
                        >
                          <Text
                            style={
                              styles.transactionMeta
                            }
                          >
                            {categoryName}
                          </Text>

                          <Text
                            style={
                              styles.metaDot
                            }
                          >
                            ·
                          </Text>

                          <Text
                            style={
                              styles.transactionMeta
                            }
                          >
                            {formatDate(
                              transaction.date
                            )}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.sourceBadge,
                            source === "card"
                              ? styles.cardBadge
                              : styles.accountBadge,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              source ===
                              "card"
                                ? "credit-card-outline"
                                : "bank-outline"
                            }
                            size={12}
                            color={
                              source ===
                              "card"
                                ? "#8B5CF6"
                                : "#3B82F6"
                            }
                          />

                          <Text
                            style={[
                              styles.sourceBadgeText,
                              source === "card"
                                ? styles.cardBadgeText
                                : styles.accountBadgeText,
                            ]}
                          >
                            {source ===
                            "card"
                              ? "Kredi Kartı"
                              : "Banka / Hesap"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={
                        styles.rightSide
                      }
                    >
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type ===
                            "income"
                            ? styles.income
                            : styles.expense,
                        ]}
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}₺
                        {formatMoney(
                          transaction.amount
                        )}
                      </Text>

                      <View
                        style={
                          styles.actions
                        }
                      >
                        <Pressable
                          style={
                            styles.actionButton
                          }
                          onPress={() =>
                            router.push({
                              pathname:
                                "/edit-transaction",
                              params: {
                                id: transaction.id,
                              },
                            })
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
                            styles.actionButton
                          }
                          onPress={() =>
                            askDelete(
                              transaction.id,
                              transaction.description ||
                                "İşlem"
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

                  {isDeleting && (
                    <View
                      style={
                        styles.confirmBox
                      }
                    >
                      <Text
                        style={
                          styles.confirmTitle
                        }
                      >
                        İşlem silinsin mi?
                      </Text>

                      <Text
                        style={
                          styles.confirmText
                        }
                      >
                        “
                        {
                          deleteDescription
                        }
                        ” işlemi kalıcı
                        olarak silinecek.
                      </Text>

                      <View
                        style={
                          styles.confirmButtons
                        }
                      >
                        <Pressable
                          style={
                            styles.cancelButton
                          }
                          onPress={
                            cancelDelete
                          }
                        >
                          <Text
                            style={
                              styles.cancelButtonText
                            }
                          >
                            Vazgeç
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.confirmDeleteButton
                          }
                          onPress={
                            confirmDelete
                          }
                        >
                          <Text
                            style={
                              styles.confirmDeleteText
                            }
                          >
                            Evet, Sil
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
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
    backgroundColor: "#F7F8FA",
  },

  container: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#17202A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#7A8492",
  },

  addButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },

  summaryCard: {
    flex: 1,
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  incomeCard: {
    borderColor: "#D9F2E1",
  },

  expenseCard: {
    borderColor: "#FDE3D4",
  },

  summaryLabel: {
    fontSize: 13,
    color: "#7A8492",
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 24,
    fontWeight: "800",
  },

  income: {
    color: "#22C55E",
  },

  expense: {
    color: "#FF8A3D",
  },

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E9EDF2",
    flexDirection: "row",
    gap: 8,
  },

  filterButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },

  activeAllFilter: {
    backgroundColor: "#17202A",
    borderColor: "#17202A",
  },

  activeAccountFilter: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  activeCardFilter: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },

  filterTextWrap: {
    alignItems: "flex-start",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
  },

  filterCount: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#7A8492",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  activeFilterCount: {
    color: "rgba(255,255,255,0.80)",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 12,
  },

  transactionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  transactionWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  lastWrapper: {
    borderBottomWidth: 0,
  },

  transaction: {
    minHeight: 106,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },

  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  transactionText: {
    flex: 1,
  },

  transactionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#17202A",
  },

  transactionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 5,
  },

  transactionMeta: {
    fontSize: 12,
    color: "#7A8492",
  },

  metaDot: {
    fontSize: 12,
    color: "#AEB4BC",
  },

  sourceBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  accountBadge: {
    backgroundColor: "#EEF6FF",
  },

  cardBadge: {
    backgroundColor: "#F5F3FF",
  },

  sourceBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  accountBadgeText: {
    color: "#3B82F6",
  },

  cardBadgeText: {
    color: "#8B5CF6",
  },

  rightSide: {
    alignItems: "flex-end",
  },

  transactionAmount: {
    fontSize: 15,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 7,
  },

  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },

  deleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAF8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7A8492",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 500,
  },

  emptyButton: {
    marginTop: 22,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  confirmBox: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  confirmTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17202A",
  },

  confirmText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#7A8492",
  },

  confirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },

  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DEE5",
  },

  cancelButtonText: {
    color: "#17202A",
    fontSize: 13,
    fontWeight: "700",
  },

  confirmDeleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#EF4444",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});