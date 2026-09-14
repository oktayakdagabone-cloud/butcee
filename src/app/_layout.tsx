import {
  Stack,
  router,
} from "expo-router";

import { useState } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { AccountProvider } from "./context/AccountContext";
import { BudgetProvider } from "./context/BudgetContext";
import { CardProvider } from "./context/CardContext";
import { CategoryProvider } from "./context/CategoryContext";
import { FixedExpenseProvider } from "./context/FixedExpenseContext";
import { NotificationProvider } from "./context/NotificationContext";
import { InstallmentProvider } from "./context/InstallmentContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { TransactionProvider } from "./context/TransactionContext";
import { setActiveStorageUser } from "../lib/userStorage";

const PERSONAL_PASSWORD = "Jacksakalov77";

type NavigationItem = {
  href:
    | "/"
    | "/explore"
    | "/accounts"
    | "/cards"
    | "/budgets"
    | "/categories"
    | "/subscriptions"
    | "/fixed-expenses"
    | "/installments"
    | "/reports";
  label: string;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Ana Sayfa",
  },
  {
    href: "/explore",
    label: "İşlemler",
  },
  {
    href: "/accounts",
    label: "Hesaplar",
  },
  {
    href: "/cards",
    label: "Kartlar",
  },
  {
    href: "/budgets",
    label: "Bütçeler",
  },
  {
    href: "/categories",
    label: "Kategoriler",
  },
  {
    href: "/subscriptions",
    label: "Abonelikler",
  },
  {
    href: "/fixed-expenses",
    label: "Sabit Giderler",
  },
  {
    href: "/installments",
    label: "Taksitler",
  },
  {
    href: "/reports",
    label: "Raporlar",
  },
];

