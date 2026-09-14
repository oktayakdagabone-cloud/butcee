import React, { useMemo, useState } from "react";
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
import { router } from "expo-router";
import { PaymentIcon } from "react-native-payment-card-icons";

import {
  CardNetwork,
  CardType,
  useCards,
} from "./context/CardContext";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  text: "#17202A",
  secondary: "#7A8492",
  green: "#22C55E",
  blue: "#3B82F6",
};

const TROY_LOGO =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Troy-logo-sloganli.png";

const cardNetworks: {
  value: CardNetwork;
  label: string;
}[] = [
  {
    value: "visa",
    label: "VISA",
  },
  {
    value: "mastercard",
    label: "Mastercard",
  },
  {
    value: "troy",
    label: "TROY",
  },
  {
    value: "amex",
    label: "American Express",
  },
  {
    value: "other",
    label: "Diğer",
  },
];

const cardColors = [
  "#17202A",
  "#3B82F6",
  "#22C55E",
  "#8B5CF6",
  "#FF8A3D",
  "#EF4444",
];

function BrandLogo({
  network,
  width = 86,
  height = 48,
}: {
  network: CardNetwork;
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
      style={{
        width,
        height,
        borderRadius: 10,
        backgroundColor: "#F1F3F5",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          color: COLORS.secondary,
        }}
      >
        CARD
      </Text>
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
  const formatInteger = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setInteger("");
      return;
    }

    setInteger(
      Number(digits).toLocaleString("tr-TR")
    );
  };

  return (
    <View style={styles.moneyRow}>
      <TextInput
        style={[
          styles.input,
          styles.moneyInteger,
        ]}
        value={integer}
        onChangeText={formatInteger}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#A0A7B2"
      />

      <Text style={styles.moneyComma}>
        ,
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.moneyDecimal,
        ]}
        value={decimal}
        onChangeText={(value) =>
          setDecimal(
            value
              .replace(/\D/g, "")
              .slice(0, 2)
          )
        }
        keyboardType="number-pad"
        placeholder="00"
        placeholderTextColor="#A0A7B2"
        maxLength={2}
      />

      <Text style={styles.currency}>
        ₺
      </Text>
    </View>
  );
}

