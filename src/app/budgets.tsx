import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useBudgets } from "./context/BudgetContext";
import { useCategories } from "./context/CategoryContext";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function BudgetsScreen() {
  const {
    budgets,
    deleteBudget,
  } = useBudgets();

  const { categories } =
    useCategories();

  const [deleteId, setDeleteId] =
    React.useState<string | null>(null);

  const [deleteName, setDeleteName] =
    React.useState<string>("");

  function getCategory(
    categoryId?: string,
    categoryName?: string
  ) {
    if (categoryId) {
      const foundById =
        categories.find(
          (category) =>
            category.id === categoryId
        );

      if (foundById) {
        return foundById;
      }
    }

    if (categoryName) {
      const foundByName =
        categories.find(
          (category) =>
            category.name === categoryName
        );

      if (foundByName) {
        return foundByName;
      }
    }

    return null;
  }

  function askDelete(
    id: string,
    name: string
  ) {
    setDeleteId(id);
    setDeleteName(name);
  }

  function cancelDelete() {
    setDeleteId(null);
    setDeleteName("");
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteBudget(deleteId);

    setDeleteId(null);
    setDeleteName("");
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>
            Bütçeler
          </Text>

          <Text style={styles.subtitle}>
            Harcamalarını kategori bazında
            kontrol et
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() =>
            router.push("/add-budget")
          }
        >
          <Text style={styles.addButtonText}>
            ＋ Bütçe Ekle
          </Text>
        </Pressable>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            ₺
          </Text>

          <Text style={styles.emptyTitle}>
            Henüz bütçe yok
          </Text>

          <Text style={styles.emptyText}>
            Harcamalarını kontrol etmek için
            ilk bütçeni oluştur.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() =>
              router.push("/add-budget")
            }
          >
            <Text
              style={styles.emptyButtonText}
            >
              İlk Bütçeyi Oluştur
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {budgets.map((budget) => {
            const percentage =
              budget.limit > 0
                ? (budget.spent /
                    budget.limit) *
                  100
                : 0;

            const progressWidth =
              Math.min(
                Math.max(percentage, 0),
                100
              );

            const remaining =
              budget.limit -
              budget.spent;

            const isOverBudget =
              remaining < 0;

            const isDeleting =
              deleteId === budget.id;

            const category =
              getCategory(
                budget.categoryId,
                budget.category
              );

            const categoryColor =
              category?.color ||
              "#3B82F6";

            const categoryIcon =
              category?.icon ||
              "dots-horizontal";

            const categoryName =
              category?.name ||
              budget.category ||
              "Kategorisiz";

            return (
              <View
                key={budget.id}
                style={styles.card}
              >
                <View
                  style={styles.cardHeader}
                >
                  <View
                    style={
                      styles.categoryInfo
                    }
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor:
                            categoryColor,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          categoryIcon as any
                        }
                        size={21}
                        color="#FFFFFF"
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.categoryName
                        }
                      >
                        {categoryName}
                      </Text>

                      <Text
                        style={
                          styles.monthText
                        }
                      >
                        {budget.month}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.actionButtons
                    }
                  >
                    <Pressable
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            "/edit-budget",
                          params: {
                            id: budget.id,
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        Düzenle
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        askDelete(
                          budget.id,
                          categoryName
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteButtonText
                        }
                      >
                        Sil
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={styles.amountRow}
                >
                  <View>
                    <Text
                      style={
                        styles.amountLabel
                      }
                    >
                      Harcanan
                    </Text>

                    <Text
                      style={
                        styles.spentAmount
                      }
                    >
                      ₺
                      {formatMoney(
                        budget.spent
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.amountRight
                    }
                  >
                    <Text
                      style={
                        styles.amountLabel
                      }
                    >
                      Limit
                    </Text>

                    <Text
                      style={
                        styles.limitAmount
                      }
                    >
                      ₺
                      {formatMoney(
                        budget.limit
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.progressTrack}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progressWidth}%`,
                        backgroundColor:
                          isOverBudget
                            ? "#EF4444"
                            : categoryColor,
                      },
                    ]}
                  />
                </View>

                <View
                  style={styles.bottomRow}
                >
                  <Text
                    style={
                      isOverBudget
                        ? styles.overBudgetText
                        : styles.remainingText
                    }
                  >
                    {isOverBudget
                      ? `₺${formatMoney(
                          Math.abs(
                            remaining
                          )
                        )} bütçe aşıldı`
                      : `₺${formatMoney(
                          remaining
                        )} kaldı`}
                  </Text>

                  <Text
                    style={styles.percentText}
                  >
                    %{Math.round(
                      percentage
                    )}
                  </Text>
                </View>

                {isDeleting && (
                  <View
                    style={
                      styles.confirmBox
                    }
                  >
                    <Text
                      style={
                        styles.confirmTitle
                      }
                    >
                      Bütçe silinsin mi?
                    </Text>

                    <Text
                      style={
                        styles.confirmText
                      }
                    >
                      “{deleteName}” bütçesi
                      kalıcı olarak
                      silinecek.
                    </Text>

                    <View
                      style={
                        styles.confirmButtons
                      }
                    >
                      <Pressable
                        style={
                          styles.cancelButton
                        }
                        onPress={
                          cancelDelete
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
                        style={
                          styles.confirmDeleteButton
                        }
                        onPress={
                          confirmDelete
                        }
                      >
                        <Text
                          style={
                            styles.confirmDeleteText
                          }
                        >
                          Evet, Sil
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 28,
    paddingBottom: 60,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#17202A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#7A8492",
  },

  addButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAF8EF",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 64,
    fontSize: 26,
    fontWeight: "800",
    color: "#22C55E",
    marginBottom: 18,
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
    maxWidth: 400,
    lineHeight: 21,
  },

  emptyButton: {
    marginTop: 22,
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  list: {
    gap: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9EDF2",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },

  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17202A",
  },

  monthText: {
    marginTop: 3,
    fontSize: 13,
    color: "#7A8492",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },

  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
  },

  editButtonText: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "700",
  },

  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#FEF2F2",
  },

  deleteButtonText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },

  amountRight: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 12,
    color: "#7A8492",
    marginBottom: 4,
  },

  spentAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#17202A",
  },

  limitAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7A8492",
  },

  progressTrack: {
    height: 9,
    backgroundColor: "#EEF1F4",
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 18,
  },

  progressBar: {
    height: "100%",
    borderRadius: 99,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  remainingText: {
    fontSize: 13,
    color: "#22C55E",
    fontWeight: "700",
  },

  overBudgetText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "700",
  },

  percentText: {
    fontSize: 13,
    color: "#7A8492",
    fontWeight: "700",
  },

  confirmBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  confirmTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17202A",
  },

  confirmText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#7A8492",
  },

  confirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },

  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DEE5",
  },

  cancelButtonText: {
    color: "#17202A",
    fontSize: 13,
    fontWeight: "700",
  },

  confirmDeleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#EF4444",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});