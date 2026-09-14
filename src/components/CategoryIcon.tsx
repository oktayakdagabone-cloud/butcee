import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export type CategoryIconName =
  | "home"
  | "car"
  | "food"
  | "silverware-fork-knife"
  | "shopping-bag"
  | "cart"
  | "wallet"
  | "credit-card"
  | "heart-pulse"
  | "pill"
  | "dumbbell"
  | "airplane"
  | "train"
  | "bus"
  | "gas-station"
  | "lightbulb"
  | "fire"
  | "water"
  | "wifi"
  | "phone"
  | "laptop"
  | "gift"
  | "school"
  | "book-open-variant"
  | "music"
  | "camera"
  | "gamepad-variant"
  | "tree"
  | "paw"
  | "leaf"
  | "briefcase"
  | "cash"
  | "cash-plus"
  | "chart-line"
  | "piggy-bank"
  | "bank"
  | "receipt"
  | "coffee"
  | "television"
  | "movie-open"
  | "bed"
  | "baby-face-outline"
  | "dog"
  | "cat"
  | "tools"
  | "hammer-wrench"
  | "washing-machine"
  | "parking"
  | "dots-horizontal";

export const CATEGORY_ICON_PACK: {
  name: CategoryIconName;
  label: string;
  group: string;
}[] = [
  {
    name: "home",
    label: "Ev",
    group: "Günlük",
  },
  {
    name: "car",
    label: "Araba",
    group: "Ulaşım",
  },
  {
    name: "bus",
    label: "Otobüs",
    group: "Ulaşım",
  },
  {
    name: "train",
    label: "Tren",
    group: "Ulaşım",
  },
  {
    name: "airplane",
    label: "Uçak",
    group: "Ulaşım",
  },
  {
    name: "gas-station",
    label: "Akaryakıt",
    group: "Ulaşım",
  },
  {
    name: "parking",
    label: "Park",
    group: "Ulaşım",
  },

  {
    name: "food",
    label: "Yemek",
    group: "Gıda",
  },
  {
    name: "silverware-fork-knife",
    label: "Restoran",
    group: "Gıda",
  },
  {
    name: "coffee",
    label: "Kahve",
    group: "Gıda",
  },

  {
    name: "shopping-bag",
    label: "Alışveriş",
    group: "Alışveriş",
  },
  {
    name: "cart",
    label: "Market",
    group: "Alışveriş",
  },
  {
    name: "gift",
    label: "Hediye",
    group: "Alışveriş",
  },

  {
    name: "heart-pulse",
    label: "Sağlık",
    group: "Sağlık",
  },
  {
    name: "pill",
    label: "İlaç",
    group: "Sağlık",
  },
  {
    name: "dumbbell",
    label: "Spor",
    group: "Sağlık",
  },

  {
    name: "lightbulb",
    label: "Elektrik",
    group: "Faturalar",
  },
  {
    name: "fire",
    label: "Doğalgaz",
    group: "Faturalar",
  },
  {
    name: "water",
    label: "Su",
    group: "Faturalar",
  },
  {
    name: "wifi",
    label: "İnternet",
    group: "Faturalar",
  },
  {
    name: "phone",
    label: "Telefon",
    group: "Faturalar",
  },
  {
    name: "washing-machine",
    label: "Ev Hizmeti",
    group: "Faturalar",
  },

  {
    name: "briefcase",
    label: "İş",
    group: "Finans",
  },
  {
    name: "cash",
    label: "Para",
    group: "Finans",
  },
  {
    name: "cash-plus",
    label: "Ek Gelir",
    group: "Finans",
  },
  {
    name: "chart-line",
    label: "Yatırım",
    group: "Finans",
  },
  {
    name: "piggy-bank",
    label: "Birikim",
    group: "Finans",
  },
  {
    name: "bank",
    label: "Banka",
    group: "Finans",
  },
  {
    name: "wallet",
    label: "Cüzdan",
    group: "Finans",
  },
  {
    name: "credit-card",
    label: "Kart",
    group: "Finans",
  },
  {
    name: "receipt",
    label: "Fiş",
    group: "Finans",
  },

  {
    name: "school",
    label: "Eğitim",
    group: "Yaşam",
  },
  {
    name: "book-open-variant",
    label: "Kitap",
    group: "Yaşam",
  },
  {
    name: "music",
    label: "Müzik",
    group: "Eğlence",
  },
  {
    name: "camera",
    label: "Fotoğraf",
    group: "Eğlence",
  },
  {
    name: "gamepad-variant",
    label: "Oyun",
    group: "Eğlence",
  },
  {
    name: "television",
    label: "Televizyon",
    group: "Eğlence",
  },
  {
    name: "movie-open",
    label: "Sinema",
    group: "Eğlence",
  },

  {
    name: "tree",
    label: "Doğa",
    group: "Diğer",
  },
  {
    name: "leaf",
    label: "Çevre",
    group: "Diğer",
  },
  {
    name: "paw",
    label: "Evcil Hayvan",
    group: "Diğer",
  },
  {
    name: "dog",
    label: "Köpek",
    group: "Diğer",
  },
  {
    name: "cat",
    label: "Kedi",
    group: "Diğer",
  },
  {
    name: "baby-face-outline",
    label: "Çocuk",
    group: "Diğer",
  },
  {
    name: "bed",
    label: "Konaklama",
    group: "Diğer",
  },
  {
    name: "tools",
    label: "Tamir",
    group: "Diğer",
  },
  {
    name: "hammer-wrench",
    label: "Bakım",
    group: "Diğer",
  },
  {
    name: "dots-horizontal",
    label: "Diğer",
    group: "Diğer",
  },
];

export function CategoryIcon({
  name,
  size = 24,
  color = "#17202A",
}: {
  name?: string;
  size?: number;
  color?: string;
}) {
  const validIcon =
    CATEGORY_ICON_PACK.some(
      (icon) => icon.name === name
    )
      ? name
      : "dots-horizontal";

  return (
    <MaterialCommunityIcons
      name={validIcon as any}
      size={size}
      color={color}
    />
  );
}

export function getCategoryIcon(
  name?: string
) {
  return (
    CATEGORY_ICON_PACK.find(
      (icon) => icon.name === name
    ) ??
    CATEGORY_ICON_PACK[
      CATEGORY_ICON_PACK.length - 1
    ]
  );
}
