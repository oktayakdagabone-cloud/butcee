import { Pressable, StyleSheet, Text, View } from "react-native";

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const [red, green, blue] =
    segment < 1 ? [chroma, x, 0] :
    segment < 2 ? [x, chroma, 0] :
    segment < 3 ? [0, chroma, x] :
    segment < 4 ? [0, x, chroma] :
    segment < 5 ? [x, 0, chroma] :
    [chroma, 0, x];
  const match = l - chroma / 2;
  const toHex = (value: number) =>
    Math.round((value + match) * 255).toString(16).padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

const PALETTE = Array.from(
  { length: 72 },
  (_, index) => hslToHex((index * 5) % 360, 78, 48 + (index % 3) * 7)
);

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