export default function AddCardScreen() {
  const { addCard } = useCards();

  const [name, setName] = useState("");
  const [bankName, setBankName] =
    useState("");

  const [type, setType] =
    useState<CardType>("credit");

  const [network, setNetwork] =
    useState<CardNetwork>("visa");

  const [limitInteger, setLimitInteger] =
    useState("");

  const [limitDecimal, setLimitDecimal] =
    useState("");

  const [usedInteger, setUsedInteger] =
    useState("");

  const [usedDecimal, setUsedDecimal] =
    useState("");

  const [statementDay, setStatementDay] =
    useState("1");

  const [dueDay, setDueDay] =
    useState("10");

  const [
    minimumPaymentRate,
    setMinimumPaymentRate,
  ] = useState("20");

  const [selectedColor, setSelectedColor] =
    useState(cardColors[0]);

  const selectedNetwork = useMemo(
    () =>
      cardNetworks.find(
        (item) => item.value === network
      ),
    [network]
  );

  const parseMoney = (
    integer: string,
    decimal: string
  ) => {
    const whole = Number(
      integer
        .replace(/\./g, "")
        .replace(/,/g, "") || "0"
    );

    return (
      whole +
      Number(decimal || "0") / 100
    );
  };

  const handleSave = async () => {
    const trimmedName =
      name.trim();

    const trimmedBank =
      bankName.trim();

    const limit = parseMoney(
      limitInteger,
      limitDecimal
    );

    const usedLimit =
      parseMoney(
        usedInteger,
        usedDecimal
      );

    const statement =
      Number(statementDay);

    const due =
      Number(dueDay);

    const minimumRate =
      Number(minimumPaymentRate);

    if (!trimmedName) {
      Alert.alert(
        "Eksik bilgi",
        "Kart adı gir."
      );
      return;
    }

    if (!trimmedBank) {
      Alert.alert(
        "Eksik bilgi",
        "Banka adı gir."
      );
      return;
    }

    if (
      type === "credit" &&
      limit <= 0
    ) {
      Alert.alert(
        "Eksik bilgi",
        "Kredi kartı limiti 0'dan büyük olmalı."
      );
      return;
    }

    if (
      type === "credit" &&
      usedLimit > limit
    ) {
      Alert.alert(
        "Hatalı değer",
        "Kullanılan limit toplam limitten büyük olamaz."
      );
      return;
    }

    if (
      statement < 1 ||
      statement > 31
    ) {
      Alert.alert(
        "Hatalı değer",
        "Ekstre günü 1-31 arasında olmalı."
      );
      return;
    }

    if (
      due < 1 ||
      due > 31
    ) {
      Alert.alert(
        "Hatalı değer",
        "Son ödeme günü 1-31 arasında olmalı."
      );
      return;
    }

    if (
      minimumRate < 0 ||
      minimumRate > 100
    ) {
      Alert.alert(
        "Hatalı değer",
        "Asgari ödeme oranı 0-100 arasında olmalı."
      );
      return;
    }

    await addCard({
      name: trimmedName,
      bankName: trimmedBank,
      type,
      network,
      limit:
        type === "credit"
          ? limit
          : 0,
      usedLimit:
        type === "credit"
          ? usedLimit
          : 0,
      statementDay: statement,
      dueDay: due,
      minimumPaymentRate:
        type === "credit"
          ? minimumRate
          : 0,
      color: selectedColor,
    });

    router.replace("/cards");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Kart Ekle
        </Text>

        <Text style={styles.subtitle}>
          Kart bilgilerini girerek yeni kart oluştur.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Kart adı
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Örn. Bonus Kartım"
          placeholderTextColor="#A0A7B2"
        />

        <Text style={styles.label}>
          Banka
        </Text>

        <TextInput
          style={styles.input}
          value={bankName}
          onChangeText={setBankName}
          placeholder="Örn. Garanti BBVA"
          placeholderTextColor="#A0A7B2"
        />

        <Text style={styles.sectionTitle}>
          Kart türü
        </Text>

        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.typeOption,
              type === "credit" &&
                styles.typeOptionActive,
            ]}
            onPress={() =>
              setType("credit")
            }
          >
            <Text
              style={[
                styles.typeText,
                type === "credit" &&
                  styles.typeTextActive,
              ]}
            >
              Kredi Kartı
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeOption,
              type === "debit" &&
                styles.typeOptionActive,
            ]}
            onPress={() =>
              setType("debit")
            }
          >
            <Text
              style={[
                styles.typeText,
                type === "debit" &&
                  styles.typeTextActive,
              ]}
            >
              Banka Kartı
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Kart ağı
        </Text>

        <Text style={styles.helperText}>
          Kartının üzerinde bulunan ödeme ağını seç.
        </Text>

        <View style={styles.networkGrid}>
          {cardNetworks.map((item) => {
            const selected =
              network === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() =>
                  setNetwork(
                    item.value
                  )
                }
                style={[
                  styles.networkOption,
                  selected &&
                    styles.networkOptionSelected,
                ]}
              >
                <View
                  style={styles.logoArea}
                >
                  <BrandLogo
                    network={item.value}
                    width={90}
                    height={50}
                  />
                </View>

                <Text
                  style={[
                    styles.networkLabel,
                    selected &&
                      styles.networkLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>

                {selected && (
                  <View
                    style={styles.checkBadge}
                  >
                    <Text
                      style={styles.checkText}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.preview}>
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor:
                  selectedColor,
              },
            ]}
          >
            <View>
              <Text
                style={styles.previewBank}
              >
                {bankName ||
                  "Banka Adı"}
              </Text>

              <Text
                style={styles.previewName}
              >
                {name ||
                  "Kart Adı"}
              </Text>
            </View>

            <BrandLogo
              network={network}
              width={90}
              height={50}
            />
          </View>
        </View>

        {type === "credit" && (
          <>
            <Text style={styles.label}>
              Kart limiti
            </Text>

            <MoneyInput
              integer={
                limitInteger
              }
              decimal={
                limitDecimal
              }
              setInteger={
                setLimitInteger
              }
              setDecimal={
                setLimitDecimal
              }
            />

            <Text style={styles.label}>
              Kullanılan limit
            </Text>

            <MoneyInput
              integer={
                usedInteger
              }
              decimal={
                usedDecimal
              }
              setInteger={
                setUsedInteger
              }
              setDecimal={
                setUsedDecimal
              }
            />

            <Text style={styles.label}>
              Asgari ödeme oranı (%)
            </Text>

            <TextInput
              style={styles.input}
              value={
                minimumPaymentRate
              }
              onChangeText={(value) =>
                setMinimumPaymentRate(
                  value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              keyboardType="number-pad"
            />

            <Text style={styles.label}>
              Ekstre günü
            </Text>

            <TextInput
              style={styles.input}
              value={statementDay}
              onChangeText={(value) =>
                setStatementDay(
                  value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(0, 2)
                )
              }
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.label}>
              Son ödeme günü
            </Text>

            <TextInput
              style={styles.input}
              value={dueDay}
              onChangeText={(value) =>
                setDueDay(
                  value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(0, 2)
                )
              }
              keyboardType="number-pad"
              maxLength={2}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>
          Kart rengi
        </Text>

        <View style={styles.colorRow}>
          {cardColors.map((color) => (
            <Pressable
              key={color}
              onPress={() =>
                setSelectedColor(
                  color
                )
              }
              style={[
                styles.colorCircle,
                {
                  backgroundColor:
                    color,
                },
                selectedColor ===
                  color &&
                  styles.selectedColorCircle,
              ]}
            >
              {selectedColor ===
                color && (
                <Text
                  style={
                    styles.colorCheck
                  }
                >
                  ✓
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text
            style={
              styles.saveButtonText
            }
          >
            Kartı Kaydet
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    padding: 24,
    paddingBottom: 60,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: COLORS.secondary,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },

  helperText: {
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 12,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDE2E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
    backgroundColor: "#FBFCFD",
  },

  optionRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeOption: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE2E8",
    alignItems: "center",
    justifyContent: "center",
  },

  typeOptionActive: {
    backgroundColor: "#EEF6FF",
    borderColor: COLORS.blue,
  },

  typeText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  typeTextActive: {
    color: COLORS.blue,
  },

  networkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  networkOption: {
    width: 155,
    minHeight: 126,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E5EA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    position: "relative",
  },

  networkOptionSelected: {
    borderColor: COLORS.blue,
    borderWidth: 2,
    backgroundColor: "#F5F9FF",
  },

  logoArea: {
    width: 110,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  networkLabel: {
    marginTop: 7,
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  networkLabelSelected: {
    color: COLORS.blue,
  },

  checkBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  preview: {
    marginTop: 22,
  },

  previewCard: {
    minHeight: 160,
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end",
  },

  previewBank: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.85,
  },

  previewName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
  },

  moneyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  moneyInteger: {
    flex: 1,
  },

  moneyDecimal: {
    width: 70,
  },

  moneyComma: {
    marginHorizontal: 6,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  currency: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },

  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedColorCircle: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  colorCheck: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  saveButton: {
    marginTop: 30,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});