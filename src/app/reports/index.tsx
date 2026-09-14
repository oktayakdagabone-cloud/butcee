import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useBudgets } from "../context/BudgetContext";
import { useCards } from "../context/CardContext";
import { useCategories } from "../context/CategoryContext";
import { useTransactions } from "../context/TransactionContext";

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

const weekDays = [
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
  "Paz",
];

const TROY_LOGO =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Troy-logo-sloganli.png";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTransactionDate(dateString: string) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function isDateInRange(
  dateString: string,
  startDate: Date,
  endDate: Date
) {
  const transactionDate = new Date(dateString);

  if (isNaN(transactionDate.getTime())) {
    return false;
  }

  return (
    transactionDate >= startOfDay(startDate) &&
    transactionDate <= endOfDay(endDate)
  );
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthKeyFromBudget(month: string) {
  const monthIndex = turkishMonths.findIndex((item) =>
    month.startsWith(item)
  );

  if (monthIndex === -1) {
    return null;
  }

  const yearMatch = month.match(/\d{4}/);

  if (!yearMatch) {
    return null;
  }

  return `${yearMatch[0]}-${String(
    monthIndex + 1
  ).padStart(2, "0")}`;
}

function getMonthsBetween(
  startDate: Date,
  endDate: Date
) {
  const months: string[] = [];

  const cursor = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );

  const finalDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    1
  );

  while (cursor <= finalDate) {
    months.push(getMonthKey(cursor));

    cursor.setMonth(
      cursor.getMonth() + 1
    );
  }

  return months;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function isSameDate(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function createCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(
    year,
    monthIndex,
    1
  );

  const lastDay = new Date(
    year,
    monthIndex + 1,
    0
  );

  let firstWeekDay =
    firstDay.getDay();

  firstWeekDay =
    firstWeekDay === 0
      ? 6
      : firstWeekDay - 1;

  const days: Array<Date | null> = [];

  for (
    let i = 0;
    i < firstWeekDay;
    i++
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= lastDay.getDate();
    day++
  ) {
    days.push(
      new Date(year, monthIndex, day)
    );
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

type CalendarProps = {
  selectedDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

function CalendarPicker({
  selectedDate,
  minDate,
  maxDate,
  onSelect,
  onClose,
}: CalendarProps) {
  const [visibleMonth, setVisibleMonth] =
    useState(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );

  const days = useMemo(
    () => createCalendarDays(visibleMonth),
    [visibleMonth]
  );

  function goPreviousMonth() {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() - 1,
        1
      )
    );
  }

  function goNextMonth() {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
        1
      )
    );
  }

  function isDisabled(date: Date) {
    if (
      minDate &&
      startOfDay(date) < startOfDay(minDate)
    ) {
      return true;
    }

    if (
      maxDate &&
      startOfDay(date) > startOfDay(maxDate)
    ) {
      return true;
    }

    return false;
  }

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Pressable
          style={styles.calendarArrow}
          onPress={goPreviousMonth}
        >
          <Text
            style={
              styles.calendarArrowText
            }
          >
            ‹
          </Text>
        </Pressable>

        <Text style={styles.calendarTitle}>
          {turkishMonths[
            visibleMonth.getMonth()
          ]}{" "}
          {visibleMonth.getFullYear()}
        </Text>

        <Pressable
          style={styles.calendarArrow}
          onPress={goNextMonth}
        >
          <Text
            style={
              styles.calendarArrowText
            }
          >
            ›
          </Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <View
            key={day}
            style={styles.weekDay}
          >
            <Text style={styles.weekDayText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => {
          if (!date) {
            return (
              <View
                key={`empty-${index}`}
                style={styles.dayCell}
              />
            );
          }

          const selected =
            isSameDate(
              date,
              selectedDate
            );

          const disabled =
            isDisabled(date);

          return (
            <Pressable
              key={dateKey(date)}
              style={[
                styles.dayCell,
                selected &&
                  styles.selectedDayCell,
              ]}
              disabled={disabled}
              onPress={() =>
                onSelect(date)
              }
            >
              <Text
                style={[
                  styles.dayText,
                  selected &&
                    styles.selectedDayText,
                  disabled &&
                    styles.disabledDayText,
                ]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={styles.calendarFooter}
      >
        <Pressable
          style={styles.todayButton}
          onPress={() =>
            onSelect(new Date())
          }
        >
          <Text
            style={styles.todayButtonText}
          >
            Bugün
          </Text>
        </Pressable>

        <Pressable
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text
            style={styles.closeButtonText}
          >
            Kapat
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type CardLogoProps = {
  network?: string;
};

function CardLogo({
  network,
}: CardLogoProps) {
  if (!network) {
    return null;
  }

  const normalized =
    network.toLowerCase();

  if (normalized === "troy") {
    return (
      <View style={styles.cardLogoBox}>
        <Image
          source={{
            uri: TROY_LOGO,
          }}
          resizeMode="contain"
          style={styles.troyLogo}
        />
      </View>
    );
  }

  if (normalized === "visa") {
    return (
      <View style={styles.cardLogoBox}>
        <Text
          style={[
            styles.cardNetworkText,
            styles.visaText,
          ]}
        >
          VISA
        </Text>
      </View>
    );
  }

  if (normalized === "mastercard") {
    return (
      <View style={styles.cardLogoBox}>
        <View
          style={styles.mastercardLogo}
        >
          <View
            style={[
              styles.mastercardCircle,
              styles.mastercardLeft,
            ]}
          />
          <View
            style={[
              styles.mastercardCircle,
              styles.mastercardRight,
            ]}
          />
        </View>

        <Text
          style={styles.mastercardText}
        >
          mastercard
        </Text>
      </View>
    );
  }

  if (normalized === "amex") {
    return (
      <View
        style={[
          styles.cardLogoBox,
          styles.amexBox,
        ]}
      >
        <Text
          style={styles.amexText}
        >
          AMERICAN
        </Text>

        <Text
          style={styles.amexText}
        >
          EXPRESS
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.cardLogoBox}>
      <Text
        style={styles.otherCardLogoText}
      >
        KART
      </Text>
    </View>
  );
}

type ExpenseDetailProps = {
  title: string;
  description: string;
  total: number;
  transactions: any[];
  accentStyle: any;
  emptyText: string;
  cards: any[];
  categories: any[];
};

function ExpenseDetailSection({
  title,
  description,
  total,
  transactions,
  accentStyle,
  emptyText,
  cards,
  categories,
}: ExpenseDetailProps) {
  function getTransactionCategory(
    transaction: any
  ) {
    return (
      categories.find(
        (item) =>
          item.id ===
          transaction.categoryId
      ) ||
      categories.find(
        (item) =>
          item.name ===
          transaction.categoryName
      )
    );
  }

  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeaderLeft}>
          <View
            style={[
              styles.detailAccent,
              accentStyle,
            ]}
          />

          <View>
            <Text style={styles.detailTitle}>
              {title}
            </Text>

            <Text
              style={
                styles.detailDescription
              }
            >
              {description}
            </Text>
          </View>
        </View>

        <View
          style={styles.detailTotalBox}
        >
          <Text
            style={
              styles.detailTotalLabel
            }
          >
            Toplam
          </Text>

          <Text
            style={styles.detailTotal}
          >
            ₺{formatMoney(total)}
          </Text>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View
          style={styles.detailEmpty}
        >
          <Text
            style={
              styles.detailEmptyTitle
            }
          >
            {emptyText}
          </Text>
        </View>
      ) : (
        <View style={styles.detailList}>
          {transactions.map(
            (transaction) => {
              const card =
                transaction.cardId
                  ? cards.find(
                      (item) =>
                        item.id ===
                        transaction.cardId
                    )
                  : undefined;

              const category =
                getTransactionCategory(
                  transaction
                );

              const categoryIcon =
                category?.icon ||
                "dots-horizontal";

              const categoryColor =
                category?.color ||
                "#7A8492";

              return (
                <View
                  key={transaction.id}
                  style={
                    styles.detailTransaction
                  }
                >
                  <View
                    style={
                      styles.detailTransactionLeft
                    }
                  >
                    <View
                      style={
                        styles.detailTransactionMainRow
                      }
                    >
                      <View
                        style={
                          styles.categoryTransactionIconBox
                        }
                      >
                        <MaterialCommunityIcons
                          name={
                            categoryIcon as any
                          }
                          size={21}
                          color={
                            categoryColor
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.detailTransactionTextBox
                        }
                      >
                        <Text
                          style={
                            styles.detailTransactionName
                          }
                          numberOfLines={1}
                        >
                          {transaction.description ||
                            transaction.categoryName ||
                            "Gider"}
                        </Text>

                        <View
                          style={
                            styles.detailTransactionMetaRow
                          }
                        >
                          <Text
                            style={
                              styles.detailTransactionMeta
                            }
                          >
                            {formatTransactionDate(
                              transaction.date
                            )}
                          </Text>

                          <Text
                            style={
                              styles.detailDot
                            }
                          >
                            •
                          </Text>

                          <Text
                            style={
                              styles.detailTransactionMeta
                            }
                          >
                            {transaction.categoryName ||
                              transaction.categoryId ||
                              "Kategorisiz"}
                          </Text>
                        </View>
                      </View>

                      {transaction.paymentSource ===
                        "card" &&
                        card && (
                          <View
                            style={
                              styles.transactionCardInfo
                            }
                          >
                            <CardLogo
                              network={
                                card.network
                              }
                            />

                            <View
                              style={
                                styles.transactionCardText
                              }
                            >
                              <Text
                                style={
                                  styles.transactionCardName
                                }
                                numberOfLines={1}
                              >
                                {card.name}
                              </Text>

                              <Text
                                style={
                                  styles.transactionCardBank
                                }
                                numberOfLines={1}
                              >
                                {card.bankName}
                              </Text>
                            </View>
                          </View>
                        )}
                    </View>
                  </View>

                  <Text
                    style={
                      styles.detailTransactionAmount
                    }
                  >
                    -₺
                    {formatMoney(
                      transaction.amount
                    )}
                  </Text>
                </View>
              );
            }
          )}
        </View>
      )}
    </View>
  );
}

