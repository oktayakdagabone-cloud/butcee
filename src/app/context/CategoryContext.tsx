import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "../../lib/userStorage";

export type CategoryType =
  | "income"
  | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
};

type NewCategory = Omit<
  Category,
  "id"
>;

type CategoryContextType = {
  categories: Category[];

  addCategory: (
    category: NewCategory
  ) => boolean;

  updateCategory: (
    id: string,
    category: NewCategory
  ) => boolean;

  deleteCategory: (
    id: string
  ) => void;

  getCategoriesByType: (
    type: CategoryType
  ) => Category[];
};

const CategoryContext =
  createContext<CategoryContextType | null>(
    null
  );

const CATEGORIES_STORAGE_KEY =
  "@butce_categories";

const DEFAULT_COLOR = "#3B82F6";
const DEFAULT_ICON = "dots-horizontal";

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "income_salary",
    name: "Maaş",
    type: "income",
    color: "#22C55E",
    icon: "cash",
  },
  {
    id: "income_extra",
    name: "Ek Gelir",
    type: "income",
    color: "#3B82F6",
    icon: "cash-plus",
  },
  {
    id: "income_investment",
    name: "Yatırım",
    type: "income",
    color: "#8B5CF6",
    icon: "chart-line",
  },
  {
    id: "income_other",
    name: "Diğer",
    type: "income",
    color: "#FFD166",
    icon: "dots-horizontal",
  },
  {
    id: "expense_food",
    name: "Gıda",
    type: "expense",
    color: "#FF8A3D",
    icon: "food",
  },
  {
    id: "expense_transport",
    name: "Ulaşım",
    type: "expense",
    color: "#3B82F6",
    icon: "car",
  },
  {
    id: "expense_bills",
    name: "Faturalar",
    type: "expense",
    color: "#EF4444",
    icon: "receipt",
  },
  {
    id: "expense_shopping",
    name: "Alışveriş",
    type: "expense",
    color: "#8B5CF6",
    icon: "shopping-bag",
  },
  {
    id: "expense_health",
    name: "Sağlık",
    type: "expense",
    color: "#EC4899",
    icon: "heart-pulse",
  },
  {
    id: "expense_other",
    name: "Diğer",
    type: "expense",
    color: "#64748B",
    icon: "dots-horizontal",
  },
];

export function CategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] =
    useState<Category[]>(
      DEFAULT_CATEGORIES
    );

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const savedCategories =
          await AsyncStorage.getItem(
            CATEGORIES_STORAGE_KEY
          );

        if (savedCategories) {
          const parsedCategories =
            JSON.parse(
              savedCategories
            );

          const normalizedCategories =
            parsedCategories.map(
              (category: any) => ({
                ...category,

                color:
                  category.color ??
                  DEFAULT_COLOR,

                icon:
                  category.icon ??
                  DEFAULT_ICON,
              })
            );

          setCategories(
            normalizedCategories
          );
        }
      } catch (error) {
        console.log(
          "Kategoriler yüklenemedi:",
          error
        );
      } finally {
        setIsLoaded(true);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveCategories() {
      try {
        await AsyncStorage.setItem(
          CATEGORIES_STORAGE_KEY,
          JSON.stringify(categories)
        );
      } catch (error) {
        console.log(
          "Kategoriler kaydedilemedi:",
          error
        );
      }
    }

    saveCategories();
  }, [categories, isLoaded]);

  function addCategory(
    category: NewCategory
  ): boolean {
    const trimmedName =
      category.name.trim();

    if (!trimmedName) {
      return false;
    }

    const alreadyExists =
      categories.some(
        (item) =>
          item.type === category.type &&
          item.name.toLocaleLowerCase(
            "tr-TR"
          ) ===
            trimmedName.toLocaleLowerCase(
              "tr-TR"
            )
      );

    if (alreadyExists) {
      return false;
    }

    const newCategory: Category = {
      ...category,

      id: `${category.type}_${Date.now()}`,

      name: trimmedName,

      color:
        category.color ||
        DEFAULT_COLOR,

      icon:
        category.icon ||
        DEFAULT_ICON,
    };

    setCategories((current) => [
      ...current,
      newCategory,
    ]);

    return true;
  }

  function updateCategory(
    id: string,
    category: NewCategory
  ): boolean {
    const trimmedName =
      category.name.trim();

    if (!trimmedName) {
      return false;
    }

    const alreadyExists =
      categories.some(
        (item) =>
          item.id !== id &&
          item.type === category.type &&
          item.name.toLocaleLowerCase(
            "tr-TR"
          ) ===
            trimmedName.toLocaleLowerCase(
              "tr-TR"
            )
      );

    if (alreadyExists) {
      return false;
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...category,
              name: trimmedName,
              color:
                category.color ||
                item.color ||
                DEFAULT_COLOR,
              icon:
                category.icon ||
                item.icon ||
                DEFAULT_ICON,
            }
          : item
      )
    );

    return true;
  }

  function deleteCategory(
    id: string
  ) {
    setCategories((current) =>
      current.filter(
        (category) =>
          category.id !== id
      )
    );
  }

  function getCategoriesByType(
    type: CategoryType
  ) {
    return categories.filter(
      (category) =>
        category.type === type
    );
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoriesByType,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context =
    useContext(CategoryContext);

  if (!context) {
    throw new Error(
      "useCategories must be used inside CategoryProvider"
    );
  }

  return context;
}
