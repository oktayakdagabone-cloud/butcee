import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AccountsScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hesaplar</Text>

          <Text style={styles.subtitle}>
            Para kaynaklarını tek yerde yönet.
          </Text>
        </View>

        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>＋ Hesap Ekle</Text>
        </Pressable>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Toplam Varlık</Text>

        <Text style={styles.totalAmount}>₺43.700</Text>

        <Text style={styles.totalDescription}>
          Tüm hesaplarının toplam bakiyesi
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Hesaplarım</Text>

      <View style={styles.accountsCard}>
        <Account
          icon="💳"
          name="Banka Hesabı"
          type="Banka"
          amount="₺25.000"
        />

        <Account
          icon="💵"
          name="Nakit"
          type="Nakit"
          amount="₺8.700"
        />

        <Account
          icon="💳"
          name="Kredi Kartı"
          type="Kredi Kartı"
          amount="-₺4.200"
          negative
        />

        <Account
          icon="🏦"
          name="Birikim"
          type="Banka"
          amount="₺14.200"
        />
      </View>
    </ScrollView>
  );
}

function Account({
  icon,
  name,
  type,
  amount,
  negative = false,
}: {
  icon: string;
  name: string;
  type: string;
  amount: string;
  negative?: boolean;
}) {
  return (
    <View style={styles.account}>
      <View style={styles.accountLeft}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View>
          <Text style={styles.accountName}>{name}</Text>
          <Text style={styles.accountType}>{type}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.accountAmount,
          negative ? styles.negative : styles.positive,
        ]}
      >
        {amount}
      </Text>
    </View>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
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

  addButton: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  totalCard: {
    backgroundColor: "#17202A",
    borderRadius: 22,
    padding: 28,
    marginBottom: 30,
  },

  totalLabel: {
    color: "#AEB4BC",
    fontSize: 14,
    marginBottom: 8,
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
  },

  totalDescription: {
    marginTop: 8,
    color: "#AEB4BC",
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 12,
  },

  accountsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 22,
  },

  account: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
  },

  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 20,
  },

  accountName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#17202A",
  },

  accountType: {
    marginTop: 4,
    fontSize: 13,
    color: "#7A8492",
  },

  accountAmount: {
    fontSize: 16,
    fontWeight: "800",
  },

  positive: {
    color: "#22C55E",
  },

  negative: {
    color: "#FF8A3D",
  },
});