export default function ReportsScreen() {
  const { transactions } =
    useTransactions();

  const { budgets } =
    useBudgets();

  const { categories } =
    useCategories();

  const { cards } =
    useCards();

  const today = new Date();

  const [startDate, setStartDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const [endDate, setEndDate] =
    useState(today);

  const [calendarMode, setCalendarMode] =
    useState<
      "start" | "end" | null
    >(null);

  const filteredTransactions =
    transactions.filter((transaction) =>
      isDateInRange(
        transaction.date,
        startDate,
        endDate
      )
    );

  const incomeTransactions =
    filteredTransactions.filter(
      (item) =>
        item.type === "income"
    );

  const expenseTransactions =
    filteredTransactions.filter(
      (item) =>
        item.type === "expense"
    );

  const subscriptionTransactions =
    expenseTransactions
      .filter(
        (transaction) =>
          transaction.fixedExpenseId?.startsWith(
            "subscription:"
          )
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

  const fixedExpenseTransactions =
    expenseTransactions
      .filter(
        (transaction) =>
          !!transaction.fixedExpenseId &&
          !transaction.fixedExpenseId.startsWith(
            "subscription:"
          )
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

  const normalExpenseTransactions =
    expenseTransactions
      .filter(
        (transaction) =>
          !transaction.fixedExpenseId
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

  const income =
    incomeTransactions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const expense =
    expenseTransactions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const normalExpense =
    normalExpenseTransactions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const fixedExpense =
    fixedExpenseTransactions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const subscriptionExpense =
    subscriptionTransactions.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const balance =
    income - expense;

  const incomeCount =
    incomeTransactions.length;

  const expenseCount =
    expenseTransactions.length;

  const normalExpenseCount =
    normalExpenseTransactions.length;

  const fixedExpenseCount =
    fixedExpenseTransactions.length;

  const subscriptionCount =
    subscriptionTransactions.length;

  const selectedMonths =
    getMonthsBetween(
      startDate,
      endDate
    );

  const selectedBudgets =
    budgets.filter((budget) => {
      const key =
        getMonthKeyFromBudget(
          budget.month
        );

      return (
        key !== null &&
        selectedMonths.includes(key)
      );
    });

  const totalBudget =
    selectedBudgets.reduce(
      (sum, budget) =>
        sum + budget.limit,
      0
    );

  const totalBudgetSpent =
    selectedBudgets.reduce(
      (sum, budget) =>
        sum + budget.spent,
      0
    );

  const budgetRemaining =
    totalBudget -
    totalBudgetSpent;

  const budgetPercentage =
    totalBudget > 0
      ? Math.round(
          (totalBudgetSpent /
            totalBudget) *
            100
        )
      : 0;

  const expenseCategories =
    expenseTransactions.reduce(
      (
        result,
        transaction
      ) => {
        const category =
          transaction.categoryName ||
          transaction.categoryId ||
          "Kategorisiz";

        result[category] =
          (result[category] || 0) +
          transaction.amount;

        return result;
      },
      {} as Record<string, number>
    );

  const categoryEntries =
    Object.entries(
      expenseCategories
    ).sort(
      ([, amountA], [, amountB]) =>
        amountB - amountA
    );

  const maxCategoryAmount =
    categoryEntries.length > 0
      ? categoryEntries[0][1]
      : 0;

  const monthlyChartData =
    selectedMonths.map(
      (monthKey) => {
        const [
          yearText,
          monthText,
        ] = monthKey.split("-");

        const year =
          Number(yearText);

        const monthIndex =
          Number(monthText) - 1;

        const monthIncome =
          filteredTransactions
            .filter(
              (transaction) => {
                const date =
                  new Date(
                    transaction.date
                  );

                return (
                  transaction.type ===
                    "income" &&
                  !isNaN(
                    date.getTime()
                  ) &&
                  date.getFullYear() ===
                    year &&
                  date.getMonth() ===
                    monthIndex
                );
              }
            )
            .reduce(
              (sum, transaction) =>
                sum +
                transaction.amount,
              0
            );

        const monthExpense =
          filteredTransactions
            .filter(
              (transaction) => {
                const date =
                  new Date(
                    transaction.date
                  );

                return (
                  transaction.type ===
                    "expense" &&
                  !isNaN(
                    date.getTime()
                  ) &&
                  date.getFullYear() ===
                    year &&
                  date.getMonth() ===
                    monthIndex
                );
              }
            )
            .reduce(
              (sum, transaction) =>
                sum +
                transaction.amount,
              0
            );

        return {
          key: monthKey,
          label:
            turkishMonths[
              monthIndex
            ].slice(0, 3),
          year,
          income: monthIncome,
          expense: monthExpense,
          net:
            monthIncome -
            monthExpense,
        };
      }
    );

  const maxMonthlyValue =
    Math.max(
      1,
      ...monthlyChartData.flatMap(
        (item) => [
          item.income,
          item.expense,
          Math.abs(item.net),
        ]
      )
    );

  function setPreset(
    preset:
      | "thisMonth"
      | "lastMonth"
      | "last7"
      | "last30"
  ) {
    const current = new Date();

    if (preset === "thisMonth") {
      setStartDate(
        new Date(
          current.getFullYear(),
          current.getMonth(),
          1
        )
      );

      setEndDate(current);
      return;
    }

    if (preset === "lastMonth") {
      setStartDate(
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
      );

      setEndDate(
        new Date(
          current.getFullYear(),
          current.getMonth(),
          0
        )
      );

      return;
    }

    if (preset === "last7") {
      const start =
        new Date(current);

      start.setDate(
        start.getDate() - 6
      );

      setStartDate(start);
      setEndDate(current);
      return;
    }

    const start =
      new Date(current);

    start.setDate(
      start.getDate() - 29
    );

    setStartDate(start);
    setEndDate(current);
  }

  function selectStartDate(
    selected: Date
  ) {
    if (selected > endDate) {
      setStartDate(endDate);
      setEndDate(selected);
    } else {
      setStartDate(selected);
    }

    setCalendarMode(null);
  }

  function selectEndDate(
    selected: Date
  ) {
    if (selected < startDate) {
      setStartDate(selected);
      setEndDate(endDate);
    } else {
      setEndDate(selected);
    }

    setCalendarMode(null);
  }

  function getCategoryInfo(
    categoryName: string
  ) {
    const category =
      categories.find(
        (item) =>
          item.name ===
          categoryName
      );

    return {
      icon:
        category?.icon ||
        "dots-horizontal",
      color:
        category?.color ||
        "#7A8492",
    };
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Raporlar
      </Text>

      <Text style={styles.subtitle}>
        Seçtiğin tarih aralığındaki
        finansal durumunu incele.
      </Text>

      {/* TARİH ARALIĞI */}

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>
          Rapor Tarih Aralığı
        </Text>

        <View style={styles.dateRow}>
          <Pressable
            style={[
              styles.dateButton,
              calendarMode ===
                "start" &&
                styles.activeDateButton,
            ]}
            onPress={() =>
              setCalendarMode("start")
            }
          >
            <Text style={styles.dateLabel}>
              BAŞLANGIÇ
            </Text>

            <Text style={styles.dateValue}>
              {formatDate(startDate)}
            </Text>
          </Pressable>

          <Text style={styles.arrow}>
            →
          </Text>

          <Pressable
            style={[
              styles.dateButton,
              calendarMode ===
                "end" &&
                styles.activeDateButton,
            ]}
            onPress={() =>
              setCalendarMode("end")
            }
          >
            <Text style={styles.dateLabel}>
              BİTİŞ
            </Text>

            <Text style={styles.dateValue}>
              {formatDate(endDate)}
            </Text>
          </Pressable>
        </View>

        {calendarMode === "start" && (
          <CalendarPicker
            selectedDate={startDate}
            maxDate={endDate}
            onSelect={
              selectStartDate
            }
            onClose={() =>
              setCalendarMode(null)
            }
          />
        )}

        {calendarMode === "end" && (
          <CalendarPicker
            selectedDate={endDate}
            minDate={startDate}
            onSelect={
              selectEndDate
            }
            onClose={() =>
              setCalendarMode(null)
            }
          />
        )}

        <View style={styles.presetRow}>
          <Pressable
            style={
              styles.presetButton
            }
            onPress={() =>
              setPreset("thisMonth")
            }
          >
            <Text style={styles.presetText}>
              Bu Ay
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.presetButton
            }
            onPress={() =>
              setPreset("lastMonth")
            }
          >
            <Text style={styles.presetText}>
              Geçen Ay
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.presetButton
            }
            onPress={() =>
              setPreset("last7")
            }
          >
            <Text style={styles.presetText}>
              Son 7 Gün
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.presetButton
            }
            onPress={() =>
              setPreset("last30")
            }
          >
            <Text style={styles.presetText}>
              Son 30 Gün
            </Text>
          </Pressable>
        </View>

        <Text style={styles.filterSummary}>
          {formatDate(startDate)} →{" "}
          {formatDate(endDate)}
        </Text>
      </View>

      {/* ÖZET */}

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.label}>
            TOPLAM GELİR
          </Text>

          <Text
            style={[
              styles.amount,
              styles.income,
            ]}
          >
            +₺{formatMoney(income)}
          </Text>

          <Text
            style={
              styles.cardDescription
            }
          >
            {incomeCount} gelir işlemi
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.label}>
            TOPLAM GİDER
          </Text>

          <Text
            style={[
              styles.amount,
              styles.expense,
            ]}
          >
            -₺{formatMoney(expense)}
          </Text>

          <Text
            style={
              styles.cardDescription
            }
          >
            {expenseCount} gider işlemi
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.label}>
            NET DURUM
          </Text>

          <Text
            style={[
              styles.amount,
              balance >= 0
                ? styles.income
                : styles.expense,
            ]}
          >
            {balance >= 0
              ? "+"
              : "-"}
            ₺
            {formatMoney(
              Math.abs(balance)
            )}
          </Text>

          <Text
            style={
              styles.cardDescription
            }
          >
            Seçilen dönem
          </Text>
        </View>
      </View>

      {/* AYLIK GRAFİK */}

      <Text style={styles.sectionTitle}>
        Aylık Gelir / Gider
      </Text>

      {monthlyChartData.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <Text
            style={styles.emptyTitle}
          >
            Grafik için dönem bulunmuyor
          </Text>

          <Text style={styles.emptyText}>
            Seçilen tarih aralığında
            gösterilecek ay bulunmuyor.
          </Text>
        </View>
      ) : (
        <View style={styles.chartCard}>
          <View
            style={styles.chartLegend}
          >
            <View
              style={styles.legendItem}
            >
              <View
                style={[
                  styles.legendDot,
                  styles.incomeLegend,
                ]}
              />

              <Text
                style={styles.legendText}
              >
                Gelir
              </Text>
            </View>

            <View
              style={styles.legendItem}
            >
              <View
                style={[
                  styles.legendDot,
                  styles.expenseLegend,
                ]}
              />

              <Text
                style={styles.legendText}
              >
                Gider
              </Text>
            </View>

            <View
              style={styles.legendItem}
            >
              <View
                style={[
                  styles.legendDot,
                  styles.netLegend,
                ]}
              />

              <Text
                style={styles.legendText}
              >
                Net
              </Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            <View style={styles.chartYAxis}>
              <Text
                style={styles.chartAxisText}
              >
                ₺
                {formatMoney(
                  maxMonthlyValue
                )}
              </Text>

              <Text
                style={styles.chartAxisText}
              >
                ₺
                {formatMoney(
                  maxMonthlyValue / 2
                )}
              </Text>

              <Text
                style={styles.chartAxisText}
              >
                ₺0
              </Text>
            </View>

            <View
              style={styles.chartPlot}
            >
              <View
                style={
                  styles.chartHorizontalLineTop
                }
              />

              <View
                style={
                  styles.chartHorizontalLineMiddle
                }
              />

              <View
                style={
                  styles.chartHorizontalLineBottom
                }
              />

              <View
                style={
                  styles.chartColumns
                }
              >
                {monthlyChartData.map(
                  (item) => {
                    const incomeHeight =
                      (item.income /
                        maxMonthlyValue) *
                      155;

                    const expenseHeight =
                      (item.expense /
                        maxMonthlyValue) *
                      155;

                    const netHeight =
                      (Math.abs(
                        item.net
                      ) /
                        maxMonthlyValue) *
                      155;

                    return (
                      <View
                        key={item.key}
                        style={
                          styles.chartMonthColumn
                        }
                      >
                        <View
                          style={
                            styles.chartBarArea
                          }
                        >
                          <View
                            style={
                              styles.chartBarGroup
                            }
                          >
                            <View
                              style={
                                styles.chartBarValueBox
                              }
                            >
                              <Text
                                style={
                                  styles.chartValueText
                                }
                              >
                                {item.income >
                                0
                                  ? `₺${formatMoney(
                                      item.income
                                    )}`
                                  : ""}
                              </Text>

                              <View
                                style={[
                                  styles.chartBar,
                                  styles.incomeBar,
                                  {
                                    height:
                                      Math.max(
                                        item.income >
                                          0
                                          ? 4
                                          : 0,
                                        incomeHeight
                                      ),
                                  },
                                ]}
                              />
                            </View>

                            <View
                              style={
                                styles.chartBarValueBox
                              }
                            >
                              <Text
                                style={
                                  styles.chartValueText
                                }
                              >
                                {item.expense >
                                0
                                  ? `₺${formatMoney(
                                      item.expense
                                    )}`
                                  : ""}
                              </Text>

                              <View
                                style={[
                                  styles.chartBar,
                                  styles.expenseBar,
                                  {
                                    height:
                                      Math.max(
                                        item.expense >
                                          0
                                          ? 4
                                          : 0,
                                        expenseHeight
                                      ),
                                  },
                                ]}
                              />
                            </View>

                            <View
                              style={
                                styles.chartBarValueBox
                              }
                            >
                              <Text
                                style={
                                  styles.chartValueText
                                }
                              >
                                {item.net !==
                                0
                                  ? `${
                                      item.net >=
                                      0
                                        ? "+"
                                        : "-"
                                    }₺${formatMoney(
                                      Math.abs(
                                        item.net
                                      )
                                    )}`
                                  : "₺0"}
                              </Text>

                              <View
                                style={[
                                  styles.chartBar,
                                  item.net >=
                                    0
                                    ? styles.netPositiveBar
                                    : styles.netNegativeBar,
                                  {
                                    height:
                                      Math.max(
                                        item.net !==
                                          0
                                          ? 4
                                          : 0,
                                        netHeight
                                      ),
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>

                        <Text
                          style={
                            styles.chartMonthLabel
                          }
                        >
                          {item.label}
                        </Text>

                        <Text
                          style={
                            styles.chartYearLabel
                          }
                        >
                          {item.year}
                        </Text>
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* GİDER TÜRÜ DAĞILIMI */}

      <Text style={styles.sectionTitle}>
        Gider Türü Dağılımı
      </Text>

      <View
        style={styles.expenseTypeGrid}
      >
        <View
          style={
            styles.expenseTypeCard
          }
        >
          <Text
            style={
              styles.expenseTypeLabel
            }
          >
            NORMAL GİDERLER
          </Text>

          <Text
            style={[
              styles.expenseTypeAmount,
              styles.expense,
            ]}
          >
            ₺{formatMoney(normalExpense)}
          </Text>

          <Text
            style={
              styles.expenseTypeCount
            }
          >
            {normalExpenseCount} işlem
          </Text>

          <View
            style={
              styles.expenseTypeTrack
            }
          >
            <View
              style={[
                styles.expenseTypeProgress,
                styles.normalProgress,
                {
                  width: `${
                    expense > 0
                      ? (normalExpense /
                          expense) *
                        100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.expenseTypePercentage
            }
          >
            Toplam giderlerin %
            {expense > 0
              ? Math.round(
                  (normalExpense /
                    expense) *
                    100
                )
              : 0}
          </Text>
        </View>

        <View
          style={
            styles.expenseTypeCard
          }
        >
          <Text
            style={
              styles.expenseTypeLabel
            }
          >
            SABİT GİDERLER
          </Text>

          <Text
            style={[
              styles.expenseTypeAmount,
              styles.expense,
            ]}
          >
            ₺{formatMoney(fixedExpense)}
          </Text>

          <Text
            style={
              styles.expenseTypeCount
            }
          >
            {fixedExpenseCount} işlem
          </Text>

          <View
            style={
              styles.expenseTypeTrack
            }
          >
            <View
              style={[
                styles.expenseTypeProgress,
                styles.fixedProgress,
                {
                  width: `${
                    expense > 0
                      ? (fixedExpense /
                          expense) *
                        100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.expenseTypePercentage
            }
          >
            Toplam giderlerin %
            {expense > 0
              ? Math.round(
                  (fixedExpense /
                    expense) *
                    100
                )
              : 0}
          </Text>
        </View>

        <View
          style={
            styles.expenseTypeCard
          }
        >
          <Text
            style={
              styles.expenseTypeLabel
            }
          >
            ABONELİKLER
          </Text>

          <Text
            style={[
              styles.expenseTypeAmount,
              styles.expense,
            ]}
          >
            ₺
            {formatMoney(
              subscriptionExpense
            )}
          </Text>

          <Text
            style={
              styles.expenseTypeCount
            }
          >
            {subscriptionCount} işlem
          </Text>

          <View
            style={
              styles.expenseTypeTrack
            }
          >
            <View
              style={[
                styles.expenseTypeProgress,
                styles.subscriptionProgress,
                {
                  width: `${
                    expense > 0
                      ? (subscriptionExpense /
                          expense) *
                        100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.expenseTypePercentage
            }
          >
            Toplam giderlerin %
            {expense > 0
              ? Math.round(
                  (subscriptionExpense /
                    expense) *
                    100
                )
              : 0}
          </Text>
        </View>
      </View>

      {/* GİDER DETAYLARI */}

      <Text style={styles.sectionTitle}>
        Gider Detayları
      </Text>

      <ExpenseDetailSection
        title="Normal Giderler"
        description="Tek seferlik veya manuel eklenen gider işlemleri"
        total={normalExpense}
        transactions={
          normalExpenseTransactions
        }
        accentStyle={
          styles.normalDetailAccent
        }
        emptyText="Bu dönemde normal gider bulunmuyor."
        cards={cards}
        categories={categories}
      />

      <ExpenseDetailSection
        title="Sabit Giderler"
        description="Ödenmiş sabit gider işlemleri"
        total={fixedExpense}
        transactions={
          fixedExpenseTransactions
        }
        accentStyle={
          styles.fixedDetailAccent
        }
        emptyText="Bu dönemde ödenmiş sabit gider bulunmuyor."
        cards={cards}
        categories={categories}
      />

      <ExpenseDetailSection
        title="Abonelikler"
        description="Ödenmiş abonelik işlemleri"
        total={subscriptionExpense}
        transactions={
          subscriptionTransactions
        }
        accentStyle={
          styles.subscriptionDetailAccent
        }
        emptyText="Bu dönemde ödenmiş abonelik bulunmuyor."
        cards={cards}
        categories={categories}
      />

      {/* DÖNEM */}

      <View style={styles.monthCard}>
        <Text
          style={
            styles.sectionTitleInner
          }
        >
          Seçilen Dönem
        </Text>

        <Text
          style={styles.sectionSubtitle}
        >
          {formatDate(startDate)} →{" "}
          {formatDate(endDate)}
        </Text>

        <View style={styles.monthRow}>
          <View style={styles.monthItem}>
            <Text
              style={
                styles.monthItemLabel
              }
            >
              Gelir
            </Text>

            <Text
              style={[
                styles.monthItemValue,
                styles.income,
              ]}
            >
              +₺{formatMoney(income)}
            </Text>
          </View>

          <View style={styles.monthItem}>
            <Text
              style={
                styles.monthItemLabel
              }
            >
              Gider
            </Text>

            <Text
              style={[
                styles.monthItemValue,
                styles.expense,
              ]}
            >
              -₺
              {formatMoney(
                expense
              )}
            </Text>
          </View>

          <View style={styles.monthItem}>
            <Text
              style={
                styles.monthItemLabel
              }
            >
              Net
            </Text>

            <Text
              style={[
                styles.monthItemValue,
                balance >= 0
                  ? styles.income
                  : styles.expense,
              ]}
            >
              {balance >= 0
                ? "+"
                : "-"}
              ₺
              {formatMoney(
                Math.abs(balance)
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* HARCAMA DAĞILIMI */}

      <Text style={styles.sectionTitle}>
        Harcama Dağılımı
      </Text>

      {categoryEntries.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <Text
            style={styles.emptyTitle}
          >
            Bu tarih aralığında gider yok
          </Text>

          <Text
            style={styles.emptyText}
          >
            Seçtiğin tarihler arasında
            gider işlemi bulunmuyor.
          </Text>
        </View>
      ) : (
        <View style={styles.reportCard}>
          {categoryEntries.map(
            ([category, amount]) => {
              const percentage =
                expense > 0
                  ? Math.round(
                      (amount /
                        expense) *
                        100
                    )
                  : 0;

              const width =
                maxCategoryAmount >
                0
                  ? (amount /
                      maxCategoryAmount) *
                    100
                  : 0;

              const categoryInfo =
                getCategoryInfo(
                  category
                );

              return (
                <View
                  key={category}
                  style={
                    styles.categoryReport
                  }
                >
                  <View
                    style={
                      styles.categoryHeader
                    }
                  >
                    <View
                      style={
                        styles.categoryNameRow
                      }
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor:
                              `${categoryInfo.color}20`,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            categoryInfo.icon as any
                          }
                          size={18}
                          color={
                            categoryInfo.color
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.categoryName
                        }
                      >
                        {category}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.categoryAmount
                      }
                    >
                      ₺
                      {formatMoney(
                        amount
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.categoryTrack
                    }
                  >
                    <View
                      style={[
                        styles.categoryProgress,
                        {
                          width: `${width}%`,
                          backgroundColor:
                            categoryInfo.color,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={
                      styles.categoryPercentage
                    }
                  >
                    Toplam giderlerin %
                    {percentage}
                  </Text>
                </View>
              );
            }
          )}
        </View>
      )}

      {/* BÜTÇE */}

      <Text style={styles.sectionTitle}>
        Bütçe Performansı
      </Text>

      {selectedBudgets.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <Text
            style={styles.emptyTitle}
          >
            Bu dönem için bütçe yok
          </Text>

          <Text style={styles.emptyText}>
            Seçilen tarih aralığındaki
            aylarda oluşturulmuş bütçe
            bulunmuyor.
          </Text>
        </View>
      ) : (
        <View style={styles.reportCard}>
          <View
            style={
              styles.budgetSummaryRow
            }
          >
            <View>
              <Text
                style={
                  styles.budgetSummaryLabel
                }
              >
                Toplam Limit
              </Text>

              <Text
                style={
                  styles.budgetSummaryValue
                }
              >
                ₺
                {formatMoney(
                  totalBudget
                )}
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.budgetSummaryLabel
                }
              >
                Harcanan
              </Text>

              <Text
                style={[
                  styles.budgetSummaryValue,
                  styles.expense,
                ]}
              >
                ₺
                {formatMoney(
                  totalBudgetSpent
                )}
              </Text>
            </View>

            <View
              style={
                styles.budgetSummaryRight
              }
            >
              <Text
                style={
                  styles.budgetSummaryLabel
                }
              >
                {budgetRemaining >=
                0
                  ? "Kalan"
                  : "Aşım"}
              </Text>

              <Text
                style={[
                  styles.budgetSummaryValue,
                  budgetRemaining >=
                  0
                    ? styles.income
                    : styles.expense,
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
              styles.categoryTrack
            }
          >
            <View
              style={[
                styles.categoryProgress,
                budgetRemaining < 0 &&
                  styles.overProgress,
                {
                  width: `${Math.min(
                    budgetPercentage,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.budgetPercentageText
            }
          >
            %{budgetPercentage} bütçe
            kullanıldı
          </Text>
        </View>
      )}

      {/* İŞLEM ÖZETİ */}

      <Text style={styles.sectionTitle}>
        İşlem Özeti
      </Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Toplam işlem
          </Text>

          <Text
            style={styles.statValue}
          >
            {filteredTransactions.length}
          </Text>
        </View>

        <View
          style={styles.statDivider}
        />

        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Gelir işlemleri
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.income,
            ]}
          >
            {incomeCount}
          </Text>
        </View>

        <View
          style={styles.statDivider}
        />

        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Toplam gider işlemleri
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.expense,
            ]}
          >
            {expenseCount}
          </Text>
        </View>

        <View
          style={styles.statDivider}
        />

        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Normal gider işlemleri
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.expense,
            ]}
          >
            {normalExpenseCount}
          </Text>
        </View>

        <View
          style={styles.statDivider}
        />

        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Sabit gider işlemleri
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.expense,
            ]}
          >
            {fixedExpenseCount}
          </Text>
        </View>

        <View
          style={styles.statDivider}
        />

        <View style={styles.statRow}>
          <Text
            style={styles.statLabel}
          >
            Abonelik işlemleri
          </Text>

          <Text
            style={[
              styles.statValue,
              styles.expense,
            ]}
          >
            {subscriptionCount}
          </Text>
        </View>
      </View>
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

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#17202A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#7A8492",
    marginBottom: 28,
  },

  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
    marginBottom: 18,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 16,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dateButton: {
    flex: 1,
    minHeight: 68,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  activeDateButton: {
    borderColor: "#3B82F6",
    backgroundColor: "#EEF4FF",
  },

  dateLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7A8492",
    marginBottom: 7,
  },

  dateValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17202A",
  },

  arrow: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7A8492",
  },

  calendarCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  calendarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17202A",
  },

  calendarArrow: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  calendarArrowText: {
    fontSize: 26,
    lineHeight: 28,
    color: "#17202A",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  weekDay: {
    width: "14.2857%",
    alignItems: "center",
    paddingVertical: 6,
  },

  weekDayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A8492",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  selectedDayCell: {
    backgroundColor: "#3B82F6",
  },

  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#17202A",
  },

  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabledDayText: {
    color: "#C7CDD5",
  },

  calendarFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  todayButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
  },

  todayButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },

  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  closeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A8492",
  },

  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
  },

  presetText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },

  filterSummary: {
    marginTop: 14,
    fontSize: 12,
    color: "#7A8492",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 240,
    minHeight: 132,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A8492",
    marginBottom: 10,
  },

  amount: {
    fontSize: 23,
    fontWeight: "800",
  },

  income: {
    color: "#22C55E",
  },

  expense: {
    color: "#FF8A3D",
  },

  cardDescription: {
    marginTop: 8,
    fontSize: 12,
    color: "#7A8492",
  },

  /* GRAFİK */

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    marginRight: 6,
  },

  incomeLegend: {
    backgroundColor: "#22C55E",
  },

  expenseLegend: {
    backgroundColor: "#FF8A3D",
  },

  netLegend: {
    backgroundColor: "#3B82F6",
  },

  legendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A8492",
  },

  chartArea: {
    flexDirection: "row",
    minHeight: 220,
  },

  chartYAxis: {
    width: 80,
    justifyContent: "space-between",
    paddingBottom: 28,
  },

  chartAxisText: {
    fontSize: 10,
    color: "#A0A8B3",
    textAlign: "right",
  },

  chartPlot: {
    flex: 1,
    position: "relative",
    minWidth: 0,
    height: 195,
  },

  chartHorizontalLineTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#EEF1F4",
  },

  chartHorizontalLineMiddle: {
    position: "absolute",
    top: 82,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#EEF1F4",
  },

  chartHorizontalLineBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#DDE3EA",
  },

  chartColumns: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    height: 195,
  },

  chartMonthColumn: {
    flex: 1,
    minWidth: 72,
    maxWidth: 120,
    height: 195,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chartBarArea: {
    width: "100%",
    height: 166,
    justifyContent: "flex-end",
  },

  chartBarGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    height: 166,
  },

  chartBarValueBox: {
    height: 166,
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
    minWidth: 26,
  },

  chartValueText: {
    marginBottom: 4,
    fontSize: 7,
    color: "#7A8492",
    textAlign: "center",
  },

  chartBar: {
    width: 14,
    minHeight: 0,
    borderRadius: 5,
  },

  incomeBar: {
    backgroundColor: "#22C55E",
  },

  expenseBar: {
    backgroundColor: "#FF8A3D",
  },

  netPositiveBar: {
    backgroundColor: "#3B82F6",
  },

  netNegativeBar: {
    backgroundColor: "#EF4444",
  },

  chartMonthLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "800",
    color: "#17202A",
  },

  chartYearLabel: {
    marginTop: 2,
    fontSize: 9,
    color: "#A0A8B3",
  },

  /* GİDER TÜRÜ */

  expenseTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  expenseTypeCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  expenseTypeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7A8492",
    marginBottom: 9,
  },

  expenseTypeAmount: {
    fontSize: 21,
    fontWeight: "800",
  },

  expenseTypeCount: {
    marginTop: 6,
    fontSize: 12,
    color: "#7A8492",
  },

  expenseTypeTrack: {
    marginTop: 16,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
  },

  expenseTypeProgress: {
    height: "100%",
    borderRadius: 99,
  },

  normalProgress: {
    backgroundColor: "#FF8A3D",
  },

  fixedProgress: {
    backgroundColor: "#3B82F6",
  },

  subscriptionProgress: {
    backgroundColor: "#8B5CF6",
  },

  expenseTypePercentage: {
    marginTop: 7,
    fontSize: 11,
    color: "#7A8492",
  },

  /* GİDER DETAYLARI */

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
    marginBottom: 14,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  detailHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  detailAccent: {
    width: 5,
    height: 44,
    borderRadius: 99,
    marginRight: 12,
  },

  normalDetailAccent: {
    backgroundColor: "#FF8A3D",
  },

  fixedDetailAccent: {
    backgroundColor: "#3B82F6",
  },

  subscriptionDetailAccent: {
    backgroundColor: "#8B5CF6",
  },

  detailTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17202A",
  },

  detailDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A8492",
  },

  detailTotalBox: {
    alignItems: "flex-end",
  },

  detailTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7A8492",
    marginBottom: 4,
  },

  detailTotal: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17202A",
  },

  detailList: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  detailTransaction: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  detailTransactionLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
  },

  detailTransactionMainRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  categoryTransactionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
    marginRight: 10,
  },

  detailTransactionTextBox: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  detailTransactionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17202A",
  },

  detailTransactionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  detailTransactionMeta: {
    fontSize: 11,
    color: "#7A8492",
  },

  detailDot: {
    marginHorizontal: 6,
    color: "#AAB2BD",
    fontSize: 11,
  },

  transactionCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 175,
    maxWidth: 220,
  },

  cardLogoBox: {
    width: 48,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
    overflow: "hidden",
  },

  troyLogo: {
    width: 42,
    height: 25,
  },

  cardNetworkText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  visaText: {
    color: "#1A4AA1",
    fontStyle: "italic",
  },

  mastercardLogo: {
    width: 25,
    height: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  mastercardCircle: {
    width: 15,
    height: 15,
    borderRadius: 99,
  },

  mastercardLeft: {
    backgroundColor: "#EB001B",
    marginRight: -5,
  },

  mastercardRight: {
    backgroundColor: "#F79E1B",
  },

  mastercardText: {
    marginTop: 1,
    fontSize: 5,
    fontWeight: "800",
    color: "#17202A",
  },

  amexBox: {
    backgroundColor: "#2A75BB",
  },

  amexText: {
    fontSize: 5,
    lineHeight: 6,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  otherCardLogoText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#7A8492",
  },

  transactionCardText: {
    marginLeft: 9,
    flex: 1,
    minWidth: 0,
  },

  transactionCardName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17202A",
  },

  transactionCardBank: {
    marginTop: 2,
    fontSize: 10,
    color: "#7A8492",
  },

  detailTransactionAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF8A3D",
  },

  detailEmpty: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    paddingTop: 18,
  },

  detailEmptyTitle: {
    fontSize: 13,
    color: "#7A8492",
  },

  monthCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  sectionTitleInner: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17202A",
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A8492",
  },

  monthRow: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  monthItem: {
    flex: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F7F8FA",
  },

  monthItemLabel: {
    fontSize: 12,
    color: "#7A8492",
    marginBottom: 6,
  },

  monthItemValue: {
    fontSize: 16,
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#17202A",
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  categoryReport: {
    marginBottom: 20,
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryIconText: {
    fontSize: 16,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17202A",
  },

  categoryAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  categoryTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: "#E8ECF1",
    overflow: "hidden",
  },

  categoryProgress: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#FF8A3D",
  },

  overProgress: {
    backgroundColor: "#EF4444",
  },

  categoryPercentage: {
    marginTop: 6,
    fontSize: 11,
    color: "#7A8492",
  },

  budgetSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  budgetSummaryLabel: {
    fontSize: 11,
    color: "#7A8492",
    marginBottom: 4,
  },

  budgetSummaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17202A",
  },

  budgetSummaryRight: {
    alignItems: "flex-end",
  },

  budgetPercentageText: {
    marginTop: 7,
    fontSize: 12,
    color: "#7A8492",
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  statRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statDivider: {
    height: 1,
    backgroundColor: "#EEF1F4",
  },

  statLabel: {
    fontSize: 14,
    color: "#7A8492",
  },

  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#7A8492",
    textAlign: "center",
    maxWidth: 560,
  },
});