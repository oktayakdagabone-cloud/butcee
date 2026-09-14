import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  useTransactions,
  TransactionType,
  PaymentSource,
} from "../context/TransactionContext";

import { useAccounts } from "../context/AccountContext";
import { useCards } from "../context/CardContext";
import { useCategories } from "../context/CategoryContext";

function formatIntegerInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("tr-TR");
}

function formatMoney(amount: number) {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function EditTransactionScreen() {
  const params = useLocalSearchParams<{
    id?: string;
  }>();

  const transactionId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const {
    transactions,
    updateTransaction,
  } = useTransactions();

  const { accounts } = useAccounts();
  const { cards } = useCards();
  const { getCategoriesByType } =
    useCategories();

  const transaction =
    transactions.find(
      (item) => item.id === transactionId
    );

  const [type, setType] =
    useState<TransactionType>("expense");

  const [
    integerAmount,
    setIntegerAmount,
  ] = useState("");

  const [
    decimalAmount,
    setDecimalAmount,
  ] = useState("");

  const [description, setDescription] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [accountId, setAccountId] =
    useState("");

  const [cardId, setCardId] =
    useState("");

  const [
    paymentSource,
    setPaymentSource,
  ] = useState<PaymentSource>("account");

  const [initialized, setInitialized] =
    useState(false);

  useEffect(() => {
    if (!transaction || initialized) {
      return;
    }

    setType(transaction.type);

    const integerPart = Math.floor(
      transaction.amount
    );

    const decimalPart = Math.round(
      (transaction.amount -
        integerPart) *
        100
    );

    setIntegerAmount(
      formatIntegerInput(
        integerPart.toString()
      )
    );

    setDecimalAmount(
      decimalPart
        .toString()
        .padStart(2, "0")
    );

    setDescription(
      transaction.description
    );

    setCategoryId(
      transaction.categoryId
    );

    setAccountId(
      transaction.accountId || ""
    );

    setCardId(
      transaction.cardId || ""
    );

    setPaymentSource(
      transaction.type === "expense"
        ? transaction.paymentSource ||
            (transaction.cardId
              ? "card"
              : "account")
        : "account"
    );

    setInitialized(true);
  }, [transaction, initialized]);

  const categories =
    getCategoriesByType(type);

  const selectedCategory =
    categories.find(
      (category) =>
        category.id === categoryId
    );

  const selectedCard =
    cards.find(
      (card) =>
        card.id === cardId
    );

  const numericIntegerAmount = Number(
    integerAmount.replace(/\./g, "")
  );

  const numericDecimalAmount = Number(
    decimalAmount.replace(/\D/g, "")
  );

  const numericAmount =
    numericIntegerAmount +
    numericDecimalAmount / 100;

  const isValidSource =
    type === "income"
      ? accountId !== ""
      : paymentSource === "account"
      ? accountId !== ""
      : cardId !== "";

  const isValid =
    !!transaction &&
    numericAmount > 0 &&
    description.trim() !== "" &&
    categoryId !== "" &&
    isValidSource;

  function handleIntegerChange(
    value: string
  ) {
    setIntegerAmount(
      formatIntegerInput(value)
    );
  }

  function handleDecimalChange(
    value: string
  ) {
    const digits =
      value.replace(/\D/g, "");

    setDecimalAmount(
      digits.slice(0, 2)
    );
  }

  function handleTypeChange(
    newType: TransactionType
  ) {
    setType(newType);
    setCategoryId("");

    if (newType === "income") {
      setPaymentSource("account");
      setCardId("");

      return;
    }

    setPaymentSource("account");
    setCardId("");
  }

  function handlePaymentSourceChange(
    source: PaymentSource
  ) {
    setPaymentSource(source);

    if (source === "account") {
      setCardId("");
    } else {
      setAccountId("");
    }
  }

  function handleSave() {
    if (!transaction || !isValid) {
      return;
    }

    updateTransaction(
      transaction.id,
      {
        type,
        amount: numericAmount,
        description:
          description.trim(),
        categoryId,
        categoryName:
          selectedCategory?.name ??
          "",

        accountId:
          type === "income" ||
          paymentSource === "account"
            ? accountId
            : "",

        paymentSource:
          type === "income"
            ? "account"
            : paymentSource,

        cardId:
          type === "expense" &&
          paymentSource === "card"
            ? cardId
            : undefined,
      }
    );

    router.replace("/explore");
  }

  if (!transaction) {
    return (
      <View style={styles.notFoundScreen}>
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>
            İşlem bulunamadı
          </Text>

          <Text style={styles.notFoundText}>
            Düzenlemek istediğin işlem artık
            mevcut değil.
          </Text>

          <Pressable
            style={styles.backToTransactionsButton}
            onPress={() =>
              router.replace("/explore")
            }
          >
            <Text
              style={
                styles.backToTransactionsText
              }
            >
              İşlemlere Dön
            </Text>
          </Pressable>
        </View>
      </View>
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
              İşlemi Düzenle
            </Text>

            <Text style={styles.subtitle}>
              İşlem bilgilerini güncelle.
            </Text>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
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
            İşlem Türü
          </Text>

          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                type === "income" &&
                  styles.activeIncomeButton,
              ]}
              onPress={() =>
                handleTypeChange(
                  "income"
                )
              }
            >
              <Text
                style={[
                  styles.typeText,
                  type === "income" &&
                    styles.activeTypeText,
                ]}
              >
                Gelir
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeButton,
                type === "expense" &&
                  styles.activeExpenseButton,
              ]}
              onPress={() =>
                handleTypeChange(
                  "expense"
                )
              }
            >
              <Text
                style={[
                  styles.typeText,
                  type === "expense" &&
                    styles.activeTypeText,
                ]}
              >
                Gider
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>
            Tutar
          </Text>

          <View style={styles.amountRow}>
            <View
              style={
                styles.integerAmountWrapper
              }
            >
              <TextInput
                value={integerAmount}
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
              style={
                styles.decimalSeparator
              }
            >
              ,
            </Text>

            <TextInput
              value={decimalAmount}
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

          <Text style={styles.label}>
            Açıklama
          </Text>

          <TextInput
            value={description}
            onChangeText={
              setDescription
            }
            style={styles.input}
            placeholder="Örn. Market alışverişi"
            placeholderTextColor="#AEB4BC"
          />

          <Text style={styles.label}>
            Kategori
          </Text>

          {categories.length === 0 ? (
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
                Henüz kategori yok
              </Text>

              <Text
                style={
                  styles.emptyCategoryText
                }
              >
                Bu işlem türü için önce bir
                kategori oluştur.
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
              {categories.map(
                (category) => {
                  const isSelected =
                    categoryId ===
                    category.id;

                  const categoryColor =
                    category.color ||
                    "#3B82F6";

                  return (
                    <Pressable
                      key={
                        category.id
                      }
                      style={[
                        styles.categoryButton,
                        {
                          borderColor:
                            categoryColor,
                        },
                        isSelected && {
                          backgroundColor:
                            categoryColor,
                        },
                      ]}
                      onPress={() =>
                        setCategoryId(
                          category.id
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
                                : categoryColor,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            (category.icon ||
                              "dots-horizontal") as any
                          }
                          size={19}
                          color={
                            isSelected
                              ? categoryColor
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
                        {
                          category.name
                        }
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
                style={styles.previewText}
              >
                <Text
                  style={styles.previewLabel}
                >
                  Seçilen kategori
                </Text>

                <Text
                  style={styles.previewName}
                >
                  {
                    selectedCategory.name
                  }
                </Text>
              </View>
            </View>
          )}

          {type === "income" ? (
            <>
              <Text style={styles.label}>
                Hesap
              </Text>

              {accounts.length === 0 ? (
                <View
                  style={
                    styles.emptyAccountBox
                  }
                >
                  <Text
                    style={
                      styles.emptyAccountTitle
                    }
                  >
                    Henüz hesap yok
                  </Text>

                  <Text
                    style={
                      styles.emptyAccountText
                    }
                  >
                    Gelir işlemini düzenlemek
                    için önce bir hesap
                    oluşturmalısın.
                  </Text>

                  <Pressable
                    style={
                      styles.accountManageButton
                    }
                    onPress={() =>
                      router.push(
                        "/accounts"
                      )
                    }
                  >
                    <Text
                      style={
                        styles.accountManageButtonText
                      }
                    >
                      ＋ Hesap Oluştur
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  style={styles.accounts}
                >
                  {accounts.map(
                    (account) => {
                      const isSelected =
                        accountId ===
                        account.id;

                      return (
                        <Pressable
                          key={
                            account.id
                          }
                          style={[
                            styles.accountButton,
                            isSelected &&
                              styles.activeAccountButton,
                          ]}
                          onPress={() =>
                            setAccountId(
                              account.id
                            )
                          }
                        >
                          <View
                            style={
                              styles.accountIcon
                            }
                          >
                            <MaterialCommunityIcons
                              name="bank"
                              size={20}
                              color="#3B82F6"
                            />
                          </View>

                          <View
                            style={
                              styles.accountInfo
                            }
                          >
                            <Text
                              style={
                                styles.accountName
                              }
                            >
                              {
                                account.name
                              }
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

                          <Text
                            style={
                              styles.accountBalance
                            }
                          >
                            {formatMoney(
                              account.balance
                            )}{" "}
                            ₺
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>
                Ödeme Kaynağı
              </Text>

              <View
                style={
                  styles.sourceTypeRow
                }
              >
                <Pressable
                  style={[
                    styles.sourceTypeButton,
                    paymentSource ===
                      "account" &&
                      styles.activeSourceAccount,
                  ]}
                  onPress={() =>
                    handlePaymentSourceChange(
                      "account"
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="bank"
                    size={20}
                    color={
                      paymentSource ===
                      "account"
                        ? "#FFFFFF"
                        : "#3B82F6"
                    }
                  />

                  <Text
                    style={[
                      styles.sourceTypeText,
                      paymentSource ===
                        "account" &&
                        styles.activeSourceText,
                    ]}
                  >
                    Hesap
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sourceTypeButton,
                    paymentSource ===
                      "card" &&
                      styles.activeSourceCard,
                  ]}
                  onPress={() =>
                    handlePaymentSourceChange(
                      "card"
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={20}
                    color={
                      paymentSource ===
                      "card"
                        ? "#FFFFFF"
                        : "#8B5CF6"
                    }
                  />

                  <Text
                    style={[
                      styles.sourceTypeText,
                      paymentSource ===
                        "card" &&
                        styles.activeSourceText,
                    ]}
                  >
                    Kart
                  </Text>
                </Pressable>
              </View>

              {paymentSource ===
              "account" ? (
                <>
                  {accounts.length ===
                  0 ? (
                    <View
                      style={
                        styles.emptyAccountBox
                      }
                    >
                      <Text
                        style={
                          styles.emptyAccountTitle
                        }
                      >
                        Henüz hesap yok
                      </Text>

                      <Text
                        style={
                          styles.emptyAccountText
                        }
                      >
                        Gider işlemini düzenlemek
                        için önce bir hesap
                        oluşturmalısın.
                      </Text>

                      <Pressable
                        style={
                          styles.accountManageButton
                        }
                        onPress={() =>
                          router.push(
                            "/accounts"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.accountManageButtonText
                          }
                        >
                          ＋ Hesap Oluştur
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View
                      style={
                        styles.accounts
                      }
                    >
                      {accounts.map(
                        (account) => {
                          const isSelected =
                            accountId ===
                            account.id;

                          return (
                            <Pressable
                              key={
                                account.id
                              }
                              style={[
                                styles.accountButton,
                                isSelected &&
                                  styles.activeAccountButton,
                              ]}
                              onPress={() =>
                                setAccountId(
                                  account.id
                                )
                              }
                            >
                              <View
                                style={
                                  styles.accountIcon
                                }
                              >
                                <MaterialCommunityIcons
                                  name="bank"
                                  size={20}
                                  color="#3B82F6"
                                />
                              </View>

                              <View
                                style={
                                  styles.accountInfo
                                }
                              >
                                <Text
                                  style={
                                    styles.accountName
                                  }
                                >
                                  {
                                    account.name
                                  }
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

                              <Text
                                style={
                                  styles.accountBalance
                                }
                              >
                                {formatMoney(
                                  account.balance
                                )}{" "}
                                ₺
                              </Text>
                            </Pressable>
                          );
                        }
                      )}
                    </View>
                  )}
                </>
              ) : (
                <>
                  {cards.length === 0 ? (
                    <View
                      style={
                        styles.emptyAccountBox
                      }
                    >
                      <Text
                        style={
                          styles.emptyAccountTitle
                        }
                      >
                        Henüz kart yok
                      </Text>

                      <Text
                        style={
                          styles.emptyAccountText
                        }
                      >
                        Gider işlemini kartla
                        düzenlemek için önce
                        bir kart oluşturmalısın.
                      </Text>

                      <Pressable
                        style={
                          styles.cardManageButton
                        }
                        onPress={() =>
                          router.push(
                            "/add-card"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.cardManageButtonText
                          }
                        >
                          ＋ Kart Oluştur
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View
                      style={styles.cards}
                    >
                      {cards.map((card) => {
                        const isSelected =
                          cardId ===
                          card.id;

                        const available =
                          Math.max(
                            card.limit -
                              card.usedLimit,
                            0
                          );

                        return (
                          <Pressable
                            key={
                              card.id
                            }
                            style={[
                              styles.cardButton,
                              {
                                borderColor:
                                  card.color ||
                                  "#8B5CF6",
                              },
                              isSelected && {
                                backgroundColor:
                                  `${
                                    card.color ||
                                    "#8B5CF6"
                                  }12`,
                                borderWidth: 2,
                              },
                            ]}
                            onPress={() =>
                              setCardId(
                                card.id
                              )
                            }
                          >
                            <View
                              style={[
                                styles.cardColorIcon,
                                {
                                  backgroundColor:
                                    card.color ||
                                    "#8B5CF6",
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
                                styles.cardInfo
                              }
                            >
                              <Text
                                style={
                                  styles.cardName
                                }
                              >
                                {
                                  card.name
                                }
                              </Text>

                              <Text
                                style={
                                  styles.cardBank
                                }
                              >
                                {
                                  card.bankName
                                }{" "}
                                •{" "}
                                {card.type ===
                                "credit"
                                  ? "Kredi Kartı"
                                  : "Banka Kartı"}
                              </Text>

                              <Text
                                style={
                                  styles.cardLimitText
                                }
                              >
                                Kullanılan:{" "}
                                {formatMoney(
                                  card.usedLimit
                                )}{" "}
                                ₺
                                {"  •  "}
                                Kalan:{" "}
                                {formatMoney(
                                  available
                                )}{" "}
                                ₺
                              </Text>
                            </View>

                            {isSelected && (
                              <View
                                style={
                                  styles.cardSelectedCheck
                                }
                              >
                                <Text
                                  style={
                                    styles.cardSelectedCheckText
                                  }
                                >
                                  ✓
                                </Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {type === "expense" &&
            paymentSource === "card" &&
            selectedCard && (
              <View
                style={[
                  styles.selectedCardPreview,
                  {
                    borderColor:
                      selectedCard.color ||
                      "#8B5CF6",
                  },
                ]}
              >
                <View
                  style={[
                    styles.selectedCardIcon,
                    {
                      backgroundColor:
                        selectedCard.color ||
                        "#8B5CF6",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedCard.type ===
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
                    styles.selectedCardText
                  }
                >
                  <Text
                    style={
                      styles.selectedCardLabel
                    }
                  >
                    Seçilen kart
                  </Text>

                  <Text
                    style={
                      styles.selectedCardName
                    }
                  >
                    {
                      selectedCard.name
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.selectedCardAvailable
                  }
                >
                  Kalan{"\n"}
                  {formatMoney(
                    Math.max(
                      selectedCard.limit -
                        selectedCard.usedLimit,
                      0
                    )
                  )}{" "}
                  ₺
                </Text>
              </View>
            )}

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
            onPress={() => router.back()}
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
    maxWidth: 760,
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

  typeRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  activeIncomeButton: {
    backgroundColor: "#22C55E",
  },

  activeExpenseButton: {
    backgroundColor: "#FF8A3D",
  },

  typeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A8492",
  },

  activeTypeText: {
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

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
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
    backgroundColor:
      "rgba(255,255,255,0.25)",
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

  accounts: {
    gap: 8,
  },

  accountButton: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  activeAccountButton: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },

  accountIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    marginRight: 10,
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  accountType: {
    marginTop: 3,
    fontSize: 11,
    color: "#7A8492",
  },

  accountBalance: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyAccountBox: {
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    padding: 18,
  },

  emptyAccountTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyAccountText: {
    marginTop: 5,
    fontSize: 13,
    color: "#7A8492",
  },

  accountManageButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#17202A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  accountManageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  sourceTypeRow: {
    flexDirection: "row",
    gap: 10,
  },

  sourceTypeButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#E3E7EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  activeSourceAccount: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },

  activeSourceCard: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },

  sourceTypeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  activeSourceText: {
    color: "#FFFFFF",
  },

  cards: {
    gap: 8,
  },

  cardButton: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  cardColorIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  cardInfo: {
    flex: 1,
  },

  cardName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  cardBank: {
    marginTop: 2,
    fontSize: 11,
    color: "#7A8492",
  },

  cardLimitText: {
    marginTop: 4,
    fontSize: 11,
    color: "#7A8492",
  },

  cardSelectedCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  cardSelectedCheckText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  cardManageButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  cardManageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  selectedCardPreview: {
    marginTop: 14,
    minHeight: 64,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  selectedCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  selectedCardText: {
    flex: 1,
  },

  selectedCardLabel: {
    fontSize: 11,
    color: "#7A8492",
  },

  selectedCardName: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  selectedCardAvailable: {
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800",
    color: "#17202A",
    lineHeight: 16,
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

  notFoundScreen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  notFoundCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9EDF2",
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

  backToTransactionsButton: {
    marginTop: 20,
    backgroundColor: "#17202A",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  backToTransactionsText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});