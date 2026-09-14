import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

import { useAccounts } from "./context/AccountContext";
import { useCards } from "./context/CardContext";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  green: "#22C55E",
  blue: "#3B82F6",
  orange: "#FF8A3D",
  red: "#EF4444",
};

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

function formatAmountInput(value: string) {
  if (!value) {
    return "";
  }

  let normalized = value
    .replace(/\./g, "")
    .replace(/[^\d,]/g, "");

  if (!normalized) {
    return "";
  }

  const commaIndex = normalized.indexOf(",");

  let integerPart =
    commaIndex >= 0
      ? normalized.slice(0, commaIndex)
      : normalized;

  let decimalPart =
    commaIndex >= 0
      ? normalized.slice(commaIndex + 1)
      : "";

  integerPart = integerPart.replace(
    /^0+(?=\d)/,
    ""
  );

  if (!integerPart) {
    integerPart = "0";
  }

  decimalPart = decimalPart
    .replace(/\D/g, "")
    .slice(0, 2);

  const formattedInteger =
    Number(integerPart).toLocaleString("tr-TR");

  if (commaIndex >= 0) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
}

function parseAmount(value: string) {
  if (!value) {
    return 0;
  }

  return Number(
    value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );
}

export default function CardPaymentScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 480;
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const {
    cards,
    getCardDebtSummary,
    makeCardPayment,
  } = useCards();

  const {
    accounts,
  } = useAccounts();

  const card = useMemo(
    () =>
      cards.find(
        (item) =>
          item.id === params.id
      ),
    [cards, params.id]
  );

  const summary = useMemo(() => {
    if (!card) {
      return null;
    }

    return getCardDebtSummary(
      card.id,
      undefined,
      new Date()
    );
  }, [
    card,
    getCardDebtSummary,
  ]);

  const [amount, setAmount] =
    useState("");

  const [
    paymentSource,
    setPaymentSource,
  ] = useState<
    "account" | "manual"
  >("account");

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState("");

  const [note, setNote] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const numericAmount =
    parseAmount(amount);

  const totalDebt =
    summary?.totalOutstandingDebt ||
    0;

  const minimumPayment =
    summary?.minimumPaymentAmount ||
    0;

  const selectedAccount =
    accounts.find(
      (account) =>
        account.id ===
        selectedAccountId
    );

  function handleAmountChange(
    value: string
  ) {
    setAmount(
      formatAmountInput(value)
    );
  }

  function setQuickAmount(
    value: number
  ) {
    const safeValue = Math.min(
      value,
      totalDebt
    );

    if (safeValue <= 0) {
      setAmount("");
      return;
    }

    setAmount(
      safeValue.toLocaleString(
        "tr-TR",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      )
    );
  }

  async function handlePayment() {
    if (!card) {
      Alert.alert(
        "Hata",
        "Kart bulunamadı."
      );
      return;
    }

    if (card.type !== "credit") {
      Alert.alert("Ödeme kullanılamıyor", "Kart ödemesi yalnızca kredi kartları için kullanılabilir.");
      return;
    }

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      Alert.alert(
        "Geçersiz tutar",
        "Lütfen geçerli bir ödeme tutarı gir."
      );
      return;
    }

    if (
      numericAmount >
      totalDebt
    ) {
      Alert.alert(
        "Tutar fazla",
        `Kartın toplam borcu ${formatMoney(
          totalDebt
        )}. Bu tutardan fazla ödeme yapamazsın.`
      );
      return;
    }

    if (
      paymentSource ===
        "account" &&
      !selectedAccountId
    ) {
      Alert.alert(
        "Hesap seçilmedi",
        "Ödemenin yapılacağı banka hesabını seç."
      );
      return;
    }

    if (
      paymentSource ===
        "account" &&
      selectedAccount &&
      Number(
        selectedAccount.balance ||
          0
      ) < numericAmount
    ) {
      Alert.alert(
        "Yetersiz bakiye",
        `${selectedAccount.name} hesabında bu ödeme için yeterli bakiye bulunmuyor.`
      );
      return;
    }

    try {
      setSaving(true);

      await makeCardPayment(card.id, numericAmount, {
        paymentSource,
        accountId: paymentSource === "account" ? selectedAccountId : undefined,
        note: note.trim() || undefined,
      });

      /*
       * Ödeme başarılı.
       * Direkt Kartlar sayfasına dön.
       */
      router.replace("/cards");
    } catch (error) {
      Alert.alert(
        "Ödeme başarısız",
        error instanceof Error
          ? error.message
          : "Ödeme kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!card || card.type !== "credit") {
    return (
      <View
        style={
          styles.centerContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          {!card ? "Kart bulunamadı" : "Bu kart için ödeme yapılamaz"}
        </Text>

        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Geri Dön
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      {/* BAŞLIK */}

      <View
        style={[
          styles.header,
          isCompact && styles.headerCompact,
        ]}
      >
        <View>
          <Text
            style={styles.title}
          >
            Kart Ödemesi
          </Text>

          <Text
            style={styles.subtitle}
          >
            {card.bankName} ·{" "}
            {card.name}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backText
            }
          >
            Geri
          </Text>
        </Pressable>
      </View>

      {/* BORÇ ÖZETİ */}

      <View
        style={
          styles.summaryCard
        }
      >
        <Text
          style={
            styles.summaryCaption
          }
        >
          TOPLAM AÇIK BORÇ
        </Text>

        <Text
          style={
            styles.summaryAmount
          }
        >
          {formatMoney(
            totalDebt
          )}
        </Text>

        <View
          style={
            styles.summaryDivider
          }
        />

        <View
          style={
            styles.summaryBottom
          }
        >
          <View>
            <Text
              style={
                styles.summarySmallLabel
              }
            >
              Son Ekstre
            </Text>

            <Text
              style={
                styles.summarySmallValue
              }
            >
              {formatMoney(
                summary?.lastStatementDebt ||
                  0
              )}
            </Text>
          </View>

          <View>
            <Text
              style={
                styles.summarySmallLabel
              }
            >
              Güncel Dönem
            </Text>

            <Text
              style={
                styles.summarySmallValue
              }
            >
              {formatMoney(
                summary?.currentPeriodDebt ||
                  0
              )}
            </Text>
          </View>

          <View>
            <Text
              style={
                styles.summarySmallLabel
              }
            >
              Asgari Ödeme
            </Text>

            <Text
              style={[
                styles.summarySmallValue,
                {
                  color:
                    COLORS.red,
                },
              ]}
            >
              {formatMoney(
                minimumPayment
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* HIZLI ÖDEME */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Hızlı Ödeme
      </Text>

      <View
        style={[
          styles.quickGrid,
          isCompact && styles.quickGridCompact,
        ]}
      >
        <Pressable
          style={
            [
              styles.quickCard,
              isCompact && styles.quickCardCompact,
            ]
          }
          onPress={() =>
            setQuickAmount(
              minimumPayment
            )
          }
        >
          <Text
            style={
              styles.quickLabel
            }
          >
            Asgari
          </Text>

          <Text
            style={
              styles.quickValue
            }
          >
            {formatMoney(
              minimumPayment
            )}
          </Text>
        </Pressable>

        <Pressable
          style={
            [
              styles.quickCard,
              isCompact && styles.quickCardCompact,
            ]
          }
          onPress={() =>
            setQuickAmount(
              summary?.lastStatementDebt ||
                0
            )
          }
        >
          <Text
            style={
              styles.quickLabel
            }
          >
            Ekstre
          </Text>

          <Text
            style={
              styles.quickValue
            }
          >
            {formatMoney(
              summary?.lastStatementDebt ||
                0
            )}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.quickCard,
            styles.quickCardGreen,
            isCompact && styles.quickCardCompact,
          ]}
          onPress={() =>
            setQuickAmount(
              totalDebt
            )
          }
        >
          <Text
            style={
              styles.quickLabel
            }
          >
            Tamamı
          </Text>

          <Text
            style={
              styles.quickValue
            }
          >
            {formatMoney(
              totalDebt
            )}
          </Text>
        </Pressable>
      </View>

      {/* TUTAR */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Ödeme Tutarı
      </Text>

      <View
        style={
          styles.amountBox
        }
      >
        <TextInput
          value={amount}
          onChangeText={
            handleAmountChange
          }
          placeholder="0,00"
          placeholderTextColor="#9AA4B2"
          keyboardType="decimal-pad"
          style={
            styles.amountInput
          }
        />

        <Text
          style={
            styles.currencyText
          }
        >
          ₺
        </Text>
      </View>

      <Text
        style={
          styles.maximumText
        }
      >
        Maksimum ödeme:{" "}
        {formatMoney(
          totalDebt
        )}
      </Text>

      {/* ÖDEME ARACI */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Ödeme Aracı
      </Text>

      <View
        style={[
          styles.paymentSourceRow,
          isCompact && styles.paymentSourceRowCompact,
        ]}
      >
        <Pressable
          style={[
            styles.paymentSourceCard,
            isCompact && styles.paymentSourceCardCompact,
            paymentSource ===
              "account" &&
              styles.paymentSourceCardActive,
          ]}
          onPress={() =>
            setPaymentSource(
              "account"
            )
          }
        >
          <View
            style={
              styles.sourceIcon
            }
          >
            <Text
              style={
                styles.sourceIconText
              }
            >
              🏦
            </Text>
          </View>

          <View
            style={
              styles.sourceInfo
            }
          >
            <Text
              style={[
                styles.sourceTitle,
                paymentSource ===
                  "account" &&
                  styles.sourceTitleActive,
              ]}
            >
              Banka Hesabı
            </Text>

            <Text
              style={
                styles.sourceDescription
              }
            >
              Hesap bakiyesi düşer
            </Text>
          </View>

          {paymentSource ===
            "account" && (
            <Text
              style={
                styles.checkMark
              }
            >
              ✓
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.paymentSourceCard,
            isCompact && styles.paymentSourceCardCompact,
            paymentSource ===
              "manual" &&
              styles.paymentSourceManualActive,
          ]}
          onPress={() =>
            setPaymentSource(
              "manual"
            )
          }
        >
          <View
            style={[
              styles.sourceIcon,
              {
                backgroundColor:
                  "#FFF7ED",
              },
            ]}
          >
            <Text
              style={
                styles.sourceIconText
              }
            >
              ✋
            </Text>
          </View>

          <View
            style={
              styles.sourceInfo
            }
          >
            <Text
              style={[
                styles.sourceTitle,
                paymentSource ===
                  "manual" &&
                  styles.sourceTitleManualActive,
              ]}
            >
              Manuel
            </Text>

            <Text
              style={
                styles.sourceDescription
              }
            >
              Hesap bakiyesi değişmez
            </Text>
          </View>

          {paymentSource ===
            "manual" && (
            <Text
              style={[
                styles.checkMark,
                {
                  color:
                    COLORS.orange,
                },
              ]}
            >
              ✓
            </Text>
          )}
        </Pressable>
      </View>

      {/* HESAP SEÇİMİ */}

      {paymentSource ===
        "account" && (
        <>
          <Text
            style={
              styles.sectionTitle
            }
          >
            Banka Hesabı
          </Text>

          {accounts.length ===
          0 ? (
            <View
              style={
                styles.noAccountBox
              }
            >
              <Text
                style={
                  styles.noAccountTitle
                }
              >
                Banka hesabı bulunamadı
              </Text>

              <Text
                style={
                  styles.noAccountText
                }
              >
                Hesaptan ödeme yapabilmek için
                önce bir banka hesabı eklemelisin.
              </Text>

              <Pressable
                style={
                  styles.accountButton
                }
                onPress={() =>
                  router.push(
                    "/accounts"
                  )
                }
              >
                <Text
                  style={
                    styles.accountButtonText
                  }
                >
                  Hesaplara Git
                </Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={
                styles.accountList
              }
            >
              {accounts.map(
                (account) => {
                  const balance =
                    Number(
                      account.balance ||
                        0
                    );

                  const selected =
                    account.id ===
                    selectedAccountId;

                  const enough =
                    balance >=
                    numericAmount;

                  return (
                    <Pressable
                      key={
                        account.id
                      }
                      style={[
                        styles.accountCard,
                        selected &&
                          styles.accountCardSelected,
                      ]}
                      onPress={() =>
                        setSelectedAccountId(
                          account.id
                        )
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
                          <Text
                            style={
                              styles.accountIconText
                            }
                          >
                            ₺
                          </Text>
                        </View>

                        <View>
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
                            "savings"
                              ? "Birikim"
                              : account.type ===
                                  "cash"
                                ? "Nakit"
                                : "Banka"}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.accountRight
                        }
                      >
                        <Text
                          style={[
                            styles.accountBalance,
                            {
                              color:
                                enough ||
                                !numericAmount
                                  ? COLORS.text
                                  : COLORS.red,
                            },
                          ]}
                        >
                          {formatMoney(
                            balance
                          )}
                        </Text>

                        {selected && (
                          <Text
                            style={
                              styles.selectedText
                            }
                          >
                            ✓ Seçildi
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                }
              )}
            </View>
          )}
        </>
      )}

      {/* İŞLEM BİLGİSİ */}

      <View
        style={
          styles.infoBox
        }
      >
        <Text
          style={
            styles.infoTitle
          }
        >
          Ödeme İşlemi
        </Text>

        <Text
          style={
            styles.infoText
          }
        >
          Bu ödeme kart borcundan düşülecek ve
          kullanılabilir kart limitin aynı tutarda
          artacak.
        </Text>

        {paymentSource ===
          "account" &&
          selectedAccount && (
            <Text
              style={
                styles.infoAccount
              }
            >
              Para çekilecek hesap:{" "}
              <Text
                style={
                  styles.infoAccountStrong
                }
              >
                {
                  selectedAccount.name
                }
              </Text>
            </Text>
          )}

        {paymentSource ===
          "manual" && (
          <Text
            style={
              styles.infoManual
            }
          >
            Manuel ödeme seçildi. Banka hesabı bakiyesi
            değişmeyecek.
          </Text>
        )}
      </View>

      {/* NOT */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        Not
      </Text>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Ödeme ile ilgili not..."
        placeholderTextColor="#AAB2BC"
        multiline
        style={
          styles.noteInput
        }
      />

      {/* ÖDEMEYİ KAYDET */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saving ? "Ödeme kaydediliyor" : "Ödemeyi kaydet"}
        disabled={saving || totalDebt <= 0}
        style={[
          styles.saveButton,
          (saving || totalDebt <= 0) &&
            styles.saveButtonDisabled,
        ]}
        onPress={
          handlePayment
        }
      >
        <Text
          style={
            styles.saveButtonText
          }
        >
          {saving
            ? "Ödeme Kaydediliyor..."
            : "Ödemeyi Kaydet"}
        </Text>
      </Pressable>

      <Pressable
        disabled={saving}
        onPress={() =>
          router.back()
        }
        style={
          styles.cancelLink
        }
      >
        <Text
          style={
            styles.cancelLinkText
          }
        >
          Vazgeç
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.bg,
    },

    content: {
      width: "100%",
      maxWidth: 920,
      alignSelf:
        "center",
      padding: 24,
      paddingBottom: 80,
    },

    centerContainer: {
      flex: 1,
      backgroundColor:
        COLORS.bg,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 30,
    },

    errorTitle: {
      fontSize: 24,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    backButton: {
      marginTop: 18,
      paddingHorizontal: 20,
      minHeight: 44,
      borderRadius: 11,
      backgroundColor:
        COLORS.blue,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      color:
        "#FFFFFF",
      fontWeight:
        "800",
    },

    header: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
      marginBottom: 20,
    },

    headerCompact: {
      alignItems: "flex-start",
      gap: 12,
    },

    title: {
      fontSize: 30,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      color:
        COLORS.secondary,
    },

    backText: {
      color:
        COLORS.blue,
      fontSize: 14,
      fontWeight:
        "800",
      marginTop: 10,
    },

    summaryCard: {
      backgroundColor:
        COLORS.card,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor:
        "#E8ECF0",
      marginBottom: 24,
    },

    summaryCaption: {
      fontSize: 11,
      fontWeight:
        "800",
      letterSpacing:
        0.5,
      color:
        COLORS.secondary,
    },

    summaryAmount: {
      marginTop: 14,
      fontSize: 38,
      lineHeight: 44,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    summaryDivider: {
      height: 1,
      backgroundColor:
        "#E5E9EE",
      marginVertical: 22,
    },

    summaryBottom: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap: 20,
    },

    summarySmallLabel: {
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    summarySmallValue: {
      marginTop: 5,
      fontSize: 14,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    sectionTitle: {
      marginBottom: 10,
      fontSize: 16,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    quickGrid: {
      flexDirection:
        "row",
      gap: 12,
      marginBottom: 24,
    },

    quickGridCompact: {
      flexWrap: "wrap",
    },

    quickCard: {
      flex: 1,
      minHeight: 72,
      padding: 15,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#CFE0FF",
      backgroundColor:
        "#F2F7FF",
      justifyContent:
        "center",
    },

    quickCardCompact: {
      flexBasis: "46%",
    },

    quickCardGreen: {
      borderColor:
        "#B7E9CC",
      backgroundColor:
        "#F0FDF4",
    },

    quickLabel: {
      fontSize: 11,
      color:
        COLORS.secondary,
      fontWeight:
        "700",
    },

    quickValue: {
      marginTop: 5,
      fontSize: 15,
      color:
        COLORS.text,
      fontWeight:
        "900",
    },

    amountBox: {
      minHeight: 80,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E2E7EC",
      backgroundColor:
        COLORS.card,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 18,
    },

    amountInput: {
      flex: 1,
      fontSize: 32,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    currencyText: {
      fontSize: 25,
      fontWeight:
        "900",
      color:
        COLORS.secondary,
    },

    maximumText: {
      marginTop: 8,
      marginBottom: 24,
      fontSize: 12,
      color:
        COLORS.secondary,
    },

    paymentSourceRow: {
      flexDirection:
        "row",
      gap: 12,
      marginBottom: 24,
    },

    paymentSourceRowCompact: {
      flexDirection: "column",
    },

    paymentSourceCard: {
      flex: 1,
      minHeight: 90,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#E2E7EC",
      backgroundColor:
        COLORS.card,
      padding: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    paymentSourceCardCompact: {
      flex: 0,
    },

    paymentSourceCardActive: {
      borderColor:
        COLORS.blue,
      backgroundColor:
        "#F1F7FF",
    },

    paymentSourceManualActive: {
      borderColor:
        COLORS.orange,
      backgroundColor:
        "#FFF8F1",
    },

    sourceIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        "#EEF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sourceIconText: {
      fontSize: 20,
    },

    sourceInfo: {
      flex: 1,
    },

    sourceTitle: {
      fontSize: 13,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    sourceTitleActive: {
      color:
        COLORS.blue,
    },

    sourceTitleManualActive: {
      color:
        COLORS.orange,
    },

    sourceDescription: {
      marginTop: 4,
      fontSize: 10,
      color:
        COLORS.secondary,
      lineHeight: 15,
    },

    checkMark: {
      fontSize: 18,
      fontWeight:
        "900",
      color:
        COLORS.green,
    },

    accountList: {
      gap: 10,
      marginBottom: 24,
    },

    accountCard: {
      minHeight: 76,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#E3E8ED",
      backgroundColor:
        COLORS.card,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 14,
    },

    accountCardSelected: {
      borderColor:
        COLORS.green,
      backgroundColor:
        "#F0FDF4",
    },

    accountLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
      flex: 1,
    },

    accountIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        "#EEF2FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    accountIconText: {
      color:
        COLORS.blue,
      fontSize: 16,
      fontWeight:
        "900",
    },

    accountName: {
      fontSize: 14,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    accountType: {
      marginTop: 3,
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    accountRight: {
      alignItems:
        "flex-end",
    },

    accountBalance: {
      fontSize: 13,
      fontWeight:
        "900",
    },

    selectedText: {
      marginTop: 3,
      fontSize: 10,
      fontWeight:
        "900",
      color:
        COLORS.green,
    },

    noAccountBox: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 14,
      backgroundColor:
        "#FFF7ED",
      borderWidth: 1,
      borderColor:
        "#FED7AA",
    },

    noAccountTitle: {
      fontSize: 14,
      fontWeight:
        "900",
      color:
        "#9A3412",
    },

    noAccountText: {
      marginTop: 5,
      fontSize: 12,
      color:
        "#9A3412",
      lineHeight: 18,
    },

    accountButton: {
      alignSelf:
        "flex-start",
      marginTop: 11,
      minHeight: 38,
      paddingHorizontal: 13,
      borderRadius: 9,
      backgroundColor:
        COLORS.orange,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    accountButtonText: {
      color:
        "#FFFFFF",
      fontSize: 12,
      fontWeight:
        "800",
    },

    infoBox: {
      marginBottom: 22,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#CFE0FF",
      backgroundColor:
        "#F1F7FF",
    },

    infoTitle: {
      fontSize: 13,
      fontWeight:
        "900",
      color:
        COLORS.blue,
    },

    infoText: {
      marginTop: 5,
      fontSize: 11,
      lineHeight: 17,
      color:
        "#45627F",
    },

    infoAccount: {
      marginTop: 8,
      fontSize: 11,
      color:
        "#45627F",
    },

    infoAccountStrong: {
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    infoManual: {
      marginTop: 8,
      fontSize: 11,
      fontWeight:
        "700",
      color:
        COLORS.orange,
    },

    noteInput: {
      minHeight: 90,
      marginBottom: 20,
      padding: 13,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E2E7EC",
      backgroundColor:
        COLORS.card,
      textAlignVertical:
        "top",
      color:
        COLORS.text,
      fontSize: 13,
    },

    saveButton: {
      minHeight: 56,
      borderRadius: 14,
      backgroundColor:
        COLORS.green,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight:
        "900",
    },

    cancelLink: {
      alignItems:
        "center",
      justifyContent:
        "center",
      minHeight: 45,
    },

    cancelLinkText: {
      color:
        COLORS.secondary,
      fontSize: 13,
      fontWeight:
        "800",
    },
  });
