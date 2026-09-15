import { Pressable, StyleSheet, Text, View } from "react-native";

/* Her biri görsel olarak net ayırt edilen ana renkler. */
const PALETTE = [
  "#17202A", "#64748B", "#92400E", "#B91C1C", "#E11D48",
  "#DB2777", "#C026D3", "#7E22CE", "#6D28D9", "#4F46E5",
  "#1D4ED8", "#0284C7", "#0891B2", "#0F766E", "#047857",
  "#16A34A", "#65A30D", "#A3A30A", "#CA8A04", "#EA580C",
];

type ColorPaletteProps = {
  selected: string;
  onSelect: (color: string) => void;
  compact?: boolean;
};

export function ColorPalette({
  selected,
  onSelect,
  compact = false,
}: ColorPaletteProps) {
  const options = PALETTE.includes(selected) ? PALETTE : [selected, ...PALETTE];

  return (
    <View style={styles.grid}>
      {options.map((color) => {
        const active = selected === color;

        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`${color} rengini seç`}
            style={[
              styles.option,
              compact && styles.optionCompact,
              { backgroundColor: color },
              active && styles.active,
            ]}
            onPress={() => onSelect(color)}
          >
            {active && <Text style={compact ? styles.checkCompact : styles.check}>✓</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  optionCompact: { width: 26, height: 26, borderRadius: 13 },
  active: { borderColor: "#17202A", borderWidth: 3 },
  check: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  checkCompact: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
