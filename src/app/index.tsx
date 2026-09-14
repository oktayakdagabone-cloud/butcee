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
import { useBudgets } from "./context/BudgetContext";
import { useAccounts } from "./context/AccountContext";
import { useCards } from "./context/CardContext";
import { useCategories } from "./context/CategoryContext";
import { useFixedExpenses } from "./context/FixedExpenseContext";
import { useSubscriptions } from "./context/SubscriptionContext";

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
  showDecimals = true
) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits:
      showDecimals ? 2 : 0,
    maximumFractionDigits:
      showDecimals ? 2 : 0,
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

function getMonthLabel(date: string) {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  return `${turkishMonths[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
}

function CategoryIcon({
  icon,
  color,
  size = 20,
}: {
  icon?: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.categoryIcon,
        {
          backgroundColor:
            color || COLORS.blue,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={
          (icon ||
            "dots-horizontal") as any
        }
        size={size}
        color="#FFFFFF"
      />
    </View>
  );
}

function getNextDayDate(day: number) {
  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const daysInCurrentMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

  const safeDay = Math.min(
    Math.max(day, 1),
    daysInCurrentMonth
  );

  let date = new Date(
    currentYear,
    currentMonth,
    safeDay
  );

  if (date < now) {
    const nextMonth =
      currentMonth + 1;

    const nextYear =
      nextMonth > 11
        ? currentYear + 1
        : currentYear;

    const normalizedMonth =
      nextMonth > 11
        ? 0
        : nextMonth;

    const daysInNextMonth =
      new Date(
        nextYear,
        normalizedMonth + 1,
        0
      ).getDate();

    date = new Date(
      nextYear,
      normalizedMonth,
      Math.min(
        day,
        daysInNextMonth
      )
    );
  }

  return date;
}

function formatUpcomingDate(
  day: number
) {
  const date = getNextDayDate(day);

  return `${date.getDate()} ${
    turkishMonths[date.getMonth()]
  }`;
}

function getFixedExpenseNextDate(
  day: number,
  frequency: "monthly" | "yearly"
) {
  const now = new Date();

  if (frequency === "monthly") {
    return getNextDayDate(day);
  }

  const currentYear =
    now.getFullYear();

  let date = new Date(
    currentYear,
    0,
    1
  );

  const daysInYear = new Date(
    currentYear + 1,
    0,
    0
  ).getDate();

  const safeDay = Math.min(
    Math.max(day, 1),
    365
  );

  date = new Date(
    currentYear,
    0,
    1
  );

  date.setDate(
    safeDay
  );

  if (date < now) {
    date = new Date(
      currentYear + 1,
      0,
      1
    );

    date.setDate(
      safeDay
    );
  }

  if (
    date.getDate() === 0 ||
    isNaN(date.getTime())
  ) {
    return new Date(
      currentYear,
      11,
      Math.min(
        daysInYear,
        day
      )
    );
  }

  return date;
}

function formatFixedExpenseDate(
  day: number,
  frequency: "monthly" | "yearly"
) {
  if (frequency === "monthly") {
    return formatUpcomingDate(day);
  }

  const now = new Date();

  let date = new Date(
    now.getFullYear(),
    0,
    1
  );

  date.setDate(
    Math.max(1, day)
  );

  if (date < now) {
    date = new Date(
      now.getFullYear() + 1,
      0,
      1
    );

    date.setDate(
      Math.max(1, day)
    );
  }

  return `${date.getDate()} ${
    turkishMonths[date.getMonth()]
  }`;
}

function isPaidThisMonth(
  dateString?: string
) {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth()
  );
}

export default function HomeScreen() {
  const {
    transactions,
  } = useTransactions();

  const { budgets } =
    useBudgets();

  const { accounts } =
    useAccounts();

  const { cards } =
    useCards();

  const { categories } =
    useCategories();

  const {
    fixedExpenses,
    isFixedExpensePaidThisMonth,
  } = useFixedExpenses();

  const {
    subscriptions,
  } = useSubscriptions();

  const totalBalance =
    accounts.reduce(
      (sum, account) =>
        sum + account.balance,
      0
    );

  const income =
    transactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const expense =
    transactions
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
    income - expense;

  const now = new Date();

  const currentMonth =
    `${turkishMonths[now.getMonth()]} ${now.getFullYear()}`;

  const currentMonthTransactions =
    transactions.filter(
      (transaction) =>
        getMonthLabel(
          transaction.date
        ) === currentMonth
    );

  const currentMonthIncome =
    currentMonthTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const currentMonthExpense =
    currentMonthTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );

  const currentMonthNet =
    currentMonthIncome -
    currentMonthExpense;

  const currentBudgets =
    budgets.filter(
      (budget) =>
        budget.month === currentMonth
    );

  const totalBudget =
    currentBudgets.reduce(
      (sum, budget) =>
        sum + budget.limit,
      0
    );

  const totalBudgetSpent =
    currentBudgets.reduce(
      (sum, budget) =>
        sum + budget.spent,
      0
    );

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          100,
          Math.round(
            (totalBudgetSpent /
              totalBudget) *
              100
          )
        )
      : 0;

  const budgetRemaining =
    totalBudget -
    totalBudgetSpent;

  const totalCardLimit =
    cards.reduce(
      (sum, card) =>
        sum + card.limit,
      0
    );

  const totalCardUsed =
    cards.reduce(
      (sum, card) =>
        sum + card.usedLimit,
      0
    );

  const totalCardAvailable =
    cards.reduce(
      (sum, card) =>
        sum +
        Math.max(
          card.limit -
            card.usedLimit,
          0
        ),
      0
    );

  const cardUsagePercentage =
    totalCardLimit > 0
      ? Math.min(
          100,
          Math.round(
            (totalCardUsed /
              totalCardLimit) *
              100
          )
        )
      : 0;

  const creditCards =
    cards
      .filter(
        (card) =>
          card.type === "credit" &&
          card.dueDay > 0
      )
      .map((card) => ({
        card,
        date: getNextDayDate(
          card.dueDay
        ),
      }))
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      )
      .slice(0, 4);

  /* =========================
     SABİT GİDERLER
  ========================= */

  const activeFixedExpenses =
    fixedExpenses.filter(
      (expense) =>
        expense.active
    );

  const monthlyFixedExpenseTotal =
    activeFixedExpenses.reduce(
      (sum, expense) => {
        if (
          expense.frequency ===
          "monthly"
        ) {
          return (
            sum + expense.amount
          );
        }

        return (
          sum +
          expense.amount / 12
        );
      },
      0
    );

  const yearlyFixedExpenseTotal =
    activeFixedExpenses.reduce(
      (sum, expense) => {
        if (
          expense.frequency ===
          "yearly"
        ) {
          return (
            sum + expense.amount
          );
        }

        return (
          sum +
          expense.amount * 12
        );
      },
      0
    );

  const fixedExpensesPaidCount =
    activeFixedExpenses.filter(
      (expense) =>
        isFixedExpensePaidThisMonth(
          expense.id
        )
    ).length;

  const fixedExpensesPendingCount =
    Math.max(
      activeFixedExpenses.length -
        fixedExpensesPaidCount,
      0
    );

  const upcomingFixedExpenses =
    activeFixedExpenses
      .map((expense) => ({
        expense,
        date:
          getFixedExpenseNextDate(
            expense.paymentDay,
            expense.frequency
          ),
      }))
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      )
      .slice(0, 5);

  /* =========================
     ABONELİKLER
  ========================= */

  const activeSubscriptions =
    subscriptions.filter(
      (subscription) =>
        subscription.active
    );

  const monthlySubscriptionTotal =
    activeSubscriptions.reduce(
      (sum, subscription) =>
        sum + subscription.amount,
      0
    );

  const yearlySubscriptionTotal =
    monthlySubscriptionTotal * 12;

  const subscriptionPaidCount =
    activeSubscriptions.filter(
      (subscription) =>
        isPaidThisMonth(
          subscription.lastPaidAt
        )
    ).length;

  const subscriptionPendingCount =
    Math.max(
      activeSubscriptions.length -
        subscriptionPaidCount,
      0
    );

  const upcomingSubscriptions =
    activeSubscriptions
      .map((subscription) => ({
        subscription,
        date: getNextDayDate(
          subscription.paymentDay
        ),
      }))
      .sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      )
      .slice(0, 5);

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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      {/* =========================
          HEADER
      ========================= */}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hoş geldin 👋
          </Text>

          <Text style={styles.title}>
            Genel Bakış
          </Text>

          <Text style={styles.subtitle}>
            Finansal durumunun özeti
          </Text>
        </View>

        <View style={styles.logoCircle}>
          <Text style={styles.logoSymbol}>
            ₺
          </Text>
        </View>
      </View>

      {/* =========================
          BAKİYE
      ========================= */}

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>
            Toplam Bakiye
          </Text>

          <Text style={styles.balanceAmount}>
            ₺{formatMoney(totalBalance)}
          </Text>

          <Text style={styles.balanceChange}>
            Tüm hesaplarının güncel toplamı
          </Text>
        </View>

        <View style={styles.balanceIcon}>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={28}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* =========================
          GELİR / GİDER
      ========================= */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.incomeIcon,
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={21}
              color={COLORS.green}
            />
          </View>

          <Text style={styles.summaryLabel}>
            Bu Ay Gelir
          </Text>

          <Text
            style={[
              styles.summaryAmount,
              styles.incomeAmount,
            ]}
          >
            +₺
            {formatMoney(
              currentMonthIncome
            )}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.expenseIcon,
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-down"
              size={21}
              color={COLORS.orange}
            />
          </View>

          <Text style={styles.summaryLabel}>
            Bu Ay Gider
          </Text>

          <Text
            style={[
              styles.summaryAmount,
              styles.expenseAmount,
            ]}
          >
            -₺
            {formatMoney(
              currentMonthExpense
            )}
          </Text>
        </View>
      </View>

      {/* =========================
          NET
      ========================= */}

      <View style={styles.netCard}>
        <View>
          <Text style={styles.netLabel}>
            Bu Ay Net Durum
          </Text>

          <Text style={styles.netSubtitle}>
            {currentMonth}
          </Text>
        </View>

        <Text
          style={[
            styles.netAmount,
            currentMonthNet >= 0
              ? styles.incomeAmount
              : styles.expenseAmount,
          ]}
        >
          {currentMonthNet >= 0
            ? "+"
            : "-"}
          ₺
          {formatMoney(
            Math.abs(
              currentMonthNet
            )
          )}
        </Text>
      </View>

      {/* =========================
          SABİT GİDERLER
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Sabit Giderler
          </Text>

          <Text style={styles.sectionSubtitle}>
            Düzenli giderlerinin genel durumu
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/fixed-expenses"
            )
          }
        >
          <Text style={styles.sectionLink}>
            Tümünü gör
          </Text>
        </Pressable>
      </View>

      {activeFixedExpenses.length ===
      0 ? (
        <Pressable
          style={
            styles.emptyRecurringCard
          }
          onPress={() =>
            router.push(
              "/add-fixed-expense"
            )
          }
        >
          <View
            style={[
              styles.emptyRecurringIcon,
              {
                backgroundColor:
                  "#FFF3EB",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-plus"
              size={25}
              color={COLORS.orange}
            />
          </View>

          <View
            style={
              styles.emptyRecurringContent
            }
          >
            <Text
              style={
                styles.emptyRecurringTitle
              }
            >
              Henüz sabit gider yok
            </Text>

            <Text
              style={
                styles.emptyRecurringText
              }
            >
              Kira, aidat ve düzenli ödemelerini takip etmeye başla.
            </Text>
          </View>

          <Text
            style={
              styles.emptyRecurringArrow
            }
          >
            ›
          </Text>
        </Pressable>
      ) : (
        <View
          style={
            styles.fixedExpenseDashboard
          }
        >
          <View
            style={
              styles.fixedExpenseStats
            }
          >
            <View
              style={
                styles.fixedExpenseStat
              }
            >
              <View
                style={[
                  styles.fixedExpenseStatIcon,
                  {
                    backgroundColor:
                      "#FFF3EB",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={21}
                  color={
                    COLORS.orange
                  }
                />
              </View>

              <Text
                style={
                  styles.fixedExpenseStatLabel
                }
              >
                Aylık yük
              </Text>

              <Text
                style={
                  styles.fixedExpenseStatValue
                }
              >
                ₺
                {formatMoney(
                  monthlyFixedExpenseTotal
                )}
              </Text>
            </View>

            <View
              style={
                styles.fixedExpenseStat
              }
            >
              <View
                style={[
                  styles.fixedExpenseStatIcon,
                  {
                    backgroundColor:
                      "#EEF6FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-range"
                  size={21}
                  color={
                    COLORS.blue
                  }
                />
              </View>

              <Text
                style={
                  styles.fixedExpenseStatLabel
                }
              >
                Yıllık yük
              </Text>

              <Text
                style={
                  styles.fixedExpenseStatValue
                }
              >
                ₺
                {formatMoney(
                  yearlyFixedExpenseTotal
                )}
              </Text>
            </View>

            <View
              style={
                styles.fixedExpenseStat
              }
            >
              <View
                style={[
                  styles.fixedExpenseStatIcon,
                  {
                    backgroundColor:
                      "#EAF9EF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={21}
                  color={
                    COLORS.green
                  }
                />
              </View>

              <Text
                style={
                  styles.fixedExpenseStatLabel
                }
              >
                Bu ay
              </Text>

              <Text
                style={
                  styles.fixedExpenseStatValue
                }
              >
                {fixedExpensesPaidCount}/
                {
                  activeFixedExpenses.length
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.fixedExpenseProgressBackground
            }
          >
            <View
              style={[
                styles.fixedExpenseProgress,
                {
                  width: `${
                    activeFixedExpenses.length >
                    0
                      ? Math.round(
                          (fixedExpensesPaidCount /
                            activeFixedExpenses.length) *
                            100
                        )
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.fixedExpenseProgressText
            }
          >
            {fixedExpensesPendingCount ===
            0
              ? "Bu ay tüm sabit giderlerin ödendi."
              : `${fixedExpensesPendingCount} sabit gider bu ay bekliyor.`}
          </Text>

          <View
            style={
              styles.fixedExpenseList
            }
          >
            {upcomingFixedExpenses.map(
              ({
                expense,
              }) => {
                const paid =
                  expense.frequency ===
                    "monthly"
                    ? isFixedExpensePaidThisMonth(
                        expense.id
                      )
                    : false;

                const category =
                  getCategory(
                    expense.categoryId,
                    expense.categoryName
                  );

                return (
                  <Pressable
                    key={expense.id}
                    style={
                      styles.fixedExpenseItem
                    }
                    onPress={() =>
                      router.push(
                        "/fixed-expenses"
                      )
                    }
                  >
                    <CategoryIcon
                      icon={
                        category?.icon ||
                        "calendar-check"
                      }
                      color={
                        category?.color ||
                        COLORS.orange
                      }
                      size={18}
                    />

                    <View
                      style={
                        styles.fixedExpenseItemMain
                      }
                    >
                      <Text
                        style={
                          styles.fixedExpenseItemName
                        }
                        numberOfLines={1}
                      >
                        {expense.name}
                      </Text>

                      <View
                        style={
                          styles.fixedExpenseItemMeta
                        }
                      >
                        <Text
                          style={
                            styles.fixedExpenseItemDate
                          }
                        >
                          {formatFixedExpenseDate(
                            expense.paymentDay,
                            expense.frequency
                          )}
                        </Text>

                        <Text
                          style={
                            styles.fixedExpenseItemFrequency
                          }
                        >
                          {expense.frequency ===
                          "monthly"
                            ? "Aylık"
                            : "Yıllık"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.fixedExpenseItemRight
                      }
                    >
                      <Text
                        style={
                          styles.fixedExpenseItemAmount
                        }
                      >
                        ₺
                        {formatMoney(
                          expense.amount
                        )}
                      </Text>

                      <View
                        style={[
                          styles.fixedExpenseStatus,
                          paid
                            ? styles.fixedExpensePaid
                            : styles.fixedExpenseWaiting,
                        ]}
                      >
                        <Text
                          style={[
                            styles.fixedExpenseStatusText,
                            paid
                              ? styles.fixedExpensePaidText
                              : styles.fixedExpenseWaitingText,
                          ]}
                        >
                          {paid
                            ? "Ödendi"
                            : "Bekliyor"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }
            )}
          </View>

          <Pressable
            style={
              styles.fixedExpenseViewButton
            }
            onPress={() =>
              router.push(
                "/fixed-expenses"
              )
            }
          >
            <Text
              style={
                styles.fixedExpenseViewText
              }
            >
              Sabit giderleri yönet
            </Text>

            <Text
              style={
                styles.fixedExpenseViewArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>
      )}

      {/* =========================
          ABONELİKLER
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Abonelikler
          </Text>

          <Text style={styles.sectionSubtitle}>
            Düzenli dijital ve hizmet ödemelerin
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/subscriptions"
            )
          }
        >
          <Text style={styles.sectionLink}>
            Tümünü gör
          </Text>
        </Pressable>
      </View>

      {activeSubscriptions.length ===
      0 ? (
        <Pressable
          style={
            styles.emptyRecurringCard
          }
          onPress={() =>
            router.push(
              "/add-subscription"
            )
          }
        >
          <View
            style={[
              styles.emptyRecurringIcon,
              {
                backgroundColor:
                  "#F5F3FF",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="refresh-circle"
              size={25}
              color={COLORS.purple}
            />
          </View>

          <View
            style={
              styles.emptyRecurringContent
            }
          >
            <Text
              style={
                styles.emptyRecurringTitle
              }
            >
              Henüz abonelik yok
            </Text>

            <Text
              style={
                styles.emptyRecurringText
              }
            >
              Netflix, Spotify ve diğer düzenli ödemelerini takip et.
            </Text>
          </View>

          <Text
            style={
              styles.emptyRecurringArrow
            }
          >
            ›
          </Text>
        </Pressable>
      ) : (
        <View
          style={
            styles.subscriptionDashboard
          }
        >
          <View
            style={
              styles.subscriptionStats
            }
          >
            <View
              style={
                styles.subscriptionStat
              }
            >
              <View
                style={[
                  styles.subscriptionStatIcon,
                  {
                    backgroundColor:
                      "#F5F3FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={21}
                  color={
                    COLORS.purple
                  }
                />
              </View>

              <Text
                style={
                  styles.subscriptionStatLabel
                }
              >
                Aylık toplam
              </Text>

              <Text
                style={
                  styles.subscriptionStatValue
                }
              >
                ₺
                {formatMoney(
                  monthlySubscriptionTotal
                )}
              </Text>
            </View>

            <View
              style={
                styles.subscriptionStat
              }
            >
              <View
                style={[
                  styles.subscriptionStatIcon,
                  {
                    backgroundColor:
                      "#EEF6FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-range"
                  size={21}
                  color={
                    COLORS.blue
                  }
                />
              </View>

              <Text
                style={
                  styles.subscriptionStatLabel
                }
              >
                Yıllık tahmini
              </Text>

              <Text
                style={
                  styles.subscriptionStatValue
                }
              >
                ₺
                {formatMoney(
                  yearlySubscriptionTotal
                )}
              </Text>
            </View>

            <View
              style={
                styles.subscriptionStat
              }
            >
              <View
                style={[
                  styles.subscriptionStatIcon,
                  {
                    backgroundColor:
                      "#EAF9EF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={21}
                  color={
                    COLORS.green
                  }
                />
              </View>

              <Text
                style={
                  styles.subscriptionStatLabel
                }
              >
                Bu ay
              </Text>

              <Text
                style={
                  styles.subscriptionStatValue
                }
              >
                {subscriptionPaidCount}/
                {
                  activeSubscriptions.length
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.subscriptionProgressBackground
            }
          >
            <View
              style={[
                styles.subscriptionProgress,
                {
                  width: `${
                    activeSubscriptions.length >
                    0
                      ? Math.round(
                          (subscriptionPaidCount /
                            activeSubscriptions.length) *
                            100
                        )
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.subscriptionProgressText
            }
          >
            {subscriptionPendingCount ===
            0
              ? "Bu ay tüm aboneliklerin ödendi."
              : `${subscriptionPendingCount} abonelik bu ay bekliyor.`}
          </Text>

          <View
            style={
              styles.subscriptionList
            }
          >
            {upcomingSubscriptions.map(
              ({
                subscription,
              }) => {
                const paid =
                  isPaidThisMonth(
                    subscription.lastPaidAt
                  );

                return (
                  <Pressable
                    key={
                      subscription.id
                    }
                    style={
                      styles.subscriptionItem
                    }
                    onPress={() =>
                      router.push(
                        "/subscriptions"
                      )
                    }
                  >
                    <View
                      style={[
                        styles.subscriptionIcon,
                        {
                          backgroundColor:
                            paid
                              ? "#EAF9EF"
                              : "#F5F3FF",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          paid
                            ? "check-circle"
                            : "refresh"
                        }
                        size={20}
                        color={
                          paid
                            ? COLORS.green
                            : COLORS.purple
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.subscriptionItemMain
                      }
                    >
                      <Text
                        style={
                          styles.subscriptionItemName
                        }
                        numberOfLines={1}
                      >
                        {
                          subscription.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.subscriptionItemDate
                        }
                      >
                        {formatUpcomingDate(
                          subscription.paymentDay
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.subscriptionItemRight
                      }
                    >
                      <Text
                        style={
                          styles.subscriptionItemAmount
                        }
                      >
                        {subscription.currency ===
                        "TRY"
                          ? "₺"
                          : `${subscription.currency} `}
                        {formatMoney(
                          subscription.amount
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.subscriptionItemStatus,
                          paid
                            ? styles.greenText
                            : styles.purpleText,
                        ]}
                      >
                        {paid
                          ? "Ödendi"
                          : "Bekliyor"}
                      </Text>
                    </View>
                  </Pressable>
                );
              }
            )}
          </View>

          <Pressable
            style={
              styles.subscriptionViewButton
            }
            onPress={() =>
              router.push(
                "/subscriptions"
              )
            }
          >
            <Text
              style={
                styles.subscriptionViewText
              }
            >
              Abonelikleri yönet
            </Text>

            <Text
              style={
                styles.subscriptionViewArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>
      )}

      {/* =========================
          KARTLAR
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Kartlarım
          </Text>

          <Text style={styles.sectionSubtitle}>
            Kart limitlerinin genel durumu
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/cards")
          }
        >
          <Text style={styles.sectionLink}>
            Tümünü gör
          </Text>
        </Pressable>
      </View>

      {cards.length === 0 ? (
        <Pressable
          style={
            styles.emptyCardOverview
          }
          onPress={() =>
            router.push("/add-card")
          }
        >
          <View
            style={
              styles.emptyCardOverviewIcon
            }
          >
            <MaterialCommunityIcons
              name="credit-card-plus-outline"
              size={24}
              color={COLORS.purple}
            />
          </View>

          <View
            style={
              styles.emptyCardOverviewContent
            }
          >
            <Text
              style={
                styles.emptyCardOverviewTitle
              }
            >
              Henüz kartın yok
            </Text>

            <Text
              style={
                styles.emptyCardOverviewText
              }
            >
              Kredi veya banka kartlarını
              ekleyebilirsin.
            </Text>
          </View>

          <Text
            style={
              styles.emptyCardOverviewArrow
            }
          >
            ›
          </Text>
        </Pressable>
      ) : (
        <View style={styles.cardsOverview}>
          <View style={styles.cardStatsRow}>
            <View style={styles.cardStat}>
              <Text
                style={styles.cardStatLabel}
              >
                Toplam Limit
              </Text>

              <Text
                style={styles.cardStatValue}
              >
                ₺
                {formatMoney(
                  totalCardLimit
                )}
              </Text>
            </View>

            <View style={styles.cardStat}>
              <Text
                style={styles.cardStatLabel}
              >
                Kullanılan
              </Text>

              <Text
                style={[
                  styles.cardStatValue,
                  styles.expenseAmount,
                ]}
              >
                ₺
                {formatMoney(
                  totalCardUsed
                )}
              </Text>
            </View>

            <View
              style={[
                styles.cardStat,
                styles.cardStatRight,
              ]}
            >
              <Text
                style={styles.cardStatLabel}
              >
                Kullanılabilir
              </Text>

              <Text
                style={[
                  styles.cardStatValue,
                  styles.incomeAmount,
                ]}
              >
                ₺
                {formatMoney(
                  totalCardAvailable
                )}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.cardProgressBackground
            }
          >
            <View
              style={[
                styles.cardProgress,
                {
                  width:
                    `${cardUsagePercentage}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.cardProgressText
            }
          >
            Kart limitlerinin %{
              cardUsagePercentage
            }{" "}
            kullanılıyor
          </Text>

          <View
            style={styles.cardList}
          >
            {cards
              .slice(0, 4)
              .map((card) => {
                const available =
                  Math.max(
                    card.limit -
                      card.usedLimit,
                    0
                  );

                const usage =
                  card.limit > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (card.usedLimit /
                            card.limit) *
                            100
                        )
                      )
                    : 0;

                return (
                  <Pressable
                    key={card.id}
                    style={
                      styles.homeCardItem
                    }
                    onPress={() =>
                      router.push(
                        "/cards"
                      )
                    }
                  >
                    <View
                      style={[
                        styles.homeCardIcon,
                        {
                          backgroundColor:
                            card.color ||
                            COLORS.purple,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          card.type ===
                          "credit"
                            ? "credit-card"
                            : "credit-card-outline"
                        }
                        size={21}
                        color="#FFFFFF"
                      />
                    </View>

                    <View
                      style={
                        styles.homeCardInfo
                      }
                    >
                      <Text
                        style={
                          styles.homeCardName
                        }
                      >
                        {card.name}
                      </Text>

                      <Text
                        style={
                          styles.homeCardBank
                        }
                      >
                        {card.bankName}
                      </Text>

                      <View
                        style={
                          styles.homeCardProgressBackground
                        }
                      >
                        <View
                          style={[
                            styles.homeCardProgress,
                            {
                              width:
                                `${usage}%`,
                              backgroundColor:
                                card.color ||
                                COLORS.purple,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View
                      style={
                        styles.homeCardRight
                      }
                    >
                      <Text
                        style={
                          styles.homeCardUsed
                        }
                      >
                        ₺
                        {formatMoney(
                          card.usedLimit
                        )}
                      </Text>

                      <Text
                        style={
                          styles.homeCardAvailable
                        }
                      >
                        {formatMoney(
                          available
                        )}{" "}
                        ₺ kalan
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
          </View>

          {cards.length > 4 && (
            <Pressable
              style={
                styles.viewCardsButton
              }
              onPress={() =>
                router.push(
                  "/cards"
                )
              }
            >
              <Text
                style={
                  styles.viewCardsText
                }
              >
                Tüm kartları gör
              </Text>

              <Text
                style={
                  styles.viewCardsArrow
                }
              >
                →
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* =========================
          KART ÖDEMELERİ
      ========================= */}

      {creditCards.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Yaklaşan Ödemeler
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Kredi kartlarının son ödeme
                günleri
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push(
                  "/cards"
                )
              }
            >
              <Text
                style={
                  styles.sectionLink
                }
              >
                Kartlar
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.upcomingPaymentsCard
            }
          >
            {creditCards.map(
              ({
                card,
              }) => (
                <Pressable
                  key={card.id}
                  style={
                    styles.upcomingPayment
                  }
                  onPress={() =>
                    router.push(
                      "/cards"
                    )
                  }
                >
                  <View
                    style={[
                      styles.upcomingPaymentIcon,
                      {
                        backgroundColor:
                          card.color ||
                          COLORS.purple,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="credit-card"
                      size={19}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={
                      styles.upcomingPaymentInfo
                    }
                  >
                    <Text
                      style={
                        styles.upcomingPaymentName
                      }
                    >
                      {card.name}
                    </Text>

                    <Text
                      style={
                        styles.upcomingPaymentBank
                      }
                    >
                      {card.bankName}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.upcomingPaymentDate
                    }
                  >
                    <Text
                      style={
                        styles.upcomingPaymentDateLabel
                      }
                    >
                      Son ödeme
                    </Text>

                    <Text
                      style={
                        styles.upcomingPaymentDateValue
                      }
                    >
                      {formatUpcomingDate(
                        card.dueDay
                      )}
                    </Text>
                  </View>
                </Pressable>
              )
            )}
          </View>
        </>
      )}

      {/* =========================
          HESAPLAR
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Hesaplarım
          </Text>

          <Text style={styles.sectionSubtitle}>
            Finansal hesapların
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/accounts"
            )
          }
        >
          <Text style={styles.sectionLink}>
            Tümünü gör
          </Text>
        </Pressable>
      </View>

      {accounts.length === 0 ? (
        <Pressable
          style={
            styles.emptyAccountCard
          }
          onPress={() =>
            router.push(
              "/accounts"
            )
          }
        >
          <View
            style={styles.emptyAccountIcon}
          >
            <MaterialCommunityIcons
              name="wallet-plus-outline"
              size={25}
              color={COLORS.blue}
            />
          </View>

          <View
            style={
              styles.emptyAccountContent
            }
          >
            <Text
              style={styles.emptyAccountTitle}
            >
              Henüz hesabın yok
            </Text>

            <Text
              style={styles.emptyAccountText}
            >
              İlk hesabını ekleyerek
              başlayabilirsin.
            </Text>
          </View>

          <Text
            style={
              styles.emptyAccountArrow
            }
          >
            ›
          </Text>
        </Pressable>
      ) : (
        <View style={styles.accountsCard}>
          {accounts
            .slice(0, 4)
            .map((account) => (
              <View
                key={account.id}
                style={
                  styles.accountRow
                }
              >
                <View
                  style={
                    styles.accountLeft
                  }
                >
                  <View
                    style={
                      styles.accountIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name={
                        account.type ===
                        "bank"
                          ? "bank"
                          : account.type ===
                            "cash"
                          ? "cash"
                          : "piggy-bank-outline"
                      }
                      size={21}
                      color={
                        COLORS.blue
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.accountName
                      }
                    >
                      {account.name}
                    </Text>

                    <Text
                      style={
                        styles.accountType
                      }
                    >
                      {account.type ===
                      "bank"
                        ? "Banka"
                        : account.type ===
                          "cash"
                        ? "Nakit"
                        : "Birikim"}
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.accountBalance
                  }
                >
                  ₺
                  {formatMoney(
                    account.balance
                  )}
                </Text>
              </View>
            ))}
        </View>
      )}

      {/* =========================
          BÜTÇELER
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Bütçe Durumu
          </Text>

          <Text style={styles.sectionSubtitle}>
            {currentMonth}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/budgets"
            )
          }
        >
          <Text style={styles.sectionLink}>
            Bütçeler
          </Text>
        </Pressable>
      </View>

      {currentBudgets.length ===
      0 ? (
        <Pressable
          style={
            styles.emptyBudgetCard
          }
          onPress={() =>
            router.push(
              "/add-budget"
            )
          }
        >
          <View
            style={
              styles.emptyBudgetIcon
            }
          >
            <MaterialCommunityIcons
              name="chart-donut-variant"
              size={24}
              color={COLORS.green}
            />
          </View>

          <View
            style={
              styles.emptyBudgetContent
            }
          >
            <Text
              style={
                styles.emptyBudgetTitle
              }
            >
              Bu ay için bütçe yok
            </Text>

            <Text
              style={
                styles.emptyBudgetText
              }
            >
              Harcamalarını takip etmek için
              bir bütçe oluştur.
            </Text>
          </View>

          <Text
            style={
              styles.emptyBudgetArrow
            }
          >
            ›
          </Text>
        </Pressable>
      ) : (
        <View style={styles.budgetCard}>
          <View style={styles.budgetTop}>
            <View>
              <Text
                style={
                  styles.budgetLabel
                }
              >
                Toplam bütçe
              </Text>

              <Text
                style={
                  styles.budgetAmount
                }
              >
                ₺
                {formatMoney(
                  totalBudget
                )}
              </Text>
            </View>

            <View
              style={
                styles.budgetPercentageBox
              }
            >
              <Text
                style={[
                  styles.budgetPercentage,
                  totalBudgetSpent >
                    totalBudget &&
                    styles.overBudgetPercentage,
                ]}
              >
                %{budgetPercentage}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.progressBackground
            }
          >
            <View
              style={[
                styles.progress,
                totalBudgetSpent >
                  totalBudget &&
                  styles.progressOver,
                {
                  width:
                    `${budgetPercentage}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.budgetBottom
            }
          >
            <View>
              <Text
                style={
                  styles.budgetBottomLabel
                }
              >
                Harcanan
              </Text>

              <Text
                style={styles.budgetSpent}
              >
                ₺
                {formatMoney(
                  totalBudgetSpent
                )}
              </Text>
            </View>

            <View
              style={
                styles.budgetBottomRight
              }
            >
              <Text
                style={
                  styles.budgetBottomLabel
                }
              >
                {budgetRemaining >=
                0
                  ? "Kalan"
                  : "Aşım"}
              </Text>

              <Text
                style={[
                  styles.budgetRemaining,
                  budgetRemaining < 0 &&
                    styles.budgetOver,
                ]}
              >
                ₺
                {formatMoney(
                  Math.abs(
                    budgetRemaining
                  )
                )}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.budgetList
            }
          >
            {currentBudgets
              .slice(0, 5)
              .map((budget) => {
                const category =
                  getCategory(
                    budget.categoryId,
                    budget.category
                  );

                const budgetPercentage =
                  budget.limit > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (budget.spent /
                            budget.limit) *
                            100
                        )
                      )
                    : 0;

                const isOverBudget =
                  budget.spent >
                  budget.limit;

                return (
                  <View
                    key={budget.id}
                    style={
                      styles.budgetItem
                    }
                  >
                    <View
                      style={
                        styles.budgetItemLeft
                      }
                    >
                      <CategoryIcon
                        icon={
                          category?.icon
                        }
                        color={
                          category?.color
                        }
                        size={18}
                      />

                      <View
                        style={
                          styles.budgetItemText
                        }
                      >
                        <Text
                          style={
                            styles.budgetItemName
                          }
                        >
                          {category?.name ||
                            budget.category}
                        </Text>

                        <View
                          style={
                            styles.budgetMiniProgressBackground
                          }
                        >
                          <View
                            style={[
                              styles.budgetMiniProgress,
                              {
                                width:
                                  `${budgetPercentage}%`,
                                backgroundColor:
                                  isOverBudget
                                    ? COLORS.red
                                    : category?.color ||
                                      COLORS.blue,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    <View
                      style={
                        styles.budgetItemRight
                      }
                    >
                      <Text
                        style={
                          styles.budgetItemSpent
                        }
                      >
                        ₺
                        {formatMoney(
                          budget.spent
                        )}
                      </Text>

                      <Text
                        style={
                          styles.budgetItemLimit
                        }
                      >
                        / ₺
                        {formatMoney(
                          budget.limit
                        )}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>

          <Pressable
            style={
              styles.viewBudgetsButton
            }
            onPress={() =>
              router.push(
                "/budgets"
              )
            }
          >
            <Text
              style={
                styles.viewBudgetsText
              }
            >
              Bütçeleri Gör
            </Text>

            <Text
              style={
                styles.viewBudgetsArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>
      )}

      {/* =========================
          SON İŞLEMLER
      ========================= */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Son İşlemler
          </Text>

          <Text style={styles.sectionSubtitle}>
            Son eklenen hareketler
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/explore"
            )
          }
        >
          <Text style={styles.sectionLink}>
            Tümünü gör
          </Text>
        </Pressable>
      </View>

      {transactions.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <View
            style={
              styles.emptyTransactionIcon
            }
          >
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={25}
              color={COLORS.green}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Henüz işlem yok
          </Text>

          <Text style={styles.emptyText}>
            İlk gelir veya giderini
            eklediğinde burada
            görünecek.
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.transactionsCard
          }
        >
          {transactions
            .slice(0, 5)
            .map((transaction) => {
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

              return (
                <View
                  key={transaction.id}
                  style={
                    styles.transaction
                  }
                >
                  <View
                    style={
                      styles.transactionLeft
                    }
                  >
                    <CategoryIcon
                      icon={
                        category?.icon
                      }
                      color={
                        category?.color
                      }
                      size={20}
                    />

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

                      <Text
                        style={
                          styles.transactionCategory
                        }
                      >
                        {categoryName} ·{" "}
                        {formatDate(
                          transaction.date
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type ===
                        "income"
                        ? styles.incomeAmount
                        : styles.expenseAmount,
                    ]}
                  >
                    {transaction.type ===
                    "income"
                      ? "+"
                      : "-"}
                    ₺
                    {formatMoney(
                      transaction.amount
                    )}
                  </Text>
                </View>
              );
            })}
        </View>
      )}

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
    maxWidth: 1000,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  greeting: {
    fontSize: 15,
    color: COLORS.secondary,
    marginBottom: 4,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 4,
  },

  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    justifyContent: "center",
    alignItems: "center",
  },

  logoSymbol: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  balanceCard: {
    backgroundColor: COLORS.text,
    borderRadius: 22,
    padding: 28,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  balanceLabel: {
    fontSize: 14,
    color: "#AEB4BC",
    marginBottom: 10,
  },

  balanceAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  balanceChange: {
    fontSize: 14,
    color: "#AEB4BC",
    marginTop: 10,
  },

  balanceIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 18,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  incomeIcon: {
    backgroundColor: "#EAF8EF",
  },

  expenseIcon: {
    backgroundColor: "#FFF1E8",
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 22,
    fontWeight: "800",
  },

  incomeAmount: {
    color: COLORS.green,
  },

  expenseAmount: {
    color: COLORS.orange,
  },

  netCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginTop: 18,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  netLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  netSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.secondary,
  },

  netAmount: {
    fontSize: 22,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 3,
  },

  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.blue,
  },

  /* =========================
     SABİT GİDERLER
  ========================= */

  fixedExpenseDashboard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  fixedExpenseStats: {
    flexDirection: "row",
    gap: 12,
  },

  fixedExpenseStat: {
    flex: 1,
  },

  fixedExpenseStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  fixedExpenseStatLabel: {
    marginTop: 9,
    fontSize: 10,
    color: COLORS.secondary,
  },

  fixedExpenseStatValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  fixedExpenseProgressBackground: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
    marginTop: 18,
  },

  fixedExpenseProgress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.green,
  },

  fixedExpenseProgressText: {
    marginTop: 7,
    fontSize: 11,
    color: COLORS.secondary,
  },

  fixedExpenseList: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  fixedExpenseItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  fixedExpenseItemMain: {
    flex: 1,
    minWidth: 0,
  },

  fixedExpenseItemName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  fixedExpenseItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },

  fixedExpenseItemDate: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  fixedExpenseItemFrequency: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  fixedExpenseItemRight: {
    alignItems: "flex-end",
    minWidth: 90,
  },

  fixedExpenseItemAmount: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  fixedExpenseStatus: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  fixedExpensePaid: {
    backgroundColor: "#EAF9EF",
  },

  fixedExpenseWaiting: {
    backgroundColor: "#FFF3EB",
  },

  fixedExpenseStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  fixedExpensePaidText: {
    color: COLORS.green,
  },

  fixedExpenseWaitingText: {
    color: COLORS.orange,
  },

  fixedExpenseViewButton: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  fixedExpenseViewText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.orange,
  },

  fixedExpenseViewArrow: {
    fontSize: 18,
    color: COLORS.orange,
  },

  emptyFixedExpenseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyFixedExpenseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF3EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emptyFixedExpenseContent: {
    flex: 1,
  },

  emptyFixedExpenseTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyFixedExpenseText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  emptyFixedExpenseArrow: {
    fontSize: 28,
    color: COLORS.secondary,
    marginLeft: 10,
  },

  /* =========================
     ABONELİKLER
  ========================= */

  subscriptionDashboard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  subscriptionStats: {
    flexDirection: "row",
    gap: 12,
  },

  subscriptionStat: {
    flex: 1,
  },

  subscriptionStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionStatLabel: {
    marginTop: 9,
    fontSize: 10,
    color: COLORS.secondary,
  },

  subscriptionStatValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  subscriptionProgressBackground: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
    marginTop: 18,
  },

  subscriptionProgress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.purple,
  },

  subscriptionProgressText: {
    marginTop: 7,
    fontSize: 11,
    color: COLORS.secondary,
  },

  subscriptionList: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  subscriptionItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionItemMain: {
    flex: 1,
    minWidth: 0,
  },

  subscriptionItemName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  subscriptionItemDate: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.secondary,
  },

  subscriptionItemRight: {
    alignItems: "flex-end",
    minWidth: 90,
  },

  subscriptionItemAmount: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  subscriptionItemStatus: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "800",
  },

  subscriptionViewButton: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  subscriptionViewText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.purple,
  },

  subscriptionViewArrow: {
    fontSize: 18,
    color: COLORS.purple,
  },

  emptyRecurringCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyRecurringIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emptyRecurringContent: {
    flex: 1,
  },

  emptyRecurringTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyRecurringText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  emptyRecurringArrow: {
    fontSize: 28,
    color: COLORS.secondary,
    marginLeft: 10,
  },

  greenText: {
    color: COLORS.green,
  },

  purpleText: {
    color: COLORS.purple,
  },

  /* =========================
     KARTLAR
  ========================= */

  cardsOverview: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  cardStat: {
    flex: 1,
  },

  cardStatRight: {
    alignItems: "flex-end",
  },

  cardStatLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginBottom: 5,
  },

  cardStatValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  cardProgressBackground: {
    height: 9,
    borderRadius: 99,
    marginTop: 18,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
  },

  cardProgress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.purple,
  },

  cardProgressText: {
    marginTop: 7,
    fontSize: 11,
    color: COLORS.secondary,
  },

  cardList: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  homeCardItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
    gap: 11,
  },

  homeCardIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  homeCardInfo: {
    flex: 1,
  },

  homeCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  homeCardBank: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.secondary,
  },

  homeCardProgressBackground: {
    height: 5,
    borderRadius: 99,
    marginTop: 7,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
    maxWidth: 190,
  },

  homeCardProgress: {
    height: "100%",
    borderRadius: 99,
  },

  homeCardRight: {
    alignItems: "flex-end",
  },

  homeCardUsed: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  homeCardAvailable: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.secondary,
  },

  viewCardsButton: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  viewCardsText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.purple,
  },

  viewCardsArrow: {
    fontSize: 18,
    color: COLORS.purple,
  },

  /* =========================
     KART ÖDEMELERİ
  ========================= */

  upcomingPaymentsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  upcomingPayment: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
    gap: 11,
  },

  upcomingPaymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  upcomingPaymentInfo: {
    flex: 1,
  },

  upcomingPaymentName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  upcomingPaymentBank: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.secondary,
  },

  upcomingPaymentDate: {
    alignItems: "flex-end",
  },

  upcomingPaymentDateLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  upcomingPaymentDateValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.purple,
  },

  /* =========================
     HESAPLAR
  ========================= */

  accountsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  accountRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  accountName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  accountType: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 3,
  },

  accountBalance: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyAccountCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyAccountIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emptyAccountContent: {
    flex: 1,
  },

  emptyAccountTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyAccountText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  emptyAccountArrow: {
    fontSize: 28,
    color: COLORS.secondary,
    marginLeft: 10,
  },

  /* =========================
     BÜTÇELER
  ========================= */

  budgetCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  budgetTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  budgetLabel: {
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 5,
  },

  budgetAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },

  budgetPercentageBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
  },

  budgetPercentage: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16A34A",
  },

  overBudgetPercentage: {
    color: COLORS.orange,
  },

  progressBackground: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 5,
  },

  progressOver: {
    backgroundColor: COLORS.orange,
  },

  budgetBottom: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 18,
  },

  budgetBottomRight: {
    alignItems: "flex-end",
  },

  budgetBottomLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 3,
  },

  budgetSpent: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.orange,
  },

  budgetRemaining: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.green,
  },

  budgetOver: {
    color: COLORS.orange,
  },

  budgetList: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    paddingTop: 6,
  },

  budgetItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    gap: 12,
  },

  budgetItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  budgetItemText: {
    flex: 1,
  },

  budgetItemName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  budgetMiniProgressBackground: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
    width: "100%",
    maxWidth: 180,
  },

  budgetMiniProgress: {
    height: "100%",
    borderRadius: 3,
  },

  budgetItemRight: {
    alignItems: "flex-end",
    minWidth: 95,
  },

  budgetItemSpent: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  budgetItemLimit: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 2,
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  viewBudgetsButton: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  viewBudgetsText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.blue,
  },

  viewBudgetsArrow: {
    fontSize: 18,
    color: COLORS.blue,
  },

  emptyBudgetCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyBudgetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  emptyBudgetContent: {
    flex: 1,
  },

  emptyBudgetTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyBudgetText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  emptyBudgetArrow: {
    fontSize: 28,
    color: COLORS.secondary,
    marginLeft: 10,
  },

  /* =========================
     İŞLEMLER
  ========================= */

  transactionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  transaction: {
    minHeight: 76,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
    gap: 12,
  },

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  transactionText: {
    flex: 1,
  },

  transactionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  transactionCategory: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyTransactionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  emptyCardOverview: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyCardOverviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  emptyCardOverviewContent: {
    flex: 1,
  },

  emptyCardOverviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  emptyCardOverviewText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondary,
  },

  emptyCardOverviewArrow: {
    fontSize: 28,
    color: COLORS.secondary,
    marginLeft: 10,
  },

  addButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});