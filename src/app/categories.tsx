import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ColorPalette } from "./components/ColorPalette";

import {
  CategoryType,
  useCategories,
} from "./context/CategoryContext";

const colors = [
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#FF8A3D",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#EAB308",
  "#14B8A6",
  "#64748B",
  "#F97316",
  "#A855F7",
];

const icons = [
  { name: "home", label: "Ev" },
  { name: "car", label: "Araba" },
  { name: "bus", label: "Otobüs" },
  { name: "train", label: "Tren" },
  { name: "airplane", label: "Uçak" },
  { name: "gas-station", label: "Akaryakıt" },
  { name: "parking", label: "Park" },
  { name: "food", label: "Yemek" },
  {
    name: "silverware-fork-knife",
    label: "Restoran",
  },
  { name: "coffee", label: "Kahve" },
  {
    name: "shopping-bag",
    label: "Alışveriş",
  },
  { name: "cart", label: "Market" },
  { name: "gift", label: "Hediye" },
  {
    name: "heart-pulse",
    label: "Sağlık",
  },
  { name: "pill", label: "İlaç" },
  { name: "dumbbell", label: "Spor" },
  {
    name: "lightbulb",
    label: "Elektrik",
  },
  { name: "fire", label: "Doğalgaz" },
  { name: "water", label: "Su" },
  { name: "wifi", label: "İnternet" },
  { name: "phone", label: "Telefon" },
  {
    name: "washing-machine",
    label: "Ev Hizmeti",
  },
  { name: "briefcase", label: "İş" },
  { name: "cash", label: "Para" },
  {
    name: "cash-plus",
    label: "Ek Gelir",
  },
  {
    name: "chart-line",
    label: "Yatırım",
  },
  {
    name: "piggy-bank",
    label: "Birikim",
  },
  { name: "bank", label: "Banka" },
  { name: "wallet", label: "Cüzdan" },
  {
    name: "credit-card",
    label: "Kart",
  },
  { name: "receipt", label: "Fiş" },
  { name: "school", label: "Eğitim" },
  {
    name: "book-open-variant",
    label: "Kitap",
  },
  { name: "music", label: "Müzik" },
  { name: "camera", label: "Fotoğraf" },
  {
    name: "gamepad-variant",
    label: "Oyun",
  },
  {
    name: "television",
    label: "Televizyon",
  },
  {
    name: "movie-open",
    label: "Sinema",
  },
  { name: "tree", label: "Doğa" },
  { name: "leaf", label: "Çevre" },
  { name: "paw", label: "Evcil Hayvan" },
  { name: "dog", label: "Köpek" },
  { name: "cat", label: "Kedi" },
  {
    name: "baby-face-outline",
    label: "Çocuk",
  },
  { name: "bed", label: "Konaklama" },
  { name: "tools", label: "Tamir" },
  {
    name: "hammer-wrench",
    label: "Bakım",
  },
  { name: "hamburger", label: "Fast Food" },
  { name: "pizza", label: "Pizza" },
  { name: "ice-cream", label: "Tatlı" },
  { name: "cake-variant", label: "Pasta" },
  { name: "fruit-cherries", label: "Manav" },
  { name: "beer", label: "İçecek" },
  { name: "basket", label: "Sepet" },
  { name: "store", label: "Mağaza" },
  { name: "tag", label: "İndirim" },
  { name: "tshirt-crew", label: "Giyim" },
  { name: "shoe-sneaker", label: "Ayakkabı" },
  { name: "laptop", label: "Bilgisayar" },
  { name: "cellphone", label: "Cep Telefonu" },
  { name: "headphones", label: "Kulaklık" },
  { name: "keyboard", label: "Klavye" },
  { name: "printer", label: "Yazıcı" },
  { name: "monitor", label: "Ekran" },
  { name: "camera-outline", label: "Kamera" },
  { name: "palette", label: "Sanat" },
  { name: "brush", label: "Hobi" },
  { name: "theater", label: "Tiyatro" },
  { name: "ticket-confirmation", label: "Bilet" },
  { name: "basketball", label: "Basketbol" },
  { name: "football", label: "Futbol" },
  { name: "tennis", label: "Tenis" },
  { name: "bike", label: "Bisiklet" },
  { name: "run", label: "Koşu" },
  { name: "meditation", label: "Meditasyon" },
  { name: "hospital", label: "Hastane" },
  { name: "stethoscope", label: "Doktor" },
  { name: "tooth-outline", label: "Diş" },
  { name: "account-group", label: "Aile" },
  { name: "handshake", label: "Bağış" },
  { name: "email-outline", label: "E-posta" },
  { name: "package-variant", label: "Kargo" },
  { name: "truck-delivery-outline", label: "Teslimat" },
  { name: "map-marker", label: "Konum" },
  { name: "road-variant", label: "Yol" },
  { name: "taxi", label: "Taksi" },
  { name: "ferry", label: "Vapur" },
  { name: "fuel", label: "Yakıt" },
  { name: "electric-switch", label: "Enerji" },
  { name: "solar-power", label: "Güneş" },
  { name: "home-city-outline", label: "Emlak" },
  { name: "key-variant", label: "Kira" },
  { name: "lock-outline", label: "Güvenlik" },
  { name: "umbrella", label: "Sigorta" },
  { name: "beach", label: "Tatil" },
  { name: "party-popper", label: "Kutlama" },
  { name: "airballoon", label: "Seyahat" },
  { name: "flower", label: "Çiçek" },
  { name: "sprout", label: "Bahçe" },
  { name: "recycle", label: "Geri Dönüşüm" },
  {
    name: "dots-horizontal",
    label: "Diğer",
  },
];

