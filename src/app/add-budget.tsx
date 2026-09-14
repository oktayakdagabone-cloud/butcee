import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useBudgets } from "./context/BudgetContext";
import { useCategories } from "./context/CategoryContext";

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

function formatIntegerInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("tr-TR");
}

export default function AddBudgetScreen() {
  const { addBudget } = useBudgets();

  const { getCategoriesByType } =
    useCategories();

  const expenseCategories =
    getCategoriesByType("expense");

  const now = new Date();

  const [selectedMonth, setSelectedMonth] =
    useState(now.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(now.getFullYear());

  const [
    showPeriodPicker,
    setShowPeriodPicker,
  ] = useState(false);

  const [integerLimit, setIntegerLimit] =
    useState("");

  const [decimalLimit, setDecimalLimit] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const selectedCategory =
    expenseCategories.find(
      (category) =>
        category.id === categoryId
    );

  const numericIntegerLimit = Number(
    integerLimit.replace(/\./g, "")
  );

  const numericDecimalLimit = Number(
    decimalLimit.replace(/\D/g, "")
  );

  const numericLimit =
    numericIntegerLimit +
    numericDecimalLimit / 100;

  const isValid =
    categoryId !== "" &&
    numericLimit > 0;

  function handleIntegerChange(
    value: string
  ) {
    setIntegerLimit(
      formatIntegerInput(value)
    );
  }

  function handleDecimalChange(
    value: string
  ) {
    const digits =
      value.replace(/\D/g, "");

    setDecimalLimit(
      digits.slice(0, 2)
    );
  }

  function handleSave() {
    if (
      !isValid ||
      !selectedCategory
    ) {
      return;
    }

    addBudget({
      category:
        selectedCategory.name,
      categoryId:
        selectedCategory.id,
      month: `${months[selectedMonth]} ${selectedYear}`,
      limit: numericLimit,
      spent: 0,
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
              Bütçe Ekle
            </Text>

            <Text style={styles.subtitle}>
              Bir kategori için aylık
              harcama limiti belirle.
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

                  const iconColor =
                    item.color ||
                    "#3B82F6";

                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.categoryButton,
                        {
                          borderColor:
                            iconColor,
                        },
                        isSelected && {
                          backgroundColor:
                            iconColor,
                        },
                      ]}
                      onPress={() =>
                        setCategoryId(
                          item.id
                        )
                      }
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor:
                              isSelected
                                ? "#FFFFFF"
                                : iconColor,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            (item.icon ||
                              "dots-horizontal") as any
                          }
                          size={19}
                          color={
                            isSelected
                              ? iconColor
                              : "#FFFFFF"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color:
                              isSelected
                                ? "#FFFFFF"
                                : "#17202A",
                          },
                        ]}
                      >
                        {item.name}
                      </Text>

                      {isSelected && (
                        <View
                          style={
                            styles.selectedCheck
                          }
                        >
                          <Text
                            style={
                              styles.selectedCheckText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      )}
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

          {selectedCategory && (
            <View
              style={[
                styles.selectedCategoryPreview,
                {
                  borderColor:
                    selectedCategory.color ||
                    "#3B82F6",
                },
              ]}
            >
              <View
                style={[
                  styles.previewIcon,
                  {
                    backgroundColor:
                      selectedCategory.color ||
                      "#3B82F6",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    (selectedCategory.icon ||
                      "dots-horizontal") as any
                  }
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.previewText
                }
              >
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  Seçilen kategori
                </Text>

                <Text
                  style={
                    styles.previewName
                  }
                >
                  {selectedCategory.name}
                </Text>
              </View>
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

          <View style={styles.amountRow}>
            <View
              style={
                styles.integerAmountWrapper
              }
            >
              <TextInput
                value={integerLimit}
                onChangeText={
                  handleIntegerChange
                }
                style={
                  styles.integerAmountInput
                }
                placeholder="0"
                placeholderTextColor="#AEB4BC"
                keyboardType="number-pad"
              />

              <Text
                style={styles.inputCurrency}
              >
                ₺
              </Text>
            </View>

            <Text
              style={styles.decimalSeparator}
            >
              ,
            </Text>

            <TextInput
              value={decimalLimit}
              onChangeText={
                handleDecimalChange
              }
              style={styles.decimalInput}
              placeholder="00"
              placeholderTextColor="#AEB4BC"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <Text style={styles.amountHint}>
            Örnek: 100000 + 50 =
            100.000,50 ₺
          </Text>

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
              Bütçeyi Kaydet
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

  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7EC",
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
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
    minHeight: 48,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "800",
  },

  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  selectedCheckText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  addCategoryButton: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7DCE2",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },

  addCategoryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
  },

  selectedCategoryPreview: {
    marginTop: 14,
    minHeight: 60,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#FFFFFF",
  },

  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  previewText: {
    flex: 1,
  },

  previewLabel: {
    fontSize: 11,
    color: "#7A8492",
  },

  previewName: {
    marginTop: 2,
    fontSize: 14,
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

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  integerAmountWrapper: {
    flex: 1,
    position: "relative",
  },

  integerAmountInput: {
    height: 64,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingRight: 48,
    fontSize: 25,
    fontWeight: "800",
    color: "#17202A",
  },

  inputCurrency: {
    position: "absolute",
    right: 17,
    top: 18,
    fontSize: 20,
    fontWeight: "800",
    color: "#7A8492",
  },

  decimalSeparator: {
    marginHorizontal: 7,
    fontSize: 25,
    fontWeight: "800",
    color: "#17202A",
  },

  decimalInput: {
    width: 72,
    height: 64,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 23,
    fontWeight: "800",
    color: "#17202A",
  },

  amountHint: {
    marginTop: 7,
    fontSize: 12,
    color: "#7A8492",
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
});