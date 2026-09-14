import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  useSubscriptions,
} from "./context/SubscriptionContext";

import { useAccounts } from "./context/AccountContext";
import { useCards } from "./context/CardContext";
import { useCategories } from "./context/CategoryContext";

function formatMoney(
  amount: number,
  currency: string
) {
  const formatted =
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return currency === "TRY"
    ? `₺${formatted}`
    : `${currency} ${formatted}`;
}

function parseAmount(
  integerPart: string,
  decimalPart: string
) {
  const cleanInteger =
    integerPart.replace(/\D/g, "");

  const cleanDecimal =
    decimalPart.replace(/\D/g, "");

  const integerValue =
    Number(cleanInteger || "0");

  const decimalValue =
    Number(
      (cleanDecimal || "0").padEnd(2, "0")
    );

  return (
    integerValue +
    decimalValue / 100
  );
}

function formatIntegerInput(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat(
    "tr-TR"
  ).format(Number(digits));
}

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const {
    subscriptions,
    updateSubscription,
  } = useSubscriptions();

  const { accounts } = useAccounts();
  const { cards } = useCards();
  const { categories } = useCategories();

  const subscription =
    subscriptions.find(
      (item) => item.id === id
    );

  const expenseCategories =
    useMemo(
      () =>
        categories.filter(
          (item) =>
            item.type === "expense"
        ),
      [categories]
    );

  const initialInteger =
    subscription
      ? Math.floor(
          subscription.amount
        ).toString()
      : "";

  const initialDecimal =
    subscription
      ? Math.round(
          (subscription.amount -
            Math.floor(
              subscription.amount
            )) *
            100
        )
          .toString()
          .padStart(2, "0")
      : "";

  const [name, setName] =
    useState(
      subscription?.name || ""
    );

  const [integerPart, setIntegerPart] =
    useState(
      subscription
        ? formatIntegerInput(
            initialInteger
          )
        : ""
    );

  const [decimalPart, setDecimalPart] =
    useState(initialDecimal);

  const [currency, setCurrency] =
    useState(
      subscription?.currency || "TRY"
    );

  const [paymentDay, setPaymentDay] =
    useState(
      subscription?.paymentDay || 1
    );

  const [categoryId, setCategoryId] =
    useState(
      subscription?.categoryId || ""
    );

  const [paymentSource, setPaymentSource] =
    useState<
      "account" | "card"
    >(
      subscription?.paymentSource ||
        "account"
    );

  const [accountId, setAccountId] =
    useState(
      subscription?.accountId || ""
    );

  const [cardId, setCardId] =
    useState(
      subscription?.cardId || ""
    );

  const [note, setNote] =
    useState(
      subscription?.note || ""
    );

  const [error, setError] =
    useState("");

  if (!subscription) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>
          Abonelik bulunamadı
        </Text>

        <Text style={styles.notFoundText}>
          Düzenlemek istediğin abonelik
          mevcut değil.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.replace(
              "/subscriptions"
            )
          }
        >
          <Text
            style={styles.backButtonText}
          >
            Aboneliklere Dön
          </Text>
        </Pressable>
      </View>
    );
  }

  const amount = parseAmount(
    integerPart,
    decimalPart
  );

  const selectedCategory =
    expenseCategories.find(
      (item) =>
        item.id === categoryId
    );

  const paymentDays = Array.from(
    { length: 31 },
    (_, index) => index + 1
  );

  function save() {
    setError("");

    if (!subscription) {
      return;
    }

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Abonelik adını gir."
      );
      return;
    }

    if (amount <= 0) {
      setError(
        "Geçerli bir abonelik tutarı gir."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Bir gider kategorisi seç."
      );
      return;
    }

    if (
      paymentSource === "account" &&
      !accountId
    ) {
      setError(
        "Ödeme yapılacak hesabı seç."
      );
      return;
    }

    if (
      paymentSource === "card" &&
      !cardId
    ) {
      setError(
        "Ödeme yapılacak kartı seç."
      );
      return;
    }

    try {
      updateSubscription(
        subscription.id,
        {
          name: trimmedName,
          amount,
          currency,
          paymentDay,
          categoryId,
          categoryName:
            selectedCategory?.name ||
            "",
          paymentSource,
          accountId:
            paymentSource ===
            "account"
              ? accountId
              : undefined,
          cardId:
            paymentSource === "card"
              ? cardId
              : undefined,
          note: note.trim(),
          active:
            subscription.active,
        }
      );

      router.replace(
        "/subscriptions"
      );
    } catch (saveError) {
      console.error(
        "Abonelik güncellenemedi:",
        saveError
      );

      setError(
        "Abonelik güncellenirken bir hata oluştu."
      );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.topRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Aboneliği Düzenle
          </Text>

          <Text style={styles.subtitle}>
            Abonelik bilgilerini güncelle.
          </Text>
        </View>

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

      {error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>
            !
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Abonelik Bilgileri
        </Text>

        <Text style={styles.fieldLabel}>
          ABONELİK ADI
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError("");
          }}
          placeholder="Örn. Netflix"
          placeholderTextColor="#A0A8B3"
        />

        <Text
          style={[
            styles.fieldLabel,
            styles.secondField,
          ]}
        >
          AYLIK TUTAR
        </Text>

        <View style={styles.moneyRow}>
          <View
            style={
              styles.moneyIntegerBox
            }
          >
            <TextInput
              style={styles.moneyInput}
              value={integerPart}
              onChangeText={(value) =>
                setIntegerPart(
                  formatIntegerInput(
                    value
                  )
                )
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#A0A8B3"
            />
          </View>

          <Text
            style={styles.moneySeparator}
          >
            ,
          </Text>

          <View
            style={
              styles.moneyDecimalBox
            }
          >
            <TextInput
              style={styles.moneyInput}
              value={decimalPart}
              onChangeText={(value) =>
                setDecimalPart(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 2)
                )
              }
              keyboardType="numeric"
              placeholder="00"
              placeholderTextColor="#A0A8B3"
              maxLength={2}
            />
          </View>

          <Text
            style={styles.currencyPreview}
          >
            {currency === "TRY"
              ? "₺"
              : currency}
          </Text>
        </View>

        <Text style={styles.previewText}>
          {formatMoney(
            amount,
            currency
          )}
        </Text>

        <Text
          style={[
            styles.fieldLabel,
            styles.secondField,
          ]}
        >
          PARA BİRİMİ
        </Text>

        <View style={styles.optionRow}>
          {["TRY", "USD", "EUR"].map(
            (item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionButton,
                  currency === item &&
                    styles.selectedOption,
                ]}
                onPress={() => {
                  setCurrency(item);
                  setError("");
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    currency === item &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item === "TRY"
                    ? "₺ TRY"
                    : item}
                </Text>
              </Pressable>
            )
          )}
        </View>

        <Text
          style={[
            styles.fieldLabel,
            styles.secondField,
          ]}
        >
          KATEGORİ
        </Text>

        <View style={styles.categoryGrid}>
          {expenseCategories.map(
            (category) => {
              const selected =
                category.id ===
                categoryId;

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selected &&
                      styles.selectedCategory,
                    {
                      borderColor:
                        selected
                          ? category.color
                          : "#E5E9EE",
                    },
                  ]}
                  onPress={() => {
                    setCategoryId(
                      category.id
                    );
                    setError("");
                  }}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          `${category.color}20`,
                      },
                    ]}
                  >
                    <Text>
                      {category.icon}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Ödeme Günü
        </Text>

        <Text style={styles.helpText}>
          Her ay hangi gün ödeme yapılacağını
          seç.
        </Text>

        <View style={styles.dayGrid}>
          {paymentDays.map((day) => (
            <Pressable
              key={day}
              style={[
                styles.dayButton,
                paymentDay === day &&
                  styles.selectedDay,
              ]}
              onPress={() =>
                setPaymentDay(day)
              }
            >
              <Text
                style={[
                  styles.dayText,
                  paymentDay === day &&
                    styles.selectedDayText,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={styles.selectedDayInfo}
        >
          <Text
            style={
              styles.selectedDayInfoText
            }
          >
            Her ayın {paymentDay}'i
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Ödeme Kaynağı
        </Text>

        <View style={styles.sourceRow}>
          <Pressable
            style={[
              styles.sourceButton,
              paymentSource ===
                "account" &&
                styles.selectedSource,
            ]}
            onPress={() => {
              setPaymentSource(
                "account"
              );
              setCardId("");
              setError("");
            }}
          >
            <Text style={styles.sourceIcon}>
              🏦
            </Text>

            <View>
              <Text
                style={[
                  styles.sourceTitle,
                  paymentSource ===
                    "account" &&
                    styles.selectedSourceText,
                ]}
              >
                Banka / Hesap
              </Text>

              <Text
                style={
                  styles.sourceSubtitle
                }
              >
                Hesaptan ödeme
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.sourceButton,
              paymentSource === "card" &&
                styles.selectedSource,
            ]}
            onPress={() => {
              setPaymentSource("card");
              setAccountId("");
              setError("");
            }}
          >
            <Text style={styles.sourceIcon}>
              💳
            </Text>

            <View>
              <Text
                style={[
                  styles.sourceTitle,
                  paymentSource ===
                    "card" &&
                    styles.selectedSourceText,
                ]}
              >
                Kredi Kartı
              </Text>

              <Text
                style={
                  styles.sourceSubtitle
                }
              >
                Karttan ödeme
              </Text>
            </View>
          </Pressable>
        </View>

        {paymentSource ===
        "account" ? (
          <>
            <Text
              style={[
                styles.fieldLabel,
                styles.secondField,
              ]}
            >
              HESAP SEÇ
            </Text>

            {accounts.length === 0 ? (
              <View
                style={
                  styles.emptySourceBox
                }
              >
                <Text
                  style={
                    styles.emptySourceText
                  }
                >
                  Henüz hesabın yok.
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.sourceList
                }
              >
                {accounts.map(
                  (account) => {
                    const selected =
                      account.id ===
                      accountId;

                    return (
                      <Pressable
                        key={
                          account.id
                        }
                        style={[
                          styles.listButton,
                          selected &&
                            styles.selectedListButton,
                        ]}
                        onPress={() => {
                          setAccountId(
                            account.id
                          );
                          setError("");
                        }}
                      >
                        <View>
                          <Text
                            style={[
                              styles.listTitle,
                              selected &&
                                styles.selectedListText,
                            ]}
                          >
                            {account.name}
                          </Text>

                          <Text
                            style={
                              styles.listSubtitle
                            }
                          >
                            Bakiye: ₺
                            {new Intl.NumberFormat(
                              "tr-TR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            ).format(
                              account.balance
                            )}
                          </Text>
                        </View>

                        {selected && (
                          <Text
                            style={
                              styles.checkText
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    );
                  }
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <Text
              style={[
                styles.fieldLabel,
                styles.secondField,
              ]}
            >
              KART SEÇ
            </Text>

            {cards.length === 0 ? (
              <View
                style={
                  styles.emptySourceBox
                }
              >
                <Text
                  style={
                    styles.emptySourceText
                  }
                >
                  Henüz kartın yok.
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.sourceList
                }
              >
                {cards.map((card) => {
                  const selected =
                    card.id === cardId;

                  return (
                    <Pressable
                      key={card.id}
                      style={[
                        styles.listButton,
                        selected &&
                          styles.selectedListButton,
                      ]}
                      onPress={() => {
                        setCardId(
                          card.id
                        );
                        setError("");
                      }}
                    >
                      <View>
                        <Text
                          style={[
                            styles.listTitle,
                            selected &&
                              styles.selectedListText,
                          ]}
                        >
                          {card.name}
                        </Text>

                        <Text
                          style={
                            styles.listSubtitle
                          }
                        >
                          {card.bankName}
                        </Text>
                      </View>

                      {selected && (
                        <Text
                          style={
                            styles.checkText
                          }
                        >
                          ✓
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Not
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.noteInput,
          ]}
          value={note}
          onChangeText={setNote}
          placeholder="İsteğe bağlı not..."
          placeholderTextColor="#A0A8B3"
          multiline
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={save}
      >
        <Text
          style={styles.saveButtonText}
        >
          ✓ Değişiklikleri Kaydet
        </Text>
      </Pressable>
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
    maxWidth: 900,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    gap: 20,
  },

  headerText: {
    flex: 1,
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

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#596575",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },

  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontWeight: "900",
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#BE123C",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7A8492",
    marginBottom: 8,
  },

  secondField: {
    marginTop: 20,
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E9EE",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#17202A",
  },

  moneyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  moneyIntegerBox: {
    flex: 1,
  },

  moneyDecimalBox: {
    width: 85,
  },

  moneyInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E9EE",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#17202A",
    textAlign: "right",
  },

  moneySeparator: {
    fontSize: 22,
    fontWeight: "800",
    color: "#7A8492",
  },

  currencyPreview: {
    minWidth: 30,
    fontSize: 18,
    fontWeight: "800",
    color: "#17202A",
  },

  previewText: {
    marginTop: 8,
    fontSize: 12,
    color: "#7A8492",
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  selectedOption: {
    backgroundColor: "#EEF4FF",
    borderColor: "#3B82F6",
  },

  optionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#596575",
  },

  selectedOptionText: {
    color: "#3B82F6",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  categoryButton: {
    minWidth: 125,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
  },

  selectedCategory: {
    backgroundColor: "#F7F8FA",
  },

  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#596575",
  },

  selectedCategoryText: {
    color: "#17202A",
  },

  helpText: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 12,
    color: "#7A8492",
  },

  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  selectedDay: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  dayText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#596575",
  },

  selectedDayText: {
    color: "#FFFFFF",
  },

  selectedDayInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#EEF4FF",
  },

  selectedDayInfoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
    textAlign: "center",
  },

  sourceRow: {
    flexDirection: "row",
    gap: 10,
  },

  sourceButton: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
  },

  selectedSource: {
    backgroundColor: "#EEF4FF",
    borderColor: "#3B82F6",
  },

  sourceIcon: {
    fontSize: 22,
  },

  sourceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
  },

  selectedSourceText: {
    color: "#3B82F6",
  },

  sourceSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#7A8492",
  },

  sourceList: {
    gap: 8,
  },

  listButton: {
    minHeight: 64,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedListButton: {
    backgroundColor: "#EEF4FF",
    borderColor: "#3B82F6",
  },

  listTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  listSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#7A8492",
  },

  selectedListText: {
    color: "#3B82F6",
  },

  checkText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#3B82F6",
  },

  emptySourceBox: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
  },

  emptySourceText: {
    fontSize: 13,
    color: "#7A8492",
    textAlign: "center",
  },

  noteInput: {
    height: 100,
    paddingTop: 14,
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F7F8FA",
  },

  notFoundTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#17202A",
  },

  notFoundText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7A8492",
    textAlign: "center",
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#3B82F6",
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