function Icon({
  name,
  size = 22,
  color = "#FFFFFF",
}: {
  name?: string;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons
      name={
        (name || "dots-horizontal") as any
      }
      size={size}
      color={color}
    />
  );
}

export default function CategoriesScreen() {
  const {
    getCategoriesByType,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [type, setType] =
    useState<CategoryType>("expense");

  const [newName, setNewName] =
    useState("");

  const [newColor, setNewColor] =
    useState(colors[0]);

  const [newIcon, setNewIcon] =
    useState("dots-horizontal");

  const [showNewIcons, setShowNewIcons] =
    useState(false);

  const [editId, setEditId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editColor, setEditColor] =
    useState(colors[0]);

  const [editIcon, setEditIcon] =
    useState("dots-horizontal");

  const [showEditIcons, setShowEditIcons] =
    useState(false);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const [deleteName, setDeleteName] =
    useState("");

  const categories =
    getCategoriesByType(type);

  function add() {
    const name = newName.trim();

    if (!name) {
      return;
    }

    const success = addCategory({
      name,
      type,
      color: newColor,
      icon: newIcon,
    });

    if (!success) {
      return;
    }

    setNewName("");
    setNewColor(colors[0]);
    setNewIcon("dots-horizontal");
    setShowNewIcons(false);
  }

  function startEdit(
    id: string,
    name: string,
    color: string,
    icon: string
  ) {
    setEditId(id);
    setEditName(name);
    setEditColor(
      color || colors[0]
    );
    setEditIcon(
      icon || "dots-horizontal"
    );
    setDeleteId(null);
    setShowEditIcons(false);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditColor(colors[0]);
    setEditIcon("dots-horizontal");
    setShowEditIcons(false);
  }

  function saveEdit() {
    if (!editId) {
      return;
    }

    const name = editName.trim();

    if (!name) {
      return;
    }

    const success =
      updateCategory(editId, {
        name,
        type,
        color: editColor,
        icon: editIcon,
      });

    if (success) {
      cancelEdit();
    }
  }

  function startDelete(
    id: string,
    name: string
  ) {
    setEditId(null);
    setShowEditIcons(false);
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

    deleteCategory(deleteId);
    cancelDelete();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Kategoriler
          </Text>

          <Text style={styles.subtitle}>
            Gelir ve gider kategorilerini
            kendin yönet.
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

      <View style={styles.typeRow}>
        <Pressable
          style={[
            styles.typeButton,
            type === "expense" &&
              styles.expenseActive,
          ]}
          onPress={() => {
            setType("expense");
            cancelEdit();
            cancelDelete();
            setShowNewIcons(false);
          }}
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

        <Pressable
          style={[
            styles.typeButton,
            type === "income" &&
              styles.incomeActive,
          ]}
          onPress={() => {
            setType("income");
            cancelEdit();
            cancelDelete();
            setShowNewIcons(false);
          }}
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Yeni Kategori
        </Text>

        <View style={styles.addRow}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
            placeholder={
              type === "expense"
                ? "Örn. Akaryakıt"
                : "Örn. Freelance"
            }
            placeholderTextColor="#AEB4BC"
          />

          <Pressable
            style={[
              styles.addButton,
              !newName.trim() &&
                styles.disabled,
            ]}
            disabled={!newName.trim()}
            onPress={add}
          >
            <Text
              style={styles.addButtonText}
            >
              Ekle
            </Text>
          </Pressable>
        </View>

        <Text style={styles.optionLabel}>
          Kategori Rengi
        </Text>

        <Text style={styles.colorHint}>
          Bir renge dokunarak seç.
        </Text>

        <ColorPalette selected={newColor} onSelect={setNewColor} />

        <Text style={styles.optionLabel}>
          Kategori İkonu
        </Text>

        <Pressable
          style={styles.iconSelector}
          onPress={() =>
            setShowNewIcons(
              (value) => !value
            )
          }
        >
          <View
            style={[
              styles.iconPreview,
              {
                backgroundColor:
                  newColor,
              },
            ]}
          >
            <Icon name={newIcon} />
          </View>

          <View
            style={styles.iconSelectorText}
          >
            <Text
              style={styles.iconTitle}
            >
              {
                icons.find(
                  (item) =>
                    item.name === newIcon
                )?.label
              }
            </Text>

            <Text
              style={styles.iconSubtitle}
            >
              Seçmek için dokun
            </Text>
          </View>

          <Text style={styles.arrow}>
            {showNewIcons
              ? "▲"
              : "▼"}
          </Text>
        </Pressable>

        {showNewIcons && (
          <IconPicker
            selected={newIcon}
            onSelect={(value) => {
              setNewIcon(value);
              setShowNewIcons(false);
            }}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {type === "expense"
            ? "Gider Kategorileri"
            : "Gelir Kategorileri"}
        </Text>

        {categories.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Henüz kategori yok
            </Text>

            <Text style={styles.emptyText}>
              Yukarıdaki alandan yeni bir
              kategori oluşturabilirsin.
            </Text>
          </View>
        ) : (
          categories.map((category) => {
            const editing =
              editId === category.id;

            const deleting =
              deleteId === category.id;

            return (
              <View
                key={category.id}
                style={styles.itemWrapper}
              >
                <View
                  style={styles.item}
                >
                  {editing ? (
                    <View
                      style={styles.editArea}
                    >
                      <TextInput
                        value={editName}
                        onChangeText={
                          setEditName
                        }
                        style={
                          styles.editInput
                        }
                        autoFocus
                      />

                      <Text
                        style={
                          styles.optionLabel
                        }
                      >
                        Renk
                      </Text>

                      <Text style={styles.colorHint}>
                        Bir renge dokunarak seç.
                      </Text>

                      <ColorPalette
                        selected={editColor}
                        onSelect={setEditColor}
                        compact
                      />

                      <Text
                        style={
                          styles.optionLabel
                        }
                      >
                        İkon
                      </Text>

                      <Pressable
                        style={
                          styles.iconSelector
                        }
                        onPress={() =>
                          setShowEditIcons(
                            (value) =>
                              !value
                          )
                        }
                      >
                        <View
                          style={[
                            styles.iconPreview,
                            {
                              backgroundColor:
                                editColor,
                            },
                          ]}
                        >
                          <Icon
                            name={
                              editIcon
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.iconSelectorText
                          }
                        >
                          <Text
                            style={
                              styles.iconTitle
                            }
                          >
                            {
                              icons.find(
                                (
                                  item
                                ) =>
                                  item.name ===
                                  editIcon
                              )?.label
                            }
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.arrow
                          }
                        >
                          {showEditIcons
                            ? "▲"
                            : "▼"}
                        </Text>
                      </Pressable>

                      {showEditIcons && (
                        <IconPicker
                          selected={
                            editIcon
                          }
                          onSelect={(
                            value
                          ) => {
                            setEditIcon(
                              value
                            );
                            setShowEditIcons(
                              false
                            );
                          }}
                        />
                      )}
                    </View>
                  ) : (
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
                              category.color ||
                              colors[0],
                          },
                        ]}
                      >
                        <Icon
                          name={
                            category.icon
                          }
                          size={20}
                        />
                      </View>

                      <Text
                        style={
                          styles.categoryName
                        }
                      >
                        {category.name}
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.actions
                    }
                  >
                    {editing ? (
                      <>
                        <Pressable
                          style={
                            styles.saveButton
                          }
                          onPress={
                            saveEdit
                          }
                        >
                          <Text
                            style={
                              styles.saveText
                            }
                          >
                            Kaydet
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.cancelButton
                          }
                          onPress={
                            cancelEdit
                          }
                        >
                          <Text
                            style={
                              styles.cancelText
                            }
                          >
                            İptal
                          </Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable
                          style={
                            styles.editButton
                          }
                          onPress={() =>
                            startEdit(
                              category.id,
                              category.name,
                              category.color,
                              category.icon
                            )
                          }
                        >
                          <Text
                            style={
                              styles.editText
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
                            startDelete(
                              category.id,
                              category.name
                            )
                          }
                        >
                          <Text
                            style={
                              styles.deleteText
                            }
                          >
                            Sil
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>

                {deleting && (
                  <View
                    style={
                      styles.confirmBox
                    }
                  >
                    <View
                      style={
                        styles.confirmInfo
                      }
                    >
                      <Text
                        style={
                          styles.confirmTitle
                        }
                      >
                        Kategori silinsin mi?
                      </Text>

                      <Text
                        style={
                          styles.confirmText
                        }
                      >
                        "{deleteName}"
                        kategorisi
                        silinecek.
                      </Text>
                    </View>

                    <View
                      style={
                        styles.confirmActions
                      }
                    >
                      <Pressable
                        style={
                          styles.cancelDelete
                        }
                        onPress={
                          cancelDelete
                        }
                      >
                        <Text
                          style={
                            styles.cancelDeleteText
                          }
                        >
                          Vazgeç
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.confirmDelete
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
          })
        )}
      </View>
    </ScrollView>
  );
}

function IconPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (
    value: string
  ) => void;
}) {
  const [search, setSearch] =
    useState("");

  const filtered =
    icons.filter((icon) =>
      icon.label
        .toLocaleLowerCase("tr-TR")
        .includes(
          search.toLocaleLowerCase(
            "tr-TR"
          )
        )
    );

  return (
    <View style={styles.iconPicker}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        placeholder="İkon ara..."
        placeholderTextColor="#AEB4BC"
      />

      <View style={styles.iconGrid}>
        {filtered.map((icon) => {
          const active =
            selected === icon.name;

          return (
            <Pressable
              key={icon.name}
              style={[
                styles.iconOption,
                active &&
                  styles.iconOptionActive,
              ]}
              onPress={() =>
                onSelect(icon.name)
              }
            >
              <Icon
                name={icon.name}
                size={27}
                color={
                  active
                    ? "#FFFFFF"
                    : "#17202A"
                }
              />
            </Pressable>
          );
        })}
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
    maxWidth: 850,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#17202A",
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
  },

  typeButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7EC",
    justifyContent: "center",
    alignItems: "center",
  },

  expenseActive: {
    backgroundColor: "#FF8A3D",
    borderColor: "#FF8A3D",
  },

  incomeActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },

  typeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#7A8492",
  },

  activeTypeText: {
    color: "#FFFFFF",
  },

  card: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17202A",
    marginBottom: 14,
  },

  addRow: {
    flexDirection: "row",
    gap: 10,
  },

  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#17202A",
  },

  addButton: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: "#17202A",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.35,
  },

  optionLabel: {
    marginTop: 18,
    marginBottom: 9,
    fontSize: 13,
    fontWeight: "700",
    color: "#17202A",
  },

  colorHint: {
    marginTop: -4,
    marginBottom: 10,
    color: "#7A8492",
    fontSize: 12,
  },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  colorSelected: {
    borderColor: "#17202A",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  colorOptionSmall: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  checkSmall: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  iconSelector: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconPreview: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  iconSelectorText: {
    flex: 1,
  },

  iconTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#17202A",
  },

  iconSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#7A8492",
  },

  arrow: {
    fontSize: 14,
    color: "#7A8492",
  },

  iconPicker: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    backgroundColor: "#F9FAFB",
  },

  search: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E7EC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#17202A",
    marginBottom: 12,
  },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  iconOption: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EBEF",
    alignItems: "center",
    justifyContent: "center",
  },

  iconOptionActive: {
    backgroundColor: "#17202A",
    borderColor: "#17202A",
  },

  itemWrapper: {
    marginBottom: 8,
  },

  item: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: "#E8EBEF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  categoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#17202A",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  editButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
  },

  editText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17202A",
  },

  deleteButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFF1F1",
  },

  deleteText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },

  editArea: {
    flex: 1,
  },

  editInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#17202A",
  },

  saveButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#22C55E",
  },

  saveText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cancelButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
  },

  cancelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17202A",
  },

  confirmBox: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  confirmInfo: {
    flex: 1,
  },

  confirmTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B",
  },

  confirmText: {
    marginTop: 3,
    fontSize: 12,
    color: "#7A8492",
  },

  confirmActions: {
    flexDirection: "row",
    gap: 6,
  },

  cancelDelete: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7EC",
  },

  cancelDeleteText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17202A",
  },

  confirmDelete: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#DC2626",
  },

  confirmDeleteText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  empty: {
    paddingVertical: 28,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17202A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#7A8492",
    textAlign: "center",
  },
});
