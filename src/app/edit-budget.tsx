import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useBudgets } from "./context/BudgetContext";
import { useCategories } from "./context/CategoryContext";
import { useTransactions } from "./context/TransactionContext";

const months = [
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

function getMonthLabel(date: string) {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  return `${months[
    parsedDate.getMonth()
  ]} ${parsedDate.getFullYear()}`;
}

export default function EditBudgetScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    budgets,
    updateBudget,
  } = useBudgets();

  const {
    getCategoriesByType,
  } = useCategories();

  const { transactions } =
    useTransactions();

  const expenseCategories =
    getCategoriesByType("expense");

  const budget = budgets.find(
    (item) => item.id === id
  );

  const [categoryId, setCategoryId] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear());

  const [
    showPeriodPicker,
    setShowPeriodPicker,
  ] = useState(false);

  const [limit, setLimit] =
    useState("");

  useEffect(() => {
    if (!budget) {
      return;
    }

    const existingCategory =
      expenseCategories.find(
        (category) =>
          category.id ===
          budget.categoryId
      );

    if (existingCategory) {
      setCategoryId(
        existingCategory.id
      );
    } else {
      const categoryByName =
        expenseCategories.find(
          (category) =>
            category.name ===
            budget.category
        );

      setCategoryId(
        categoryByName?.id ?? ""
      );
    }

    setLimit(
      budget.limit.toString()
    );

    const parts =
      budget.month.split(" ");

    if (parts.length >= 2) {
      const monthIndex =
        months.indexOf(parts[0]);

      const year =
        Number(parts[1]);

      if (monthIndex !== -1) {
        setSelectedMonth(
          monthIndex
        );
      }

      if (!isNaN(year)) {
        setSelectedYear(year);
      }
    }
  }, [
    budget,
    expenseCategories,
  ]);

  if (!budget) {
    return (
      <View style={styles.screen}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Bütçe bulunamadı
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.replace("/budgets")
            }
          >
            <Text
              style={styles.backButtonText}
            >
              Bütçelere Dön
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const selectedCategory =
    expenseCategories.find(
      (category) =>
        category.id === categoryId
    );

  const numericLimit = Number(
    limit
      .replace(",", ".")
      .replace(/[^0-9.]/g, "")
  );

  const isValid =
    selectedCategory !== undefined &&
    numericLimit > 0;

  const selectedMonthLabel = `${months[selectedMonth]} ${selectedYear}`;

  const recalculatedSpent =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
            "expense" &&
          getMonthLabel(
            transaction.date
          ) === selectedMonthLabel &&
          (
            transaction.categoryId ===
              categoryId ||
            (
              !transaction.categoryId &&
              transaction.categoryName ===
                selectedCategory?.name
            )
          )
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      );

  function handleSave() {
    if (!isValid || !selectedCategory) {
      return;
    }

    updateBudget(id, {
      category:
        selectedCategory.name,

      categoryId:
        selectedCategory.id,

      month: selectedMonthLabel,

      limit: numericLimit,

      spent: recalculatedSpent,
    });

    router.replace("/budgets");
  }

  function previousYear() {
    setSelectedYear(
      (current) => current - 1
    );
  }

  function nextYear() {
    setSelectedYear(
      (current) => current + 1
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.scrollContent
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Bütçeyi Düzenle
            </Text>

            <Text style={styles.subtitle}>
              Bütçe bilgilerini güncelle.
            </Text>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.backButtonText}
            >
              Geri
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            Kategori
          </Text>

          {expenseCategories.length ===
          0 ? (
            <View
              style={
                styles.emptyCategoryBox
              }
            >
              <Text
                style={
                  styles.emptyCategoryTitle
                }
              >
                Henüz gider kategorisi yok
              </Text>

              <Text
                style={
                  styles.emptyCategoryText
                }
              >
                Önce bir gider kategorisi
                oluşturmalısın.
              </Text>

              <Pressable
                style={
                  styles.categoryManageButton
                }
                onPress={() =>
                  router.push(
                    "/categories"
                  )
                }
              >
                <Text
                  style={
                    styles.categoryManageButtonText
                  }
                >
                  ＋ Kategori Oluştur
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.categories}>
              {expenseCategories.map(
                (item) => {
                  const isSelected =
                    categoryId ===
                    item.id;

                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.categoryButton,
                        isSelected &&
                          styles.activeCategoryButton,
                      ]}
                      onPress={() =>
                        setCategoryId(
                          item.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected &&
                            styles.activeCategoryText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                }
              )}

              <Pressable
                style={
                  styles.addCategoryButton
                }
                onPress={() =>
                  router.push(
                    "/categories"
                  )
                }
              >
                <Text
                  style={
                    styles.addCategoryText
                  }
                >
                  ＋ Kategori Ekle
                </Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>
            Dönem
          </Text>

          <Pressable
            style={styles.periodButton}
            onPress={() =>
              setShowPeriodPicker(
                (current) => !current
              )
            }
          >
            <View>
              <Text style={styles.periodLabel}>
                Bütçe dönemi
              </Text>

              <Text style={styles.periodValue}>
                {months[selectedMonth]}{" "}
                {selectedYear}
              </Text>
            </View>

            <Text style={styles.arrow}>
              {showPeriodPicker
                ? "▲"
                : "▼"}
            </Text>
          </Pressable>

          {showPeriodPicker && (
            <View style={styles.periodPicker}>
              <View style={styles.yearRow}>
                <Pressable
                  style={
                    styles.yearArrowButton
                  }
                  onPress={
                    previousYear
                  }
                >
                  <Text
                    style={
                      styles.yearArrowText
                    }
                  >
                    ‹
                  </Text>
                </Pressable>

                <Text
                  style={styles.yearText}
                >
                  {selectedYear}
                </Text>

                <Pressable
                  style={
                    styles.yearArrowButton
                  }
                  onPress={nextYear}
                >
                  <Text
                    style={
                      styles.yearArrowText
                    }
                  >
                    ›
                  </Text>
                </Pressable>
              </View>

              <View
                style={styles.monthGrid}
              >
                {months.map(
                  (month, index) => {
                    const isSelected =
                      selectedMonth ===
                      index;

                    return (
                      <Pressable
                        key={month}
                        style={[
                          styles.monthButton,
                          isSelected &&
                            styles.activeMonthButton,
                        ]}
                        onPress={() => {
                          setSelectedMonth(
                            index
                          );

                          setShowPeriodPicker(
                            false
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            isSelected &&
                              styles.activeMonthText,
                          ]}
                        >
                          {month}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </View>
          )}

          <Text style={styles.label}>
            Bütçe Limiti
          </Text>

          <View
            style={styles.amountWrapper}
          >
            <TextInput
              value={limit}
              onChangeText={setLimit}
              style={styles.amountInput}
              placeholder="0,00"
              placeholderTextColor="#AEB4BC"
              keyboardType="decimal-pad"
            />

            <Text style={styles.currency}>
              ₺
            </Text>
          </View>

          <View
            style={styles.spentPreview}
          >
            <Text
              style={styles.spentPreviewLabel}
            >
              Bu bütçeye bağlı mevcut
              harcama
            </Text>

            <Text
              style={styles.spentPreviewValue}
            >
              ₺
              {recalculatedSpent.toLocaleString(
                "tr-TR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </Text>
          </View>

          <Pressable
            style={[
              styles.saveButton,
              !isValid &&
                styles.disabledButton,
            ]}
            disabled={!isValid}
            onPress={handleSave}
          >
            <Text
              style={styles.saveButtonText}
            >
              Değişiklikleri Kaydet
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.cancelButtonText}
            >
              Vazgeç
            </Text>
          </Pressable>
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

  scrollContent: {
    paddingBottom: 80,
  },

  container: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    padding: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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

  form: {
    marginTop: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },

  label: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#17202A",
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#F0F2F5",
  },

  activeCategoryButton: {
    backgroundColor: "#22C55E",
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A8492",
  },

  activeCategoryText: {
    color: "#FFFFFF",
  },

  addCategoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7DCE2",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
  },

  addCategoryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyCategoryBox: {
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    padding: 18,
  },

  emptyCategoryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyCategoryText: {
    marginTop: 5,
    fontSize: 13,
    color: "#7A8492",
  },

  categoryManageButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#17202A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  categoryManageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  periodButton: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodLabel: {
    fontSize: 11,
    color: "#7A8492",
  },

  periodValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: "#17202A",
  },

  arrow: {
    fontSize: 14,
    color: "#7A8492",
  },

  periodPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },

  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  yearArrowButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  yearArrowText: {
    fontSize: 25,
    color: "#17202A",
  },

  yearText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17202A",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  monthButton: {
    width: "31%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
  },

  activeMonthButton: {
    backgroundColor: "#22C55E",
  },

  monthText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A8492",
  },

  activeMonthText: {
    color: "#FFFFFF",
  },

  amountWrapper: {
    position: "relative",
  },

  amountInput: {
    height: 62,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingRight: 50,
    fontSize: 26,
    fontWeight: "800",
    color: "#17202A",
  },

  currency: {
    position: "absolute",
    right: 18,
    top: 17,
    fontSize: 22,
    fontWeight: "800",
    color: "#7A8492",
  },

  spentPreview: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E9EDF2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  spentPreviewLabel: {
    fontSize: 12,
    color: "#7A8492",
    flex: 1,
  },

  spentPreviewValue: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  saveButton: {
    height: 56,
    marginTop: 30,
    borderRadius: 16,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelButton: {
    height: 50,
    marginTop: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#7A8492",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 16,
  },

  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#17202A",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});