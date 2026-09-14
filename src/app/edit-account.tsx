import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AccountType,
  useAccounts,
} from "./context/AccountContext";

function formatBalanceInput(value: string) {
  if (!value) {
    return "";
  }

  // Noktaları kaldır, sadece rakam ve virgül bırak
  let normalized = value
    .replace(/\./g, "")
    .replace(/[^\d,]/g, "");

  if (!normalized) {
    return "";
  }

  const commaIndex =
    normalized.indexOf(",");

  let integerPart =
    commaIndex >= 0
      ? normalized.slice(0, commaIndex)
      : normalized;

  let decimalPart =
    commaIndex >= 0
      ? normalized.slice(commaIndex + 1)
      : "";

  // Başta gereksiz sıfırları temizle
  integerPart =
    integerPart.replace(
      /^0+(?=\d)/,
      ""
    );

  if (!integerPart) {
    integerPart = "0";
  }

  // Kuruş kısmı maksimum 2 hane
  decimalPart = decimalPart
    .replace(/\D/g, "")
    .slice(0, 2);

  // Binlik ayırıcı
  const formattedInteger =
    Number(
      integerPart
    ).toLocaleString("tr-TR");

  // Kullanıcı virgül girdiyse virgülü koru
  if (commaIndex >= 0) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
}

function parseBalance(
  value: string
) {
  return Number(
    value
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

export default function EditAccountScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    accounts,
    updateAccount,
  } = useAccounts();

  const account =
    accounts.find(
      (item) =>
        item.id === id
    );

  const [name, setName] =
    useState(
      account?.name ?? ""
    );

  const [type, setType] =
    useState<AccountType>(
      account?.type ??
        "bank"
    );

  const [
    balance,
    setBalance,
  ] = useState(() => {
    if (
      account?.balance ===
      undefined ||
      account?.balance ===
      null
    ) {
      return "";
    }

    return account.balance.toLocaleString(
      "tr-TR",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  });

  function handleBalanceChange(
    value: string
  ) {
    setBalance(
      formatBalanceInput(
        value
      )
    );
  }

  function handleUpdateAccount() {
    const numericBalance =
      parseBalance(balance);

    if (
      !account ||
      !name.trim() ||
      isNaN(numericBalance)
    ) {
      return;
    }

    updateAccount(
      id,
      {
        name: name.trim(),
        type,
        balance:
          numericBalance,
      }
    );

    router.replace(
      "/accounts"
    );
  }

  if (!account) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Hesap bulunamadı
        </Text>

        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.replace(
              "/accounts"
            )
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Hesaplara Dön
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
    >
      <Text
        style={styles.title}
      >
        Hesabı Düzenle
      </Text>

      <Text
        style={styles.subtitle}
      >
        Hesap bilgilerini güncelle.
      </Text>

      <View
        style={styles.card}
      >
        <Text
          style={styles.label}
        >
          Hesap Adı
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Örn. Ziraat Bankası"
          placeholderTextColor="#9AA1AA"
          value={name}
          onChangeText={
            setName
          }
        />

        <Text
          style={styles.label}
        >
          Hesap Türü
        </Text>

        <View
          style={
            styles.typeContainer
          }
        >
          <TypeButton
            label="🏦 Banka"
            active={
              type === "bank"
            }
            onPress={() =>
              setType("bank")
            }
          />

          <TypeButton
            label="💵 Nakit"
            active={
              type === "cash"
            }
            onPress={() =>
              setType("cash")
            }
          />

          <TypeButton
            label="🏦 Birikim"
            active={
              type ===
              "savings"
            }
            onPress={() =>
              setType("savings")
            }
          />
        </View>

        <Text
          style={styles.label}
        >
          Mevcut Bakiye
        </Text>

        <View
          style={
            styles.balanceWrapper
          }
        >
          <TextInput
            style={
              styles.balanceInput
            }
            placeholder="Örn. 25.000,59"
            placeholderTextColor="#9AA1AA"
            keyboardType="decimal-pad"
            value={balance}
            onChangeText={
              handleBalanceChange
            }
          />

          <Text
            style={
              styles.currency
            }
          >
            ₺
          </Text>
        </View>

        <Text
          style={
            styles.balanceHint
          }
        >
          Örnek: 10.000 veya 10.000,59
        </Text>

        <Pressable
          style={
            styles.saveButton
          }
          onPress={
            handleUpdateAccount
          }
        >
          <Text
            style={
              styles.saveButtonText
            }
          >
            Değişiklikleri Kaydet
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.cancelButton
          }
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
      </View>
    </ScrollView>
  );
}

function TypeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.typeButton,
        active &&
          styles.typeButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.typeButtonText,
          active &&
            styles.typeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F7F8FA",
    },

    container: {
      width: "100%",
      maxWidth: 700,
      alignSelf:
        "center",
      padding: 32,
      paddingBottom: 80,
    },

    title: {
      fontSize: 32,
      fontWeight:
        "800",
      color:
        "#17202A",
    },

    subtitle: {
      marginTop: 6,
      marginBottom: 28,
      fontSize: 15,
      color:
        "#7A8492",
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 28,
    },

    label: {
      fontSize: 14,
      fontWeight:
        "700",
      color:
        "#17202A",
      marginBottom: 8,
      marginTop: 18,
    },

    input: {
      height: 50,
      borderWidth: 1,
      borderColor:
        "#E1E5EA",
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 15,
      color:
        "#17202A",
      backgroundColor:
        "#FFFFFF",
    },

    typeContainer: {
      gap: 10,
    },

    typeButton: {
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        "#E1E5EA",
      borderRadius: 12,
      justifyContent:
        "center",
      paddingHorizontal: 14,
      backgroundColor:
        "#FFFFFF",
    },

    typeButtonActive: {
      borderColor:
        "#22C55E",
      backgroundColor:
        "#F0FDF4",
    },

    typeButtonText: {
      fontSize: 14,
      fontWeight:
        "600",
      color:
        "#59636F",
    },

    typeButtonTextActive: {
      color:
        "#16A34A",
      fontWeight:
        "800",
    },

    balanceWrapper: {
      height: 56,
      borderWidth: 1,
      borderColor:
        "#E1E5EA",
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 14,
    },

    balanceInput: {
      flex: 1,
      height: 54,
      fontSize: 18,
      fontWeight:
        "700",
      color:
        "#17202A",
    },

    currency: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        "#7A8492",
      marginLeft: 8,
    },

    balanceHint: {
      marginTop: 7,
      fontSize: 11,
      color:
        "#7A8492",
    },

    saveButton: {
      height: 50,
      borderRadius: 13,
      backgroundColor:
        "#22C55E",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 28,
    },

    saveButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight:
        "800",
    },

    cancelButton: {
      height: 48,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 8,
    },

    cancelButtonText: {
      color:
        "#7A8492",
      fontSize: 14,
      fontWeight:
        "700",
    },

    errorContainer: {
      flex: 1,
      backgroundColor:
        "#F7F8FA",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 32,
    },

    errorTitle: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        "#17202A",
    },

    backButton: {
      marginTop: 20,
      height: 46,
      paddingHorizontal: 20,
      borderRadius: 13,
      backgroundColor:
        "#22C55E",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      color:
        "#FFFFFF",
      fontSize: 14,
      fontWeight:
        "800",
    },
  });