function Header() {
  const { width } = useWindowDimensions();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const isDesktop = width >= 1160;

  function navigateTo(
    href: NavigationItem["href"] | "/add-transaction"
  ) {
    setIsMenuOpen(false);
    router.push(href);
  }

  return (
    <>
      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ana sayfaya git"
          hitSlop={8}
          onPress={() =>
            navigateTo("/")
          }
        >
          <Text
            style={
              styles.logo
            }
          >
            Bütçe
          </Text>
        </Pressable>

        {isDesktop ? (
          <View
            style={
              styles.desktopMenu
            }
          >
            {navigationItems.map(
              (item) => (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() =>
                    navigateTo(item.href)
                  }
                >
                  <Text
                    style={
                      styles.menuText
                    }
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigateTo(
                  "/add-transaction"
                )
              }
              style={
                styles.desktopAddButton
              }
            >
              <Text
                style={
                  styles.addText
                }
              >
                ＋ İşlem Ekle
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isMenuOpen
                ? "Menüyü kapat"
                : "Menüyü aç"
            }
            onPress={() =>
              setIsMenuOpen(
                (current) => !current
              )
            }
            style={
              styles.menuButton
            }
          >
            <Text
              style={
                styles.menuButtonIcon
              }
            >
              {isMenuOpen ? "×" : "☰"}
            </Text>

            <Text
              style={
                styles.menuButtonText
              }
            >
              Menü
            </Text>
          </Pressable>
        )}
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() =>
          setIsMenuOpen(false)
        }
        transparent
        visible={!isDesktop && isMenuOpen}
      >
        <View
          style={
            styles.mobileMenuOverlay
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Menüyü kapat"
            onPress={() =>
              setIsMenuOpen(false)
            }
            style={
              styles.mobileMenuBackdrop
            }
          />

          <View
            style={
              styles.mobileMenuPanel
            }
          >
            <View
              style={
                styles.mobileMenuHeader
              }
            >
              <Text
                style={
                  styles.mobileMenuTitle
                }
              >
                Bütçe
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Menüyü kapat"
                onPress={() =>
                  setIsMenuOpen(false)
                }
                style={
                  styles.closeButton
                }
              >
                <Text
                  style={
                    styles.closeButtonText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigateTo(
                  "/add-transaction"
                )
              }
              style={
                styles.mobileAddButton
              }
            >
              <Text
                style={
                  styles.mobileAddButtonText
                }
              >
                ＋ İşlem Ekle
              </Text>
            </Pressable>

            <View
              style={
                styles.mobileMenuList
              }
            >
              {navigationItems.map(
                (item) => (
                  <Pressable
                    key={item.href}
                    accessibilityRole="button"
                    onPress={() =>
                      navigateTo(item.href)
                    }
                    style={
                      styles.mobileMenuItem
                    }
                  >
                    <Text
                      style={
                        styles.mobileMenuItemText
                      }
                    >
                      {item.label}
                    </Text>

                    <Text
                      style={
                        styles.mobileMenuArrow
                      }
                    >
                      ›
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function RootLayout() {
  return <ProtectedLayout />;
}

function ProtectedLayout() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PersonalLock onUnlock={() => setUnlocked(true)} />;
  }

  setActiveStorageUser("personal-local");

  return (
    <NotificationProvider key="personal-local">
      <CategoryProvider>
        <AccountProvider>
          <CardProvider>
            <BudgetProvider>
              <SubscriptionProvider>
              <FixedExpenseProvider>
                <InstallmentProvider>
                  <TransactionProvider>
                    <Stack
                      screenOptions={{
                        header: () => (
                          <Header />
                        ),
                      }}
                    />
                  </TransactionProvider>
                </InstallmentProvider>
              </FixedExpenseProvider>
              </SubscriptionProvider>
            </BudgetProvider>
          </CardProvider>
        </AccountProvider>
      </CategoryProvider>
    </NotificationProvider>
  );
}

function PersonalLock({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function unlock() {
    if (password === PERSONAL_PASSWORD) {
      setError("");
      onUnlock();
      return;
    }

    setError("Şifre yanlış.");
    setPassword("");
  }

  return (
    <View style={styles.lockScreen}>
      <View style={styles.lockCard}>
        <Text style={styles.lockLogo}>Bütçe</Text>
        <Text style={styles.lockTitle}>Şifre gerekli</Text>
        <Text style={styles.lockText}>Devam etmek için şifreni gir.</Text>
        <View style={styles.lockInputRow}>
          <TextInput
            value={password}
            onChangeText={(value) => { setPassword(value); setError(""); }}
            onSubmitEditing={unlock}
            secureTextEntry={!showPassword}
            placeholder="Şifre"
            placeholderTextColor="#94A3B8"
            style={styles.lockInput}
          />
          <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.lockShowButton}>
            <Text style={styles.lockShowText}>{showPassword ? "Gizle" : "Göster"}</Text>
          </Pressable>
        </View>
        {!!error && <Text style={styles.lockError}>{error}</Text>}
        <Pressable onPress={unlock} style={styles.lockButton}>
          <Text style={styles.lockButtonText}>Giriş yap</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    header: {
      minHeight: 68,
      paddingHorizontal: 24,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#ECEFF3",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 16,
    },

    logo: {
      fontSize: 24,
      fontWeight:
        "900",
      color:
        "#17202A",
    },

    desktopMenu: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "flex-end",
      gap: 14,
    },

    menuText: {
      fontSize: 12,
      fontWeight:
        "700",
      color:
        "#59636F",
    },

    addText: {
      fontSize: 12,
      fontWeight:
        "900",
      color:
        "#22C55E",
    },

    desktopAddButton: {
      minHeight: 40,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: "#F0FDF4",
      alignItems: "center",
      justifyContent: "center",
    },

    menuButton: {
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor: "#F3F5F7",
    },

    menuButtonIcon: {
      fontSize: 20,
      lineHeight: 22,
      fontWeight: "700",
      color: "#17202A",
    },

    menuButtonText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#17202A",
    },

    mobileMenuOverlay: {
      flex: 1,
      flexDirection: "row",
    },

    mobileMenuBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(23, 32, 42, 0.4)",
    },

    mobileMenuPanel: {
      width: "86%",
      maxWidth: 360,
      minHeight: "100%",
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 32,
      backgroundColor: "#FFFFFF",
      shadowColor: "#000000",
      shadowOffset: {
        width: 4,
        height: 0,
      },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 12,
    },

    mobileMenuHeader: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    mobileMenuTitle: {
      fontSize: 25,
      fontWeight: "900",
      color: "#17202A",
    },

    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F3F5F7",
    },

    closeButtonText: {
      fontSize: 27,
      lineHeight: 30,
      color: "#17202A",
    },

    mobileAddButton: {
      minHeight: 50,
      marginTop: 24,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#22C55E",
    },

    mobileAddButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    mobileMenuList: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#E9EDF2",
    },

    mobileMenuItem: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: "#E9EDF2",
    },

    mobileMenuItemText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#334155",
    },

    mobileMenuArrow: {
      fontSize: 25,
      lineHeight: 28,
      color: "#94A3B8",
    },

    lockScreen: { flex: 1, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", padding: 24 },
    lockCard: { width: "100%", maxWidth: 420, padding: 24, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" },
    lockLogo: { fontSize: 26, fontWeight: "900", color: "#17202A" },
    lockTitle: { marginTop: 24, fontSize: 24, fontWeight: "900", color: "#17202A" },
    lockText: { marginTop: 6, color: "#64748B" },
    lockInputRow: { minHeight: 52, marginTop: 18, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, flexDirection: "row", alignItems: "center" },
    lockInput: { flex: 1, minHeight: 50, paddingHorizontal: 14, color: "#17202A" },
    lockShowButton: { minHeight: 50, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
    lockShowText: { color: "#2563EB", fontWeight: "800", fontSize: 13 },
    lockError: { marginTop: 10, color: "#B91C1C", fontWeight: "700" },
    lockButton: { minHeight: 52, marginTop: 18, borderRadius: 12, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" },
    lockButtonText: { color: "#FFFFFF", fontWeight: "900" },
  });
