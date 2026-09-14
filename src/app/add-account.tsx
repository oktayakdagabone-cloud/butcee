import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  AccountType,
  useAccounts,
} from "./context/AccountContext";

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

export default function AddAccountScreen() {
  const { addAccount } = useAccounts();

  const [name, setName] = useState("");

  const [type, setType] =
    useState<AccountType>("bank");

  const [
    integerBalance,
    setIntegerBalance,
  ] = useState("");

  const [
    decimalBalance,
    setDecimalBalance,
  ] = useState("");

  const numericIntegerBalance = Number(
    integerBalance.replace(/\./g, "")
  );

  const numericDecimalBalance = Number(
    decimalBalance.replace(/\D/g, "")
  );

  const numericBalance =
    numericIntegerBalance +
    numericDecimalBalance / 100;

  const isValid =
    name.trim() !== "" &&
    numericBalance >= 0;

  function handleIntegerChange(
    value: string
  ) {
    setIntegerBalance(
      formatIntegerInput(value)
    );
  }

  function handleDecimalChange(
    value: string
  ) {
    const digits =
      value.replace(/\D/g, "");

    setDecimalBalance(
      digits.slice(0, 2)
    );
  }

  function handleAddAccount() {
    if (!isValid) {
      return;
    }

    addAccount({
      name: name.trim(),
      type,
      balance: numericBalance,
    });

    router.replace("/accounts");
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Hesap Ekle
      </Text>

      <Text style={styles.subtitle}>
        Yeni bir para kaynağı oluştur.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Hesap Adı
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Örn. Ziraat Bankası"
          placeholderTextColor="#9AA1AA"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>
          Hesap Türü
        </Text>

        <View style={styles.typeContainer}>
          <TypeButton
            label="🏦 Banka"
            active={type === "bank"}
            onPress={() =>
              setType("bank")
            }
          />

          <TypeButton
            label="💵 Nakit"
            active={type === "cash"}
            onPress={() =>
              setType("cash")
            }
          />

          <TypeButton
            label="🏦 Birikim"
            active={type === "savings"}
            onPress={() =>
              setType("savings")
            }
          />
        </View>

        <Text style={styles.label}>
          Mevcut Bakiye
        </Text>

        <View style={styles.amountRow}>
          <View
            style={
              styles.integerAmountWrapper
            }
          >
            <TextInput
              style={
                styles.integerAmountInput
              }
              value={integerBalance}
              onChangeText={
                handleIntegerChange
              }
              placeholder="0"
              placeholderTextColor="#AEB4BC"
              keyboardType="number-pad"
            />

            <Text style={styles.currencyText}>
              ₺
            </Text>
          </View>

          <Text
            style={styles.decimalSeparator}
          >
            ,
          </Text>

          <TextInput
            style={styles.decimalInput}
            value={decimalBalance}
            onChangeText={
              handleDecimalChange
            }
            placeholder="00"
            placeholderTextColor="#AEB4BC"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <Text style={styles.amountHint}>
          Örnek: 50000 + 50 =
          50.000,50 ₺
        </Text>

        {numericBalance > 0 && (
          <View style={styles.balancePreview}>
            <Text
              style={styles.balancePreviewLabel}
            >
              Oluşacak bakiye
            </Text>

            <Text
              style={styles.balancePreviewAmount}
            >
              ₺{formatMoney(numericBalance)}
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
          onPress={handleAddAccount}
        >
          <Text
            style={styles.saveButtonText}
          >
            Hesabı Kaydet
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  container: {
    width: "100%",
    maxWidth: 700,
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
    marginBottom: 28,
    fontSize: 15,
    color: "#7A8492",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17202A",
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#17202A",
    backgroundColor: "#FFFFFF",
  },

  typeContainer: {
    gap: 10,
  },

  typeButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },

  typeButtonActive: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },

  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#59636F",
  },

  typeButtonTextActive: {
    color: "#16A34A",
    fontWeight: "800",
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
    borderColor: "#E1E5EA",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingRight: 48,
    fontSize: 24,
    fontWeight: "800",
    color: "#17202A",
  },

  currencyText: {
    position: "absolute",
    right: 17,
    top: 19,
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
    borderColor: "#E1E5EA",
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

  balancePreview: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  balancePreviewLabel: {
    fontSize: 12,
    color: "#7A8492",
  },

  balancePreviewAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16A34A",
  },

  saveButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    color: "#7A8492",
    fontSize: 14,
    fontWeight: "700",
  },
});