import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const SIZE = 232;
const CENTER = SIZE / 2;
const RADIUS = 108;
const HUE_STEPS = 72;
const SATURATION_RINGS = 10;

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = hue / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const [red, green, blue] =
    section < 1 ? [chroma, x, 0] :
    section < 2 ? [x, chroma, 0] :
    section < 3 ? [0, chroma, x] :
    section < 4 ? [0, x, chroma] :
    section < 5 ? [x, 0, chroma] :
    [chroma, 0, x];
  const match = l - chroma / 2;
  const toHex = (value: number) =>
    Math.round((value + match) * 255).toString(16).padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function pointAt(angle: number, radius: number) {
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function wedgePath(start: number, end: number, inner: number, outer: number) {
  const outerStart = pointAt(start, outer);
  const outerEnd = pointAt(end, outer);

  if (inner === 0) {
    return `M ${CENTER} ${CENTER} L ${outerStart.x} ${outerStart.y} A ${outer} ${outer} 0 0 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  const innerEnd = pointAt(end, inner);
  const innerStart = pointAt(start, inner);
  return `M ${outerStart.x} ${outerStart.y} A ${outer} ${outer} 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${inner} ${inner} 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
}

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
  const scale = compact ? 0.78 : 1;

  return (
    <View style={styles.wrapper}>
      <Svg
        width={SIZE * scale}
        height={SIZE * scale}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        accessibilityLabel="Dairesel renk çarkı"
      >
        {Array.from({ length: SATURATION_RINGS }, (_, ring) =>
          Array.from({ length: HUE_STEPS }, (_, hueIndex) => {
            const start = -Math.PI / 2 + (hueIndex / HUE_STEPS) * Math.PI * 2;
            const end = -Math.PI / 2 + ((hueIndex + 1) / HUE_STEPS) * Math.PI * 2;
            const color = hslToHex(
              (hueIndex / HUE_STEPS) * 360,
              ((ring + 1) / SATURATION_RINGS) * 100,
              58 - ring * 0.9
            );

            return (
              <Path
                key={`${ring}-${hueIndex}`}
                d={wedgePath(
                  start,
                  end,
                  (ring / SATURATION_RINGS) * RADIUS,
                  ((ring + 1) / SATURATION_RINGS) * RADIUS
                )}
                fill={color}
                onPress={() => onSelect(color)}
              />
            );
          })
        )}

        <Circle
          cx={CENTER}
          cy={CENTER}
          r={15}
          fill={selected}
          stroke="#FFFFFF"
          strokeWidth={3}
          pointerEvents="none"
        />
      </Svg>

      <View style={[styles.selected, { backgroundColor: selected }]}>
        <Text style={styles.selectedText}>Seçili renk</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "flex-start" },
  selected: {
    marginTop: 8,
    minWidth: 116,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
