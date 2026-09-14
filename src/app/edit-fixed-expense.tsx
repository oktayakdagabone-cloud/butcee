import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PaymentIcon } from "react-native-payment-card-icons";

import {
  useFixedExpenses,
  FixedExpenseFrequency,
} from "./context/FixedExpenseContext";
import { useCategories } from "./context/CategoryContext";
import { useAccounts } from "./context/AccountContext";
import { useCards } from "./context/CardContext";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  border: "#E3E7EC",
  green: "#22C55E",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  red: "#DC2626",
};

type PaymentSource = "account" | "card" | "none";

const TROY_LOGO =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Troy-logo-sloganli.png";

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

function BrandLogo({
  network,
  width = 74,
  height = 40,
}: {
  network: string;
  width?: number;
  height?: number;
}) {
  if (network === "visa") {
    return (
      <PaymentIcon
        type="visa"
        variant="flatRounded"
        width={width}
        height={height}
      />
    );
  }

  if (network === "mastercard") {
    return (
      <PaymentIcon
        type="mastercard"
        variant="flatRounded"
        width={width}
        height={height}
      />
    );
  }

  if (network === "amex") {
    return (
      <PaymentIcon
        type="amex"
        variant="flatRounded"
        width={width}
        height={height}
      />
    );
  }

  if (network === "troy") {
    return (
      <Image
        source={{ uri: TROY_LOGO }}
        resizeMode="contain"
        style={{
          width,
          height,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.otherLogo,
        {
          width,
          height,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="credit-card-outline"
        size={24}
        color={COLORS.secondary}
      />
    </View>
  );
}

function MoneyInput({
  integer,
  decimal,
  setInteger,
  setDecimal,
}: {
  integer: string;
  decimal: string;
  setInteger: (value: string) => void;
  setDecimal: (value: string) => void;
}) {
  function formatInteger(value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setInteger("");
      return;
    }

    setInteger(Number(digits).toLocaleString("tr-TR"));
  }

  return (
    <View style={styles.moneyRow}>
      <TextInput
        style={[styles.input, styles.moneyInteger]}
        value={integer}
        onChangeText={formatInteger}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#AEB4BC"
      />

      <Text style={styles.moneyComma}>,</Text>

      <TextInput
        style={[styles.input, styles.moneyDecimal]}
        value={decimal}
        onChangeText={(value) =>
          setDecimal(value.replace(/\D/g, "").slice(0, 2))
        }
        keyboardType="number-pad"
        placeholder="00"
        placeholderTextColor="#AEB4BC"
        maxLength={2}
      />

      <Text style={styles.currency}>₺</Text>
    </View>
  );
}

export default function EditFixedExpenseScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const {
    fixedExpenses,
    updateFixedExpense,
  } = useFixedExpenses();

  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { cards } = useCards();

  const fixedExpense = fixedExpenses.find(
    (item) => item.id === id
  );

  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");

  const [amountInteger, setAmountInteger] =
    useState("");

  const [amountDecimal, setAmountDecimal] =
    useState("");

  const [frequency, setFrequency] =
    useState<FixedExpenseFrequency>("monthly");

  const [paymentDay, setPaymentDay] =
    useState("1");

  const [categoryId, setCategoryId] =
    useState("");

  const [paymentSource, setPaymentSource] =
    useState<PaymentSource>("none");

  const [accountId, setAccountId] =
    useState("");

  const [cardId, setCardId] =
    useState("");

  const [note, setNote] = useState("");

  useEffect(() => {
    if (!fixedExpense || loaded) {
      return;
    }

    const whole = Math.floor(fixedExpense.amount);
    const decimal = Math.round(
      (fixedExpense.amount - whole) * 100
    );

    setName(fixedExpense.name);

    setAmountInteger(
      whole.toLocaleString("tr-TR")
    );

    setAmountDecimal(
      decimal.toString().padStart(2, "0")
    );

    setFrequency(
      fixedExpense.frequency
    );

    setPaymentDay(
      String(fixedExpense.paymentDay)
    );

    setCategoryId(
      fixedExpense.categoryId || ""
    );

    setAccountId(
      fixedExpense.accountId || ""
    );

    setCardId(
      fixedExpense.cardId || ""
    );

    setNote(
      fixedExpense.note || ""
    );

    if (fixedExpense.cardId) {
      setPaymentSource("card");
    } else if (fixedExpense.accountId) {
      setPaymentSource("account");
    } else {
      setPaymentSource("none");
    }

    setLoaded(true);
  }, [fixedExpense, loaded]);

  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.type === "expense"
      ),
    [categories]
  );

  const creditCards = useMemo(
    () =>
      cards.filter(
        (card) => card.type === "credit"
      ),
    [cards]
  );

  const selectedCategory =
    expenseCategories.find(
      (category) =>
        category.id === categoryId
    );

  const selectedAccount =
    accounts.find(
      (account) => account.id === accountId
    );

  const selectedCard =
    creditCards.find(
      (card) => card.id === cardId
    );

  function parseMoney(
    integer: string,
    decimal: string
  ) {
    const whole = Number(
      integer
        .replace(/\./g, "")
        .replace(/,/g, "") || "0"
    );

    return (
      whole +
      Number(decimal || "0") / 100
    );
  }

  function handlePaymentSourceChange(
    source: PaymentSource
  ) {
    setPaymentSource(source);

    if (source !== "account") {
      setAccountId("");
    }

    if (source !== "card") {
      setCardId("");
    }
  }

  async function handleSave() {
    if (!fixedExpense) {
      Alert.alert(
        "Hata",
        "Sabit gider bulunamadı."
      );
      return;
    }

    const trimmedName = name.trim();

    const amount = parseMoney(
      amountInteger,
      amountDecimal
    );

    const day = Number(paymentDay);

    if (!trimmedName) {
      Alert.alert(
        "Eksik bilgi",
        "Sabit gider adı gir."
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      Alert.alert(
        "Eksik bilgi",
        "Geçerli bir gider tutarı gir."
      );
      return;
    }

    if (day < 1 || day > 31) {
      Alert.alert(
        "Hatalı değer",
        "Ödeme günü 1-31 arasında olmalı."
      );
      return;
    }

    if (
      paymentSource === "account" &&
      !accountId
    ) {
      Alert.alert(
        "Eksik bilgi",
        "Ödeme yapılacak hesabı seç."
      );
      return;
    }

    if (
      paymentSource === "card" &&
      !cardId
    ) {
      Alert.alert(
        "Eksik bilgi",
        "Ödeme yapılacak kartı seç."
      );
      return;
    }

    try {
      const success = await updateFixedExpense(
        fixedExpense.id,
        {
          name: trimmedName,
          amount,
          currency: "TRY",
          categoryId:
            selectedCategory?.id,
          categoryName:
            selectedCategory?.name,
          paymentDay: day,
          frequency,
          note:
            note.trim() || undefined,
          accountId:
            paymentSource === "account"
              ? accountId
              : undefined,
          cardId:
            paymentSource === "card"
              ? cardId
              : undefined,
        }
      );

      if (success === false) {
        throw new Error(
          "Sabit gider güncellenemedi."
        );
      }

      router.replace("/fixed-expenses");
    } catch (error) {
      Alert.alert(
        "İşlem başarısız",
        error instanceof Error
          ? error.message
          : "Sabit gider güncellenemedi."
      );
    }
  }

  if (!id || !fixedExpense) {
    return (
      <View style={styles.notFound}>
        <MaterialCommunityIcons
          name="calendar-alert"
          size={46}
          color={COLORS.secondary}
        />

        <Text style={styles.notFoundTitle}>
          Sabit gider bulunamadı
        </Text>

        <Text style={styles.notFoundText}>
          Düzenlemek istediğin kayıt artık mevcut değil.
        </Text>

        <Pressable
          style={styles.backMainButton}
          onPress={() =>
            router.replace(
              "/fixed-expenses"
            )
          }
        >
          <Text
            style={styles.backMainButtonText}
          >
            Sabit Giderlere Dön
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Sabit Gideri Düzenle
          </Text>

          <Text style={styles.subtitle}>
            Sabit gider bilgilerini güncelle.
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

      <View style={styles.card}>
        <View style={styles.editBadge}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color={COLORS.blue}
          />

          <Text style={styles.editBadgeText}>
            Düzenleme modu
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Temel Bilgiler
        </Text>

        <Text style={styles.label}>
          Gider adı
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Örn. Kira"
          placeholderTextColor="#AEB4BC"
        />

        <Text style={styles.label}>
          Tutar
        </Text>

        <MoneyInput
          integer={amountInteger}
          decimal={amountDecimal}
          setInteger={setAmountInteger}
          setDecimal={setAmountDecimal}
        />

        <Text style={styles.sectionTitle}>
          Tekrar Sıklığı
        </Text>

        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              frequency === "monthly" &&
                styles.monthlyActive,
            ]}
            onPress={() =>
              setFrequency("monthly")
            }
          >
            <Text
              style={[
                styles.typeText,
                frequency === "monthly" &&
                  styles.activeTypeText,
              ]}
            >
              Aylık
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              frequency === "yearly" &&
                styles.yearlyActive,
            ]}
            onPress={() =>
              setFrequency("yearly")
            }
          >
            <Text
              style={[
                styles.typeText,
                frequency === "yearly" &&
                  styles.activeTypeText,
              ]}
            >
              Yıllık
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>
          Ödeme günü
        </Text>

        <View style={styles.dayRow}>
          <TextInput
            value={paymentDay}
            onChangeText={(value) =>
              setPaymentDay(
                value
                  .replace(/\D/g, "")
                  .slice(0, 2)
              )
            }
            style={[
              styles.input,
              styles.dayInput,
            ]}
            keyboardType="number-pad"
            maxLength={2}
          />

          <Text style={styles.dayHint}>
            {frequency === "monthly"
              ? "Her ay bu gün ödeme yapılır."
              : "Yılda bir kez bu gün ödeme yapılır."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Kategori
        </Text>

        <View style={styles.categoryGrid}>
          {expenseCategories.map(
            (category) => {
              const selected =
                categoryId === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    setCategoryId(
                      selected
                        ? ""
                        : category.id
                    )
                  }
                  style={[
                    styles.categoryOption,
                    selected &&
                      styles.categoryOptionSelected,
                    {
                      borderColor:
                        selected
                          ? category.color
                          : "#E3E7EC",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          category.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        (category.icon ||
                          "dots-horizontal") as any
                      }
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.categoryName,
                      selected && {
                        color:
                          category.color,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>

                  {selected && (
                    <View
                      style={[
                        styles.categoryCheck,
                        {
                          backgroundColor:
                            category.color,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.checkText
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
        </View>

        <Text style={styles.sectionTitle}>
          Ödeme Kaynağı
        </Text>

        <View style={styles.sourceRow}>
          <Pressable
            style={[
              styles.sourceOption,
              paymentSource === "account" &&
                styles.sourceOptionActive,
            ]}
            onPress={() =>
              handlePaymentSourceChange(
                "account"
              )
            }
          >
            <View
              style={styles.sourceIconBox}
            >
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.sourceText}>
              <Text style={styles.sourceTitle}>
                Hesap
              </Text>

              <Text
                style={styles.sourceSubtitle}
              >
                Banka veya nakit hesabı
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.sourceOption,
              paymentSource === "card" &&
                styles.sourceOptionActive,
            ]}
            onPress={() =>
              handlePaymentSourceChange(
                "card"
              )
            }
          >
            <View
              style={styles.sourceIconBox}
            >
              <MaterialCommunityIcons
                name="credit-card"
                size={24}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.sourceText}>
              <Text style={styles.sourceTitle}>
                Kredi Kartı
              </Text>

              <Text
                style={styles.sourceSubtitle}
              >
                Kart üzerinden ödeme
              </Text>
            </View>
          </Pressable>
        </View>

        {paymentSource === "account" && (
          <>
            <Text style={styles.label}>
              Hesap seç
            </Text>

            <View style={styles.selectionList}>
              {accounts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons
                    name="bank-off"
                    size={24}
                    color={COLORS.secondary}
                  />

                  <Text style={styles.emptyText}>
                    Henüz hesap eklenmemiş.
                  </Text>
                </View>
              ) : (
                accounts.map((account) => {
                  const selected =
                    accountId === account.id;

                  return (
                    <Pressable
                      key={account.id}
                      style={[
                        styles.accountItem,
                        selected &&
                          styles.selectionSelected,
                      ]}
                      onPress={() =>
                        setAccountId(
                          account.id
                        )
                      }
                    >
                      <View
                        style={
                          styles.accountIconBox
                        }
                      >
                        <MaterialCommunityIcons
                          name="bank"
                          size={25}
                          color={COLORS.blue}
                        />
                      </View>

                      <View
                        style={
                          styles.selectionMain
                        }
                      >
                        <Text
                          style={
                            styles.selectionName
                          }
                        >
                          {account.name}
                        </Text>

                        <Text
                          style={
                            styles.selectionDetail
                          }
                        >
                          Bakiye:{" "}
                          {formatMoney(
                            account.balance
                          )}
                        </Text>
                      </View>

                      {selected && (
                        <View
                          style={
                            styles.selectedCheck
                          }
                        >
                          <Text
                            style={
                              styles.checkText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>
          </>
        )}

        {paymentSource === "card" && (
          <>
            <Text style={styles.label}>
              Kart seç
            </Text>

            <View style={styles.selectionList}>
              {creditCards.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons
                    name="credit-card-off-outline"
                    size={24}
                    color={COLORS.secondary}
                  />

                  <Text style={styles.emptyText}>
                    Henüz kredi kartı eklenmemiş.
                  </Text>
                </View>
              ) : (
                creditCards.map((card) => {
                  const selected =
                    cardId === card.id;

                  return (
                    <Pressable
                      key={card.id}
                      style={[
                        styles.cardItem,
                        selected &&
                          styles.selectionSelected,
                      ]}
                      onPress={() =>
                        setCardId(card.id)
                      }
                    >
                      <View
                        style={
                          styles.cardLogoBox
                        }
                      >
                        <BrandLogo
                          network={
                            card.network ??
                            "other"
                          }
                          width={68}
                          height={38}
                        />
                      </View>

                      <View
                        style={
                          styles.selectionMain
                        }
                      >
                        <Text
                          style={
                            styles.selectionName
                          }
                        >
                          {card.name}
                        </Text>

                        <Text
                          style={
                            styles.selectionDetail
                          }
                        >
                          {card.bankName}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.cardLimitArea
                        }
                      >
                        <Text
                          style={
                            styles.cardLimitLabel
                          }
                        >
                          Kullanım
                        </Text>

                        <Text
                          style={
                            styles.cardLimitValue
                          }
                        >
                          {formatMoney(
                            card.usedLimit
                          )}
                        </Text>
                      </View>

                      {selected && (
                        <View
                          style={
                            styles.selectedCheck
                          }
                        >
                          <Text
                            style={
                              styles.checkText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>
          </>
        )}

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
          placeholder="Örn. Her ayın 1'inde otomatik ödeme."
          placeholderTextColor="#AEB4BC"
          multiline
          textAlignVertical="top"
        />

        <View style={styles.summaryBox}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              Sabit Gider Özeti
            </Text>

            <Text style={styles.summaryAmount}>
              {formatMoney(
                parseMoney(
                  amountInteger,
                  amountDecimal
                )
              )}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Tekrar
            </Text>

            <Text style={styles.summaryValue}>
              {frequency === "monthly"
                ? "Aylık"
                : "Yıllık"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Ödeme günü
            </Text>

            <Text style={styles.summaryValue}>
              {paymentDay || "-"}. gün
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Kategori
            </Text>

            <Text style={styles.summaryValue}>
              {selectedCategory?.name ||
                "Belirtilmedi"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Ödeme kaynağı
            </Text>

            <Text style={styles.summaryValue}>
              {selectedAccount
                ? selectedAccount.name
                : selectedCard
                  ? selectedCard.name
                  : "Belirtilmedi"}
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              router.back()
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
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text
              style={styles.saveButtonText}
            >
              Değişiklikleri Kaydet
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
    backgroundColor: COLORS.bg,
  },

  container: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  notFound: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  notFoundTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  notFoundText: {
    marginTop: 6,
    maxWidth: 420,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    color: COLORS.secondary,
  },

  backMainButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.text,
  },

  backMainButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 22,
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

  backButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },

  editBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#EEF6FF",
  },

  editBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.blue,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
  },

  label: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
  },

  moneyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  moneyInteger: {
    flex: 1,
  },

  moneyDecimal: {
    width: 78,
  },

  moneyComma: {
    marginHorizontal: 6,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  currency: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeButton: {
    flex: 1,
    height: 50,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  monthlyActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },

  yearlyActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },

  typeText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  activeTypeText: {
    color: "#FFFFFF",
  },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dayInput: {
    width: 80,
  },

  dayHint: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryOption: {
    width: 145,
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    position: "relative",
  },

  categoryOptionSelected: {
    backgroundColor: "#FAFBFF",
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryName: {
    marginTop: 6,
    maxWidth: 120,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.secondary,
  },

  categoryCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  sourceRow: {
    flexDirection: "row",
    gap: 10,
  },

  sourceOption: {
    flex: 1,
    minHeight: 78,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sourceOptionActive: {
    borderColor: COLORS.blue,
    backgroundColor: "#EEF6FF",
  },

  sourceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sourceText: {
    flex: 1,
  },

  sourceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  sourceSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.secondary,
  },

  selectionList: {
    gap: 9,
  },

  accountItem: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardItem: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  selectionSelected: {
    borderColor: COLORS.blue,
    backgroundColor: "#EEF6FF",
  },

  accountIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardLogoBox: {
    width: 82,
    height: 50,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionMain: {
    flex: 1,
    minWidth: 0,
  },

  selectionName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  selectionDetail: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.secondary,
  },

  cardLimitArea: {
    alignItems: "flex-end",
  },

  cardLimitLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  cardLimitValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.secondary,
  },

  otherLogo: {
    borderRadius: 9,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },

  noteInput: {
    height: 100,
    paddingTop: 14,
  },

  summaryBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E9EEF3",
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  summaryAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.blue,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
  },

  cancelButton: {
    width: 110,
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: COLORS.secondary,
    fontWeight: "800",
  },

  saveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});