import React from "react";
import {
  Alert,
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
  return `${Number(value || 0).toLocaleString(
    "tr-TR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )} ₺`;
}

export default function FixedExpensesScreen() {
  const {
    fixedExpenses,
    deleteFixedExpense,
    toggleFixedExpense,
  } = useFixedExpenses();

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

  function confirmDelete(
    id: string,
    name: string
  ) {
    Alert.alert(
      "Sabit gideri sil",
      `"${name}" sabit giderini silmek istediğine emin misin?`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () =>
            deleteFixedExpense(id),
        },
      ]
    );
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
              Kira, aidat, internet, abonelik gibi düzenli giderlerini buraya ekleyebilirsin.
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
            (expense) => (
              <View
                key={expense.id}
                style={[
                  styles.expenseItem,
                  !expense.active &&
                    styles.inactiveItem,
                ]}
              >
                <View
                  style={
                    styles.expenseIcon
                  }
                >
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={23}
                    color={
                      expense.active
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
                      Her ayın{" "}
                      {expense.paymentDay}.
                      günü
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
                      confirmDelete(
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
            )
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      COLORS.bg,
  },

  container: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color:
      COLORS.secondary,
  },

  addButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor:
      COLORS.text,
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

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  statCard: {
    flex: 1,
    minHeight: 125,
    backgroundColor:
      COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      "#ECEFF3",
    padding: 18,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent:
      "center",
  },

  statLabel: {
    marginTop: 11,
    fontSize: 12,
    color:
      COLORS.secondary,
  },

  statValue: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: "900",
    color:
      COLORS.text,
  },

  card: {
    marginTop: 18,
    backgroundColor:
      COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor:
      "#ECEFF3",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color:
      COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color:
      COLORS.secondary,
  },

  expenseItem: {
    minHeight: 82,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 15,
    padding: 11,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  inactiveItem: {
    opacity: 0.65,
  },

  expenseIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor:
      "#EEF6FF",
    alignItems: "center",
    justifyContent:
      "center",
  },

  expenseMain: {
    flex: 1,
    minWidth: 0,
  },

  expenseName: {
    fontSize: 14,
    fontWeight: "800",
    color:
      COLORS.text,
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
    backgroundColor:
      "#F1F5F9",
  },

  metaText: {
    fontSize: 10,
    fontWeight: "800",
    color:
      COLORS.secondary,
  },

  dayText: {
    fontSize: 10,
    color:
      COLORS.secondary,
  },

  categoryText: {
    marginTop: 4,
    fontSize: 10,
    color:
      COLORS.secondary,
  },

  amountArea: {
    alignItems: "flex-end",
    minWidth: 105,
  },

  amount: {
    fontSize: 14,
    fontWeight: "900",
    color:
      COLORS.text,
  },

  currencyText: {
    marginTop: 2,
    fontSize: 10,
    color:
      COLORS.secondary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  editButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor:
      "#F0F2F5",
    alignItems: "center",
    justifyContent:
      "center",
  },

  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor:
      "#FFF1F1",
    alignItems: "center",
    justifyContent:
      "center",
  },

  empty: {
    paddingVertical: 38,
    alignItems: "center",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor:
      "#F1F3F5",
    alignItems: "center",
    justifyContent:
      "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color:
      COLORS.text,
  },

  emptyText: {
    maxWidth: 450,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color:
      COLORS.secondary,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor:
      COLORS.text,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});