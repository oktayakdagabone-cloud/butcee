import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAccounts } from "./context/AccountContext";

export default function AccountsScreen() {
  const { accounts, deleteAccount } = useAccounts();

  const totalAssets = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

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

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-account")}
        >
          <Text style={styles.addButtonText}>
            ＋ Hesap Ekle
          </Text>
        </Pressable>
      </View>

      {/* HESAPLAR / KARTLAR */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            styles.activeTab,
          ]}
          onPress={() => router.push("/accounts")}
        >
          <Text
            style={[
              styles.tabText,
              styles.activeTabText,
            ]}
          >
            🏦 Hesaplar
          </Text>
        </Pressable>

        <Pressable
          style={styles.tab}
          onPress={() => router.push("/cards")}
        >
          <Text style={styles.tabText}>
            💳 Kartlar
          </Text>
        </Pressable>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>
          Toplam Varlık
        </Text>

        <Text style={styles.totalAmount}>
          ₺{totalAssets.toLocaleString("tr-TR")}
        </Text>

        <Text style={styles.totalDescription}>
          Tüm hesaplarının toplam bakiyesi
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Hesaplarım
      </Text>

      {accounts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            Henüz hesap yok
          </Text>

          <Text style={styles.emptyText}>
            Banka hesabı, nakit veya birikim hesabı
            ekleyerek başlayabilirsin.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/add-account")}
          >
            <Text style={styles.emptyButtonText}>
              İlk Hesabı Ekle
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.accountsCard}>
          {accounts.map((account) => (
            <Account
              key={account.id}
              id={account.id}
              name={account.name}
              type={getAccountTypeName(account.type)}
              amount={account.balance}
              negative={account.balance < 0}
              icon={getAccountIcon(account.type)}
              onDelete={deleteAccount}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getAccountTypeName(type: string) {
  switch (type) {
    case "bank":
      return "Banka";

    case "cash":
      return "Nakit";

    case "credit_card":
      return "Kredi Kartı";

    case "savings":
      return "Birikim";

    default:
      return "Diğer";
  }
}

function getAccountIcon(type: string) {
  switch (type) {
    case "bank":
      return "🏦";

    case "cash":
      return "💵";

    case "credit_card":
      return "💳";

    case "savings":
      return "🏦";

    default:
      return "💰";
  }
}

function Account({
  id,
  icon,
  name,
  type,
  amount,
  negative = false,
  onDelete,
}: {
  id: string;
  icon: string;
  name: string;
  type: string;
  amount: number;
  negative?: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.account}>
      <View style={styles.accountLeft}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View>
          <Text style={styles.accountName}>
            {name}
          </Text>

          <Text style={styles.accountType}>
            {type}
          </Text>
        </View>
      </View>

      <View style={styles.accountRight}>
        <Text
          style={[
            styles.accountAmount,
            negative
              ? styles.negative
              : styles.positive,
          ]}
        >
          {amount < 0 ? "-₺" : "₺"}
          {Math.abs(amount).toLocaleString("tr-TR")}
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/edit-account",
                params: {
                  id,
                },
              })
            }
          >
            <Text style={styles.editText}>
              Düzenle
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => onDelete(id)}
          >
            <Text style={styles.deleteText}>
              Sil
            </Text>
          </Pressable>
        </View>
      </View>
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
    marginBottom: 22,
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

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EDEFF2",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A8492",
  },

  activeTabText: {
    color: "#17202A",
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
    gap: 20,
  },

  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
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

  accountRight: {
    alignItems: "flex-end",
  },

  accountAmount: {
    fontSize: 16,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  actionButton: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },

  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },

  deleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },

  positive: {
    color: "#22C55E",
  },

  negative: {
    color: "#FF8A3D",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 36,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7A8492",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 500,
  },

  emptyButton: {
    marginTop: 22,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});