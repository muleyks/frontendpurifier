import React, { useRef, useEffect, useState, createContext, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, Ellipse } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

// ─── Palette (from design images) ────────────────────────────────────────────
const CREAM = "#DDD7C1";
const CREAM_RGB = "221,215,193";
const FAN_CREAM_RGB = CREAM_RGB;
const FAN_HUB = CREAM;

const pal = {
  teal:        "#4A8B7A",
  khaki:       "#C5BC8A",
  mauve:       "#B08D8D",
  purple:      "#744C8B",
  terracotta:  "#C87050",
  burgundy:    "#8B2535",
  white:       CREAM,
  w88:         `rgba(${CREAM_RGB},0.88)`,
  w70:         `rgba(${CREAM_RGB},0.70)`,
  w55:         `rgba(${CREAM_RGB},0.55)`,
  w30:         `rgba(${CREAM_RGB},0.30)`,
  glass:       `rgba(${CREAM_RGB},0.10)`,
  glassBorder: `rgba(${CREAM_RGB},0.16)`,
};

// ─── Gradient Presets ─────────────────────────────────────────────────────────
// G_TEAL: Dashboard, Analytics, Filter — dark teal with visible depth
const G_TEAL     = ["#5E9E8C", "#246B58", "#082818"];
// G_WARM: Auth / Onboarding — warm khaki-brown
const G_WARM     = ["#7A6E50", "#3C2E18", "#160E04"];
// G_BURGUNDY: Aroma — deep red
const G_BURGUNDY = ["#8B2535", "#4D1020", "#1A0508"];
// G_NEUTRAL: Settings, Firmware, Pairing — dark neutral
const G_NEUTRAL  = ["#303830", "#161E18", "#060908"];
// G_PURPLE: Optional accent
const G_PURPLE   = ["#5C3870", "#2E1840", "#120A1C"];
// G_AUTH: AuthChoice — teal → mauve → deep purple
const G_AUTH     = [pal.teal, pal.mauve, "#743058"];
// G_MAUVE: Dashboard Welcome Home — soft mauve depth
const G_MAUVE    = ["#C4A8A8", pal.mauve, "#3D2838"];
// G_QUALITY: Air Quality & Filter — terracotta → teal → dusty mauve
const G_QUALITY  = ["#DA7A59", "#4AACA9", "#BC9898"];
// G_TERRACOTTA: Settings flow — warm terracotta ombre
const G_TERRACOTTA = [pal.terracotta, "#A87D68", "#4A3428"];
// G_TEAL_OMBRE: Fan Control — bright teal → deep forest
const G_TEAL_OMBRE = ["#4AACA9", pal.teal, "#082818"];

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = [
  "Welcome",
  "Dashboard",
  "Language",
  "AuthChoice",
  "SignIn",
  "CreateAccount",
  "VerifyEmail",
  "CreatePassword",
  "AccountCreated",
  "ForgotPassword",
  "ResetEmailSent",
  "PasswordResetSuccess",
  "AddDevice",
  "DeviceFound",
  "WifiCredentials",
  "PairingProgress",
  "PairingSuccess",
  "PairingError",
  "FanControl",
  "SleepMode",
  "FilterMaintenance",
  "ReplaceFilter",
  "Analytics",
  "Automation",
  "CustomAutomation",
  "Settings",
  "Aroma",
  "DeviceManagement",
  "Notifications",
  "FirmwareAvailable",
  "FirmwareUpdating",
  "FirmwareComplete",
  "UserProfile",
];

// ─── Layout Components ────────────────────────────────────────────────────────
function DarkScreen({ children, gradient = G_NEUTRAL, padded = true, scroll = true }) {
  const isQuality = gradient === G_QUALITY || gradient === G_TERRACOTTA;
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[
        { gap: 14, paddingBottom: 32 },
        padded && { paddingHorizontal: 22, paddingTop: 20 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded && { paddingHorizontal: 22, paddingTop: 20 }]}>
      {children}
    </View>
  );
  return (
    <LinearGradient
      colors={gradient}
      locations={isQuality ? [0, 0.5, 1] : undefined}
      style={{ flex: 1 }}
      start={isQuality ? { x: 0.05, y: 0 } : { x: 0.3, y: 0 }}
      end={isQuality ? { x: 0.95, y: 1 } : { x: 0.7, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        {inner}
      </SafeAreaView>
    </LinearGradient>
  );
}

function DarkHeader({ title, subtitle, navigation }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
      {navigation && (
        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pal.glassBorder }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={18} color={pal.w88} />
        </TouchableOpacity>
      )}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: pal.w55, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function GlassButton({ label, onPress, filled = false, color = pal.teal }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
        filled
          ? { backgroundColor: color }
          : { backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder },
      ]}
      onPress={onPress}
    >
      <Text style={{ color: pal.white, fontWeight: "700", fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const MAUVE_BTN_TEXT = "#2A1A1A";

function MauveOmbreButton({ label, onPress }) {
  return (
    <View style={{ width: "100%" }}>
      <LinearGradient
        colors={["rgba(22,14,4,0)", "rgba(176,141,141,0.18)", "rgba(176,141,141,0.45)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ borderRadius: 26, paddingTop: 14, paddingBottom: 2, paddingHorizontal: 2 }}
      >
        <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
          <LinearGradient
            colors={["rgba(60,46,24,0.2)", "rgba(176,141,141,0.65)", pal.mauve, "#C4A0A0"]}
            locations={[0, 0.35, 0.7, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{ borderRadius: 22, padding: 2 }}
          >
            <LinearGradient
              colors={["#7A5C5C", pal.mauve, "#C9AAAA"]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={{ height: 50, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: MAUVE_BTN_TEXT, fontWeight: "700", fontSize: 15, letterSpacing: 0.5 }}>{label}</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

function SoftTerracottaOmbreButton({ label, onPress }) {
  return (
    <View style={{ width: "100%" }}>
      <LinearGradient
        colors={["rgba(22,14,4,0)", "rgba(176,130,110,0.08)", "rgba(176,130,110,0.22)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ borderRadius: 26, paddingTop: 14, paddingBottom: 2, paddingHorizontal: 2 }}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <LinearGradient
            colors={["rgba(60,46,24,0.12)", "rgba(168,125,104,0.38)", "#A87D68", CREAM]}
            locations={[0, 0.4, 0.72, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{ borderRadius: 22, padding: 2 }}
          >
            <LinearGradient
              colors={["#7A5E52", "#A87D68", CREAM]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={{ height: 50, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: CREAM, fontWeight: "600", fontSize: 15, letterSpacing: 0.4 }}>{label}</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

function GlassCard({ children, style }) {
  return (
    <View style={[{ backgroundColor: pal.glass, borderRadius: 20, borderWidth: 1, borderColor: pal.glassBorder, padding: 16, gap: 10 }, style]}>
      {children}
    </View>
  );
}

function GlassField({ label, value = "", onChangeText, placeholder, secure, keyboardType, autoCapitalize = "none", editable }) {
  const canEdit = editable ?? onChangeText != null;
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: pal.w55, fontSize: 12, fontWeight: "600" }}>{label}</Text> : null}
      <View style={{ height: 50, borderRadius: 14, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, justifyContent: "center" }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={canEdit}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={{ color: pal.w88, fontSize: 14, padding: 0 }}
          placeholderTextColor={pal.w30}
        />
      </View>
    </View>
  );
}

function DarkRow({ icon, title, value, onPress, danger }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{ height: 60, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={20} color={danger ? "#C84545" : pal.teal} />
      <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600" }}>{title}</Text>
      {value ? <Text style={{ color: pal.w55, fontSize: 12 }}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={15} color={pal.w30} />
    </TouchableOpacity>
  );
}

function Toggle({ on = true, activeColor = pal.teal, onPress }) {
  const track = (
    <View style={[{ width: 48, height: 28, borderRadius: 14, padding: 3 }, on ? { backgroundColor: activeColor } : { backgroundColor: "rgba(221,215,193,0.15)" }]}>
      <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: CREAM }, on ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }]} />
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {track}
    </TouchableOpacity>
  ) : (
    track
  );
}

function ProgressBar({ value = 0.7, color = pal.teal }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(221,215,193,0.12)", overflow: "hidden" }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: color, width: `${value * 100}%` }} />
    </View>
  );
}

function SuccessMark({ icon = "checkmark", color = pal.teal, ombre }) {
  const size = 86;
  const c = size / 2;

  if (ombre === "tealMauve") {
    const markSize = 120;
    const markC = markSize / 2;
    const markR = markC - 4;
    const glowPad = 22;
    const totalSize = markSize + glowPad * 2;
    const totalC = totalSize / 2;

    return (
      <View
        style={{
          alignSelf: "center",
          width: totalSize,
          height: totalSize,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: pal.mauve,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.45,
          shadowRadius: 18,
        }}
      >
        <Svg width={totalSize} height={totalSize} style={{ position: "absolute" }}>
          <Defs>
            <RadialGradient id="successTealMauve" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={pal.teal} />
              <Stop offset="38%" stopColor={pal.teal} stopOpacity="0.9" />
              <Stop offset="62%" stopColor="#7D8C84" />
              <Stop offset="88%" stopColor={pal.mauve} stopOpacity="0.85" />
              <Stop offset="100%" stopColor={pal.mauve} />
            </RadialGradient>
            <RadialGradient id="successGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="68%" stopColor={pal.mauve} stopOpacity="0" />
              <Stop offset="82%" stopColor={pal.mauve} stopOpacity="0.28" />
              <Stop offset="92%" stopColor={pal.teal} stopOpacity="0.22" />
              <Stop offset="100%" stopColor={pal.mauve} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={totalC} cy={totalC} r={markR + 14} fill="url(#successGlow)" />
          <Circle cx={totalC} cy={totalC} r={markR + 8} fill="none" stroke={pal.mauve} strokeWidth={10} strokeOpacity={0.12} />
          <Circle cx={totalC} cy={totalC} r={markR + 4} fill="none" stroke={pal.teal} strokeWidth={6} strokeOpacity={0.18} />
          <Circle cx={totalC} cy={totalC} r={markR} fill="url(#successTealMauve)" />
          <Circle cx={totalC} cy={totalC} r={markR} fill="none" stroke={pal.mauve} strokeWidth={2.5} strokeOpacity={0.55} />
        </Svg>
        <Ionicons name={icon} size={56} color={CREAM} />
      </View>
    );
  }

  return (
    <View style={{ alignSelf: "center", width: size, height: size, borderRadius: c, backgroundColor: color, alignItems: "center", justifyContent: "center", marginVertical: 20, borderWidth: 2, borderColor: pal.glassBorder }}>
      <Ionicons name={icon} size={44} color={CREAM} />
    </View>
  );
}

// ─── Specialized UI Components ────────────────────────────────────────────────
function AuraOrb({ size = width * 0.88, variant = "warm", vivid = false }) {
  const w = size;
  const h = size * 1.18;
  const cx = w / 2;
  const cy = h / 2;
  const id = variant === "teal" ? "Teal" : vivid ? "WarmVivid" : "Warm";
  return (
    <View style={{ width: w, height: h, alignItems: "center", justifyContent: "center" }}>
      <Svg width={w} height={h} style={{ position: "absolute" }}>
        <Defs>
          {variant === "teal" ? (
            <>
              <RadialGradient id={`auraHalo${id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={pal.teal} stopOpacity="0" />
                <Stop offset="50%" stopColor={pal.teal} stopOpacity="0.14" />
                <Stop offset="75%" stopColor={pal.khaki} stopOpacity="0.22" />
                <Stop offset="92%" stopColor="#5E9E8C" stopOpacity="0.32" />
                <Stop offset="100%" stopColor={pal.teal} stopOpacity="0.18" />
              </RadialGradient>
              <RadialGradient id={`auraMid${id}`} cx="50%" cy="46%" r="50%">
                <Stop offset="0%" stopColor={CREAM} stopOpacity="0.55" />
                <Stop offset="40%" stopColor={pal.teal} stopOpacity="0.65" />
                <Stop offset="72%" stopColor="#246B58" stopOpacity="0.30" />
                <Stop offset="100%" stopColor={pal.teal} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={`auraCore${id}`} cx="50%" cy="44%" r="50%">
                <Stop offset="0%" stopColor={CREAM} stopOpacity="0.42" />
                <Stop offset="22%" stopColor={CREAM} stopOpacity="0.50" />
                <Stop offset="48%" stopColor={pal.teal} stopOpacity="0.38" />
                <Stop offset="100%" stopColor={pal.teal} stopOpacity="0" />
              </RadialGradient>
            </>
          ) : vivid ? (
            <>
              <RadialGradient id={`auraHalo${id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={pal.khaki} stopOpacity="0" />
                <Stop offset="45%" stopColor={pal.mauve} stopOpacity="0.22" />
                <Stop offset="72%" stopColor={pal.terracotta} stopOpacity="0.48" />
                <Stop offset="90%" stopColor="#E8A878" stopOpacity="0.55" />
                <Stop offset="100%" stopColor={pal.terracotta} stopOpacity="0.35" />
              </RadialGradient>
              <RadialGradient id={`auraMid${id}`} cx="50%" cy="46%" r="50%">
                <Stop offset="0%" stopColor="#E8A878" stopOpacity="0.92" />
                <Stop offset="35%" stopColor={pal.terracotta} stopOpacity="0.82" />
                <Stop offset="58%" stopColor={pal.mauve} stopOpacity="0.72" />
                <Stop offset="78%" stopColor={pal.purple} stopOpacity="0.48" />
                <Stop offset="100%" stopColor={pal.purple} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={`auraCore${id}`} cx="50%" cy="44%" r="50%">
                <Stop offset="0%" stopColor={CREAM} stopOpacity="0.62" />
                <Stop offset="20%" stopColor={pal.khaki} stopOpacity="0.78" />
                <Stop offset="45%" stopColor={pal.terracotta} stopOpacity="0.65" />
                <Stop offset="100%" stopColor={pal.mauve} stopOpacity="0" />
              </RadialGradient>
            </>
          ) : (
            <>
              <RadialGradient id={`auraHalo${id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={pal.khaki} stopOpacity="0" />
                <Stop offset="50%" stopColor={pal.mauve} stopOpacity="0.10" />
                <Stop offset="75%" stopColor={pal.terracotta} stopOpacity="0.28" />
                <Stop offset="92%" stopColor={pal.terracotta} stopOpacity="0.38" />
                <Stop offset="100%" stopColor={pal.terracotta} stopOpacity="0.22" />
              </RadialGradient>
              <RadialGradient id={`auraMid${id}`} cx="50%" cy="46%" r="50%">
                <Stop offset="0%" stopColor={pal.terracotta} stopOpacity="0.75" />
                <Stop offset="40%" stopColor={pal.mauve} stopOpacity="0.55" />
                <Stop offset="72%" stopColor={pal.purple} stopOpacity="0.28" />
                <Stop offset="100%" stopColor={pal.purple} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={`auraCore${id}`} cx="50%" cy="44%" r="50%">
                <Stop offset="0%" stopColor={CREAM} stopOpacity="0.38" />
                <Stop offset="22%" stopColor={pal.khaki} stopOpacity="0.55" />
                <Stop offset="48%" stopColor={pal.terracotta} stopOpacity="0.42" />
                <Stop offset="100%" stopColor={pal.mauve} stopOpacity="0" />
              </RadialGradient>
            </>
          )}
        </Defs>
        <Ellipse cx={cx} cy={cy} rx={w * 0.50} ry={h * 0.48} fill={`url(#auraHalo${id})`} />
        <Ellipse cx={cx} cy={cy - 4} rx={w * 0.38} ry={h * 0.40} fill={`url(#auraMid${id})`} />
        <Ellipse cx={cx} cy={cy - 8} rx={w * 0.24} ry={h * 0.28} fill={`url(#auraCore${id})`} />
      </Svg>
    </View>
  );
}

function BounceHint({ text }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -5, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  return (
    <Animated.Text
      style={{
        transform: [{ translateY: bounce }],
        color: "rgba(221,215,193,0.45)",
        fontSize: 11,
        letterSpacing: 1.2,
        textAlign: "center",
        fontStyle: "italic",
      }}
    >
      {text}
    </Animated.Text>
  );
}

function ScrollCue({ text }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  return (
    <Animated.View style={{ alignItems: "center", gap: 6, transform: [{ translateY: bounce }] }}>
      <Text
        style={{
          color: pal.khaki,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {text}
      </Text>
      <Ionicons name="chevron-down" size={18} color={pal.w55} />
    </Animated.View>
  );
}

function fanBladePath(c, s) {
  return [
    `M ${c} ${c}`,
    `C ${c - 25 * s} ${c - 25 * s}, ${c - 50 * s} ${c - 55 * s}, ${c - 35 * s} ${c - 75 * s}`,
    `C ${c - 20 * s} ${c - 92 * s}, ${c + 10 * s} ${c - 85 * s}, ${c + 30 * s} ${c - 65 * s}`,
    `C ${c + 48 * s} ${c - 48 * s}, ${c + 45 * s} ${c - 20 * s}, ${c} ${c}`,
    "Z",
  ].join(" ");
}

function FanSpiral({ size = 220, bladeColors, centerColor }) {
  const c = size / 2;
  const s = size / 220;
  const blades = bladeColors || [`rgba(${CREAM_RGB},0.82)`, `rgba(${CREAM_RGB},0.82)`, `rgba(${CREAM_RGB},0.82)`];
  const hub = centerColor || CREAM;
  const blade = fanBladePath(c, s);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0, 120, 240].map((angle, i) => (
        <G key={angle} transform={`rotate(${angle}, ${c}, ${c})`}>
          <Path d={blade} fill={blades[i]} />
        </G>
      ))}
      <Circle cx={c} cy={c} r={size * 0.07} fill={hub} />
    </Svg>
  );
}

function lerpHexColor(from, to, t) {
  const parse = (hex) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const mix = (a, b) => Math.round(a + (b - a) * t);
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

const ORANGE_RING = pal.terracotta;
const CREAM_RING = CREAM;

function ringPoint(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ringArc(cx, cy, r, startDeg, endDeg) {
  const start = ringPoint(cx, cy, r, startDeg);
  const end = ringPoint(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}

function TerracottaOmbreRing({ value, size, c, r }) {
  const segments = 72;
  const strokeW = 14;
  const filledSegments = Math.round(segments * value);
  const degPerSeg = 360 / segments;

  return (
    <>
      {Array.from({ length: filledSegments }, (_, i) => {
        const t = filledSegments <= 1 ? 0 : i / (filledSegments - 1);
        const segColor = lerpHexColor(ORANGE_RING, CREAM_RING, t);
        const startDeg = i * degPerSeg;
        const endDeg = (i + 1) * degPerSeg + 0.6;
        return (
          <Path
            key={i}
            d={ringArc(c, c, r, startDeg, endDeg)}
            fill="none"
            stroke={segColor}
            strokeWidth={strokeW}
            strokeLinecap={i === 0 || i === filledSegments - 1 ? "round" : "butt"}
          />
        );
      })}
    </>
  );
}

function CircleRing({ value = 0.78, size = 220, color = pal.teal, label = "", terracottaOmbre = false }) {
  const c = size / 2;
  const r = (size - 28) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value);
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke="rgba(221,215,193,0.12)" strokeWidth={14} />
        {terracottaOmbre ? (
          <TerracottaOmbreRing value={value} size={size} c={c} r={r} />
        ) : (
          <Circle
            cx={c} cy={c} r={r} fill="none"
            stroke={color} strokeWidth={14}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${c}, ${c})`}
          />
        )}
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: pal.white, fontSize: size * 0.2, fontWeight: "300" }}>
          {Math.round(value * 100)}<Text style={{ fontSize: size * 0.09 }}>%</Text>
        </Text>
        {label ? <Text style={{ color: pal.w55, fontSize: 12, marginTop: 4 }}>{label}</Text> : null}
      </View>
    </View>
  );
}

function WeekChart() {
  const points = [[10, 52], [58, 28], [110, 32], [166, 46], [216, 22], [270, 38], [310, 16]];
  const d = `M ${points.map((p) => p.join(" ")).join(" L ")}`;
  return (
    <GlassCard>
      <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2.5, textAlign: "center" }}>
        T{"   "}W{"   "}T{"   "}F{"   "}S{"   "}S{"   "}M
      </Text>
      <Svg width="100%" height={72} viewBox="0 0 320 72">
        <Path d={d} fill="none" stroke="rgba(221,215,193,0.75)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={3.5} fill="rgba(221,215,193,0.90)" />
        ))}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: pal.white, fontSize: 22, fontWeight: "700" }}>Steady</Text>
          <Text style={{ color: pal.teal, fontSize: 12, fontWeight: "600" }}>+12%</Text>
        </View>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: pal.glass, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: pal.glassBorder }}>
          <MaterialCommunityIcons name="air-filter" size={14} color={pal.w70} />
          <Text style={{ color: pal.w70, fontSize: 12, fontWeight: "600" }}>Filter status</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

// ─── Language (shared) ────────────────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { name: "English", code: "EN" },
  { name: "Italian", code: "IT" },
  { name: "Turkish", code: "TR" },
];

const LanguageContext = createContext(null);

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("English");
  const langCode = LANGUAGE_OPTIONS.find((item) => item.name === language)?.code ?? "EN";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, langCode, options: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  return useContext(LanguageContext);
}

// ─── Auth / Onboarding Screens ────────────────────────────────────────────────
function LanguageSection({ onContinue, pageHeight }) {
  const { language, setLanguage, options } = useLanguage();

  const languages = options.map((item) => {
    const isSelected = item.name === language;
    return (
      <TouchableOpacity
        key={item.name}
        activeOpacity={0.85}
        onPress={() => setLanguage(item.name)}
        style={[
          { height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
          isSelected
            ? { backgroundColor: `${pal.mauve}35`, borderColor: pal.mauve }
            : { backgroundColor: pal.glass, borderColor: pal.glassBorder },
        ]}
      >
        <Ionicons name="flag-outline" size={18} color={isSelected ? pal.mauve : pal.w55} />
        <Text style={{ flex: 1, fontSize: 14, color: isSelected ? pal.white : pal.w70, fontWeight: "600" }}>{item.name}</Text>
        {isSelected ? <Ionicons name="checkmark-circle" size={20} color={pal.mauve} /> : null}
      </TouchableOpacity>
    );
  });

  if (pageHeight) {
    return (
      <View style={{ height: pageHeight, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 16 }}>
        <View style={{ flex: 1, gap: 14, minHeight: 0 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>Language</Text>
            <Text style={{ fontSize: 12, color: pal.w55, marginTop: 2 }}>Choose your preferred language</Text>
          </View>
          {languages}
        </View>
        <View style={{ paddingTop: 12 }}>
          <MauveOmbreButton label="Continue" onPress={onContinue} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 40, paddingBottom: 48, gap: 14 }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>Language</Text>
        <Text style={{ fontSize: 12, color: pal.w55, marginTop: 2 }}>Choose your preferred language</Text>
      </View>
      {languages}
      <View style={{ height: 12 }} />
      <MauveOmbreButton label="Continue" onPress={onContinue} />
    </View>
  );
}

function Welcome({ navigation }) {
  const { langCode } = useLanguage();
  const [pageHeight, setPageHeight] = useState(0);
  const auraSize = pageHeight ? Math.min(width * 0.88, pageHeight * 0.42) : width * 0.88;
  const fanSize = pageHeight ? Math.min(width * 0.48, pageHeight * 0.2) : width * 0.48;

  return (
    <LinearGradient colors={G_WARM} style={{ flex: 1 }} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1 }} onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
          {pageHeight > 0 && (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces
              decelerationRate="normal"
              scrollEventThrottle={16}
              snapToInterval={pageHeight}
              snapToAlignment="start"
              disableIntervalMomentum
            >
              <View style={{ height: pageHeight, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <Text style={{ color: pal.w55, fontSize: 12, letterSpacing: 1 }}>{langCode}</Text>
                </View>

                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
                      <AuraOrb size={auraSize} vivid />
                    </View>
                    <View style={{ alignItems: "center", gap: 10 }}>
                      <Text style={{ color: pal.khaki, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontWeight: "600" }}>Vestel</Text>
                      <Text style={{ color: pal.white, fontSize: 32, fontWeight: "200", letterSpacing: 1, fontStyle: "italic" }}>Air Purifier</Text>
                      <FanSpiral size={fanSize} />
                      <Text style={{ color: pal.w55, fontSize: 13, letterSpacing: 1 }}>pure air for every breath</Text>
                    </View>
                  </View>
                </View>

                <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
                  <ScrollCue text="scroll to get started" />
                </View>
              </View>

              <LanguageSection onContinue={() => navigation.navigate("AuthChoice")} pageHeight={pageHeight} />
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Language({ navigation, route }) {
  const fromSettings = route?.params?.fromSettings;

  return (
    <DarkScreen gradient={G_WARM}>
      {fromSettings ? <DarkHeader title="Language" navigation={navigation} /> : null}
      <LanguageSection
        onContinue={() => (fromSettings ? navigation.goBack() : navigation.navigate("AuthChoice"))}
      />
    </DarkScreen>
  );
}

function AuthChoice({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM} padded={false} scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 48 }}>
        <View style={{ height: height * 0.22 }} />
        <View style={{ alignItems: "center", gap: 14, flex: 1, justifyContent: "flex-start" }}>
          <FanSpiral
            size={width * 0.5}
            bladeColors={[`rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`]}
            centerColor={CREAM}
          />
          <Text style={{ color: CREAM, fontSize: 26, fontWeight: "700" }}>My Purifier</Text>
          <Text style={{ color: CREAM, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            Control air quality, sleep mode, filters, and aroma.
          </Text>
        </View>
        <View style={{ width: "100%" }}>
          <MauveOmbreButton label="Log In" onPress={() => navigation.navigate("SignIn")} />
          <TouchableOpacity
            style={{ alignSelf: "flex-start", marginTop: 10, marginLeft: 6 }}
            onPress={() => navigation.navigate("CreateAccount")}
          >
            <Text style={{ color: pal.w55, fontSize: 12 }}>
              Don't have an account?{" "}
              <Text style={{ textDecorationLine: "underline", color: pal.khaki }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </DarkScreen>
  );
}

function SignIn({ navigation }) {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Login" subtitle="Enter your credentials" navigation={navigation} />
      <GlassField label="Email" value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" />
      <GlassField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secure />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Toggle
          on={rememberMe}
          activeColor={pal.mauve}
          onPress={() => setRememberMe((v) => !v)}
        />
        <Text style={{ color: pal.w55, fontSize: 12, flex: 1 }}>Remember me</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={{ color: pal.khaki, fontWeight: "700", fontSize: 12 }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <MauveOmbreButton label="Log In" onPress={() => navigation.navigate("AddDevice")} />
      <Text style={{ textAlign: "center", color: pal.w30, fontSize: 12 }}>or</Text>
      <GlassButton label="Continue with Google" onPress={() => navigation.navigate("AddDevice")} />
    </DarkScreen>
  );
}

function CreateAccount({ navigation }) {
  const [email, setEmail] = useState("");

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Create Account" subtitle="Enter your email to sign up" navigation={navigation} />
      <Text style={{ color: pal.khaki, fontSize: 13, fontWeight: "600", letterSpacing: 2, textAlign: "center", marginVertical: 8 }}>
        VESTEL AIR PURIFIER
      </Text>
      <GlassField label="Email" value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" />
      <MauveOmbreButton label="Create an account" onPress={() => navigation.navigate("VerifyEmail")} />
      <Text style={{ textAlign: "center", color: pal.w30, fontSize: 12 }}>or</Text>
      <GlassButton label="Continue with Google" onPress={() => navigation.navigate("VerifyEmail")} />
      <View style={{ flexGrow: 1, minHeight: 18 }} />
      <Text style={{ textAlign: "center", color: pal.w30, fontSize: 10, lineHeight: 16 }}>
        By clicking continue, you agree to the Terms of Service and Privacy Policy.
      </Text>
    </DarkScreen>
  );
}

function VerifyEmail({ navigation }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Verify Email" subtitle="Check your inbox" navigation={navigation} />
      <Text style={{ color: pal.w70, fontSize: 14, lineHeight: 22 }}>
        Enter the 6-digit code sent to your email
      </Text>
      <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
        {code.map((digit, i) => (
          <View key={i} style={{ width: (width - 44 - 40) / 6, height: 52, borderRadius: 12, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center" }}>
            <TextInput
              ref={(ref) => { codeRefs.current[i] = ref; }}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={{ color: pal.white, fontSize: 18, fontWeight: "700", textAlign: "center", width: "100%", height: "100%" }}
            />
          </View>
        ))}
      </View>
      <MauveOmbreButton label="Verify Email" onPress={() => navigation.navigate("CreatePassword")} />
      <GlassButton label="Send to different email" onPress={() => navigation.goBack()} />
    </DarkScreen>
  );
}

const PASSWORD_RULES = [
  { label: "8 characters minimum", test: (p) => p.length >= 8 },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A capital letter", test: (p) => /[A-Z]/.test(p) },
];

function CreatePassword({ navigation }) {
  const [password, setPassword] = useState("");

  const metRules = PASSWORD_RULES.map((rule) => rule.test(password));
  const metCount = metRules.filter(Boolean).length;
  const strength = metCount / PASSWORD_RULES.length;
  const strengthLabel =
    metCount === 0
      ? "Password strength: weak"
      : metCount === 1
        ? "Password strength: fair"
        : metCount === 2
          ? "Password strength: good"
          : "Password strength: strong";
  const allMet = metCount === PASSWORD_RULES.length;

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Create Password" subtitle={strengthLabel} navigation={navigation} />
      <GlassField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secure />
      <ProgressBar value={strength} color={pal.mauve} />
      <GlassCard>
        {PASSWORD_RULES.map((rule, index) => {
          const met = metRules[index];
          return (
            <View key={rule.label} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <Ionicons
                name={met ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={met ? pal.mauve : pal.w30}
              />
              <Text style={{ color: met ? pal.w88 : pal.w55, fontSize: 14 }}>{rule.label}</Text>
            </View>
          );
        })}
      </GlassCard>
      <MauveOmbreButton
        label="Continue"
        onPress={() => {
          if (allMet) navigation.navigate("AccountCreated");
        }}
      />
    </DarkScreen>
  );
}

function AccountCreated({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM}>
      <SuccessMark ombre="tealMauve" />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Account created!</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center", lineHeight: 20 }}>
        Only one click to explore online activation.
      </Text>
      <View style={{ flexGrow: 1, minHeight: 20 }} />
      <MauveOmbreButton label="Log in" onPress={() => navigation.navigate("SignIn")} />
    </DarkScreen>
  );
}

function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Forgot Password" navigation={navigation} />
      <Text style={{ fontSize: 22, fontWeight: "700", color: pal.white }}>Reset your password</Text>
      <Text style={{ fontSize: 13, color: pal.w55, lineHeight: 20 }}>
        Enter your email and we'll send a secure reset link.
      </Text>
      <GlassField label="Email" value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" />
      <MauveOmbreButton label="Send reset link" onPress={() => navigation.navigate("ResetEmailSent")} />
      <GlassButton label="Back to sign in" onPress={() => navigation.navigate("SignIn")} />
    </DarkScreen>
  );
}

function ResetEmailSent({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM}>
      <SuccessMark icon="mail" ombre="tealMauve" />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Check your inbox</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>
        A reset link was sent to mesud@example.com
      </Text>
      <DarkRow icon="email-outline" title="mesud@example.com" value="Sent" />
      <MauveOmbreButton label="Open email app" onPress={() => navigation.navigate("PasswordResetSuccess")} />
      <GlassButton label="Back to sign in" onPress={() => navigation.navigate("SignIn")} />
    </DarkScreen>
  );
}

function PasswordResetSuccess({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM}>
      <SuccessMark ombre="tealMauve" />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Password reset</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>
        Your password was updated successfully.
      </Text>
      <View style={{ flexGrow: 1, minHeight: 20 }} />
      <MauveOmbreButton label="Back to sign in" onPress={() => navigation.navigate("SignIn")} />
    </DarkScreen>
  );
}

// ─── Pairing Screens ──────────────────────────────────────────────────────────
function AddDevice({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Find Device" subtitle="Nearby purifiers" navigation={navigation} />
      <DarkRow icon="air-purifier" title="Vestel VHT-402 WiFi" value="Ready" onPress={() => navigation.navigate("DeviceFound")} />
      <View style={{ flexGrow: 1 }} />
      <GlassButton label="Can't see my device" onPress={() => navigation.navigate("WifiCredentials")} />
    </DarkScreen>
  );
}

function DeviceFound({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM} padded={false} scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 44, justifyContent: "space-between" }}>
        <DarkHeader title="Device Found" subtitle="Ready to pair" navigation={navigation} />
        <View style={{ alignItems: "center", gap: 12 }}>
          <FanSpiral
            size={width * 0.52}
            bladeColors={[`rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`]}
            centerColor={CREAM}
          />
          <Text style={{ color: CREAM, fontSize: 22, fontWeight: "700" }}>Vestel VHT-402 WiFi</Text>
          <Text style={{ color: CREAM, fontSize: 13, textAlign: "center", lineHeight: 20 }}>Signal strong · Living Room</Text>
        </View>
        <MauveOmbreButton label="Pair this purifier" onPress={() => navigation.navigate("WifiCredentials")} />
      </View>
    </DarkScreen>
  );
}

function WifiCredentials({ navigation }) {
  const [noPassword, setNoPassword] = useState(false);
  const [network, setNetwork] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Connect Wi-Fi" subtitle="Use a 2.4 GHz network" navigation={navigation} />
      <GlassField label="Network name" value={network} onChangeText={setNetwork} placeholder="Network name" />
      <GlassField label="Password" value={wifiPassword} onChangeText={setWifiPassword} placeholder="Password" secure />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Toggle
          on={noPassword}
          activeColor={pal.mauve}
          onPress={() => setNoPassword((v) => !v)}
        />
        <Text style={{ color: pal.w55, fontSize: 12 }}>No password</Text>
      </View>
      <MauveOmbreButton label="Start pairing" onPress={() => navigation.navigate("PairingProgress")} />
    </DarkScreen>
  );
}

function PairingProgress({ navigation }) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const duration = 4000;
    const interval = 40;
    const steps = duration / interval;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      const value = Math.min(step / steps, 1);
      setProgress(value);
      if (value >= 1) {
        setComplete(true);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Pairing…" subtitle="This may take up to one minute" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <CircleRing value={progress} size={200} label="Connecting" terracottaOmbre />
      </View>
      <Text style={{ color: pal.w55, fontSize: 13, textAlign: "center" }}>Sending Wi-Fi credentials</Text>
      <View style={{ flexGrow: 1, minHeight: 16 }} />
      {complete ? (
        <MauveOmbreButton label="Continue" onPress={() => navigation.navigate("PairingSuccess")} />
      ) : null}
    </DarkScreen>
  );
}

function PairingSuccess({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM} padded={false} scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 44, justifyContent: "space-between" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <SuccessMark ombre="tealMauve" />
          <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Purifier connected</Text>
          <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center", lineHeight: 20 }}>Air quality monitoring is active.</Text>
        </View>
        <MauveOmbreButton label="Go to Dashboard" onPress={() => navigation.navigate("Dashboard")} />
      </View>
    </DarkScreen>
  );
}

function PairingError({ navigation }) {
  return (
    <DarkScreen gradient={G_NEUTRAL}>
      <SuccessMark icon="close" color="#C84545" />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Pairing failed</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>Check Wi-Fi password and router frequency.</Text>
      <View style={{ flexGrow: 1, minHeight: 20 }} />
      <GlassButton label="Try again" onPress={() => navigation.navigate("WifiCredentials")} filled />
    </DarkScreen>
  );
}

// ─── Aroma Timer (shared) ─────────────────────────────────────────────────────
function formatDuration(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AromaTimerContext = createContext(null);

function AromaTimerProvider({ children }) {
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRunning || isPaused || secondsRemaining === null || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((current) => {
        if (current === null || current <= 1) {
          setIsRunning(false);
          setIsPaused(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isPaused, secondsRemaining]);

  const startTimer = (totalSeconds) => {
    setSecondsRemaining(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (secondsRemaining > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  return (
    <AromaTimerContext.Provider value={{ secondsRemaining, isRunning, isPaused, startTimer, pauseTimer, resumeTimer }}>
      {children}
    </AromaTimerContext.Provider>
  );
}

function useAromaTimer() {
  return useContext(AromaTimerContext);
}

// ─── Main App Screens ─────────────────────────────────────────────────────────
function Dashboard({ navigation }) {
  const { secondsRemaining } = useAromaTimer();
  const showAromaTimer = secondsRemaining !== null && secondsRemaining > 0;

  return (
    <LinearGradient colors={G_MAUVE} style={{ flex: 1 }} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1 }}>
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <AuraOrb size={width * 0.92} variant="warm" vivid />
            </View>
          </View>

          <View style={s.dashContainer}>
            <View style={s.dashTop}>
              <Text style={s.welcomeHome}>Home</Text>
              {showAromaTimer && (
                <Text style={s.aromaTimer}>{formatDuration(secondsRemaining)}</Text>
              )}
              <Text style={s.dashRoom}>Living Room</Text>
            </View>

            <TouchableOpacity
              style={s.fanWrapper}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("FanControl")}
            >
              <FanSpiral size={width * 0.70} />
              <BounceHint text="tap to change fan speed" />
            </TouchableOpacity>

            <View style={s.dashBottom}>
              <Text style={s.airClean}>Air is clean</Text>
              <Text style={s.dashMetrics}>PM2.5  12  |  TVOC  85</Text>
              <View style={s.dashNavRow}>
                {[
                  ["Air Quality", "Analytics"],
                  ["Filter", "FilterMaintenance"],
                  ["Aroma", "Aroma"],
                  ["Settings", "Settings"],
                ].map(([label, route]) => (
                  <TouchableOpacity key={route} style={s.dashPill} onPress={() => navigation.navigate(route)}>
                    <Text style={s.dashPillText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FanControl({ navigation }) {
  const [fanDegree, setFanDegree] = useState(2);

  return (
    <LinearGradient colors={G_MAUVE} style={{ flex: 1 }} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 }}>
          <DarkHeader title="Fan Control" subtitle="Tap to adjust fan speed" navigation={navigation} />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <FanSpiral size={width * 0.82} />
          </View>
          <View style={{ alignItems: "center", gap: 16 }}>
            <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2.5 }}>FAN DEGREE</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((deg) => {
                const selected = fanDegree === deg;
                return (
                  <TouchableOpacity
                    key={deg}
                    activeOpacity={0.85}
                    onPress={() => setFanDegree(deg)}
                    style={[
                      { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1 },
                      selected
                        ? { backgroundColor: pal.teal, borderColor: pal.teal }
                        : { backgroundColor: pal.glass, borderColor: pal.glassBorder },
                    ]}
                  >
                    <Text style={{ color: pal.white, fontWeight: "700", fontSize: 16 }}>{deg}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ color: pal.w30, fontSize: 12, letterSpacing: 1 }}>slide to arrange</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SleepMode({ navigation }) {
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Sleep Mode" subtitle="Silent bedroom routine" navigation={navigation} />
      <GlassCard style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Noise Level</Text>
        <Text style={{ color: pal.white, fontSize: 44, fontWeight: "300" }}>
          22 <Text style={{ fontSize: 20, color: pal.w55 }}>dB</Text>
        </Text>
        <ProgressBar value={0.3} />
      </GlassCard>
      <DarkRow icon="calendar-night" title="Every night" value="22:30 – 07:00" />
      <DarkRow icon="brightness-6" title="LED brightness" value="Off" />
      <DarkRow icon="auto-fix" title="Auto activation" value="On" />
    </DarkScreen>
  );
}

function FilterMaintenance({ navigation }) {
  return (
    <DarkScreen gradient={G_QUALITY}>
      <DarkHeader title="Filter Life" subtitle="HEPA H13 status" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <CircleRing value={0.78} size={210} label="HEPA filter" color={pal.teal} />
      </View>
      <DarkRow icon="air-filter" title="HEPA H13 Filter" value="78%" />
      <DarkRow icon="air-filter" title="Carbon Pre-filter" value="41%" />
      <DarkRow icon="lamp" title="UV-C Lamp" value="16%" danger />
      <GlassButton label="Replace filter" onPress={() => navigation.navigate("ReplaceFilter")} filled />
    </DarkScreen>
  );
}

function ReplaceFilter({ navigation }) {
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Replace Filter" subtitle="Guided workflow" navigation={navigation} />
      {["Turn purifier off", "Remove old filter", "Install new filter"].map((x, i) => (
        <DarkRow key={x} icon={`numeric-${i + 1}-circle`} title={`${i + 1}. ${x}`} value="" />
      ))}
      <GlassButton label="Filter replaced" onPress={() => navigation.navigate("FilterMaintenance")} filled />
    </DarkScreen>
  );
}

function Analytics({ navigation }) {
  return (
    <DarkScreen gradient={G_QUALITY}>
      <DarkHeader title="Air Quality" subtitle="Weekly overview" navigation={navigation} />
      <View style={{ flexDirection: "row", height: 38, borderRadius: 14, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, padding: 4 }}>
        {["Day", "Week", "Month"].map((t, i) => (
          <View key={t} style={[{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 }, i === 1 && { backgroundColor: pal.teal }]}>
            <Text style={[{ fontSize: 13, fontWeight: "700" }, i === 1 ? { color: pal.white } : { color: pal.w55 }]}>{t}</Text>
          </View>
        ))}
      </View>
      <WeekChart />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[["leaf", "5", "Best"], ["chart-line", "12", "Avg"], ["alert", "48", "Peak"]].map(([icon, value, label]) => (
          <View key={label} style={{ flex: 1, minHeight: 88, borderRadius: 18, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center", gap: 4, padding: 10 }}>
            <MaterialCommunityIcons name={icon} size={20} color={pal.teal} />
            <Text style={{ fontSize: 20, fontWeight: "800", color: pal.white }}>{value}</Text>
            <Text style={{ color: pal.w55, fontSize: 11 }}>{label}</Text>
          </View>
        ))}
      </View>
    </DarkScreen>
  );
}

function Automation({ navigation }) {
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Automation" subtitle="Scenario presets" navigation={navigation} />
      <DarkRow icon="flower-pollen" title="Allergy preset" value="On" />
      <DarkRow icon="paw" title="Pet preset" value="Off" />
      <DarkRow icon="weather-night" title="Night preset" value="On" />
      <GlassButton label="Create rule" onPress={() => navigation.navigate("CustomAutomation")} filled />
    </DarkScreen>
  );
}

function CustomAutomation({ navigation }) {
  const [ruleName, setRuleName] = useState("");

  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Custom Rule" subtitle="Trigger-based action" navigation={navigation} />
      <GlassField label="Rule name" value={ruleName} onChangeText={setRuleName} placeholder="Rule name" />
      <DarkRow icon="target" title="Trigger" value="PM2.5 above 35" />
      <DarkRow icon="clock-outline" title="Condition" value="18:00 – 23:00" />
      <DarkRow icon="auto-fix" title="Action" value="Allergy Mode" />
      <GlassButton label="Save automation" onPress={() => navigation.navigate("Automation")} filled />
    </DarkScreen>
  );
}

// ─── Settings & Aroma ─────────────────────────────────────────────────────────
function Settings({ navigation }) {
  return (
    <DarkScreen gradient={G_QUALITY}>
      <View style={{ paddingTop: 8, paddingBottom: 6 }}>
        <Text style={{ color: pal.white, fontSize: 28, fontWeight: "700" }}>Settings</Text>
        <Text style={{ color: pal.w55, fontSize: 13, marginTop: 4 }}>App and device preferences</Text>
      </View>
      <DarkRow icon="brightness-6" title="Display" onPress={() => {}} />
      <DarkRow icon="bell-outline" title="Notifications" onPress={() => navigation.navigate("Notifications")} />
      <DarkRow icon="information-outline" title="Device Info" onPress={() => navigation.navigate("DeviceManagement")} />
      <View style={{ height: 8 }} />
      <DarkRow icon="account-outline" title="Account" value="Mesud" onPress={() => navigation.navigate("UserProfile")} />
      <DarkRow icon="download" title="Firmware" value="v1.8.2" onPress={() => navigation.navigate("FirmwareAvailable")} />
    </DarkScreen>
  );
}

function Aroma({ navigation }) {
  const aromas = [
    { name: "Mint", icon: "leaf", accent: "#4A9C7A" },
    { name: "Lavender", icon: "flower", accent: "#9470B8" },
    { name: "Eucalyptus", icon: "tree", accent: "#5A9868" },
  ];
  const intensityOptions = [
    { label: "Less", iconSize: 14, val: 0.3 },
    { label: "Medium", iconSize: 20, val: 0.6 },
    { label: "Most", iconSize: 26, val: 1.0 },
  ];
  const [selectedAroma, setSelectedAroma] = useState("Lavender");
  const [intensity, setIntensity] = useState(0.6);
  const [durationInput, setDurationInput] = useState("03:00");
  const { secondsRemaining, isRunning, isPaused, startTimer, pauseTimer, resumeTimer } = useAromaTimer();

  const parseDurationInput = (text) => {
    const parts = (text || "00:00").split(":");
    let minutes = parseInt(parts[0], 10) || 0;
    let seconds = parseInt(parts[1], 10) || 0;
    minutes = Math.min(60, Math.max(0, minutes));
    if (minutes === 60) seconds = 0;
    else seconds = Math.min(59, Math.max(0, seconds));
    return minutes * 60 + seconds;
  };

  const handleCounterInput = (text) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    if (!digits) {
      setDurationInput("");
      return;
    }
    let minutes;
    let seconds;
    if (digits.length <= 2) {
      minutes = Math.min(60, parseInt(digits, 10) || 0);
      seconds = 0;
    } else {
      const minsPart = digits.slice(0, digits.length - 2);
      const secsPart = digits.slice(-2);
      minutes = Math.min(60, parseInt(minsPart, 10) || 0);
      seconds = minutes === 60 ? 0 : Math.min(59, parseInt(secsPart, 10) || 0);
    }
    setDurationInput(formatDuration(minutes * 60 + seconds));
  };

  const normalizeDurationInput = () => {
    const total = parseDurationInput(durationInput);
    setDurationInput(formatDuration(total > 0 ? total : 60));
  };

  const handleTimerPress = () => {
    if (secondsRemaining === null) {
      const total = Math.max(60, parseDurationInput(durationInput));
      setDurationInput(formatDuration(total));
      startTimer(total);
      return;
    }
    if (isRunning) {
      pauseTimer();
      return;
    }
    if (secondsRemaining > 0) {
      resumeTimer();
    }
  };

  return (
    <LinearGradient colors={G_TERRACOTTA} locations={[0, 0.5, 1]} style={{ flex: 1 }} start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DarkHeader title="Aroma" subtitle="Choose your scent" navigation={navigation} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            {aromas.map((a) => {
              const selected = a.name === selectedAroma;
              return (
                <TouchableOpacity
                  key={a.name}
                  activeOpacity={0.85}
                  onPress={() => setSelectedAroma(a.name)}
                  style={[
                    { flex: 1, alignItems: "center", paddingVertical: 20, borderRadius: 18, borderWidth: 1, gap: 8 },
                    selected
                      ? { backgroundColor: `${a.accent}30`, borderColor: a.accent }
                      : { backgroundColor: pal.glass, borderColor: pal.glassBorder },
                  ]}
                >
                  <MaterialCommunityIcons name={a.icon} size={32} color={selected ? a.accent : pal.w55} />
                  <Text style={{ color: selected ? pal.white : pal.w70, fontWeight: "600", fontSize: 13 }}>{a.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <GlassCard>
            <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Intensity</Text>
            {intensityOptions.map(({ label, iconSize, val }) => {
              const selected = intensity === val;
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.85}
                  onPress={() => setIntensity(val)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
                >
                  <View style={[{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }, selected && { backgroundColor: "rgba(221,215,193,0.20)" }]}>
                    <MaterialCommunityIcons name="flower" size={iconSize} color={selected ? pal.white : pal.w55} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: selected ? pal.white : pal.w55 }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </GlassCard>

          <GlassCard style={{ alignItems: "center", gap: 12 }}>
            <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Duration</Text>
            <Text style={{ color: pal.w30, fontSize: 11 }}>max 60 minutes</Text>
            {secondsRemaining === null ? (
              <TextInput
                value={durationInput}
                onChangeText={handleCounterInput}
                onBlur={normalizeDurationInput}
                keyboardType="number-pad"
                selectTextOnFocus
                style={{
                  color: pal.white,
                  fontSize: 52,
                  fontWeight: "200",
                  letterSpacing: 3,
                  textAlign: "center",
                  minWidth: 220,
                  padding: 0,
                }}
              />
            ) : (
              <Text style={{ color: pal.white, fontSize: 52, fontWeight: "200", letterSpacing: 3 }}>{formatDuration(secondsRemaining)}</Text>
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleTimerPress}
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons
                name={secondsRemaining === null || isPaused ? "play" : "pause"}
                size={22}
                color={pal.white}
              />
            </TouchableOpacity>
            <Text style={{ color: pal.w30, fontSize: 11 }}>
              {secondsRemaining === null ? "Tap to start countdown" : isPaused ? "Paused" : isRunning ? "Counting down…" : "Finished"}
            </Text>
          </GlassCard>

          <GlassButton label="Done" onPress={() => navigation.goBack()} filled color={pal.burgundy} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Device & Account Screens ─────────────────────────────────────────────────
function DeviceManagement({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Devices" subtitle="Rooms and paired purifiers" navigation={navigation} />
      <DarkRow icon="air-purifier" title="Living Room" value="Good" />
      <DarkRow icon="air-purifier" title="Bedroom" value="Silent" />
      <GlassButton label="Add new purifier" onPress={() => navigation.navigate("AddDevice")} filled />
    </DarkScreen>
  );
}

function Notifications({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Notifications" subtitle="Alerts and reminders" navigation={navigation} />
      {["Filter replacement reminder", "Poor air quality alert", "Device offline alert", "Firmware update available"].map((x) => (
        <View key={x} style={{ minHeight: 62, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600", paddingRight: 12, lineHeight: 20 }}>{x}</Text>
          <Toggle />
        </View>
      ))}
    </DarkScreen>
  );
}

function FirmwareAvailable({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA} padded={false} scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 44, justifyContent: "space-between" }}>
        <DarkHeader title="Firmware Update" subtitle="VESTEL VHT-402 WiFi" navigation={navigation} />
        <View style={{ alignItems: "center", gap: 14 }}>
          <FanSpiral size={width * 0.46} />
          <Text style={{ color: pal.white, fontSize: 26, fontWeight: "700" }}>Version 1.8.2</Text>
          <Text style={{ color: pal.w55, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            Improves Wi-Fi stability and sensor calibration.
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <GlassButton label="Update now" onPress={() => navigation.navigate("FirmwareUpdating")} filled />
          <GlassButton label="Later" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </DarkScreen>
  );
}

function FirmwareUpdating({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Updating Firmware" subtitle="Do not unplug the purifier" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <CircleRing value={0.64} size={200} label="Installing v1.8.2" />
      </View>
      <View style={{ flexGrow: 1, minHeight: 16 }} />
      <GlassButton label="Finish demo" onPress={() => navigation.navigate("FirmwareComplete")} filled />
    </DarkScreen>
  );
}

function FirmwareComplete({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <SuccessMark />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Update complete</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>
        Your purifier is running the latest firmware.
      </Text>
      <View style={{ flexGrow: 1, minHeight: 20 }} />
      <GlassButton label="Back to settings" onPress={() => navigation.navigate("Settings")} filled />
    </DarkScreen>
  );
}

function UserProfile({ navigation }) {
  const { language } = useLanguage();

  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Profile" subtitle="Account management" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 20, gap: 10 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: pal.terracotta, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: pal.glassBorder }}>
          <Text style={{ color: pal.white, fontSize: 28, fontWeight: "900" }}>M</Text>
        </View>
        <Text style={{ color: pal.white, fontSize: 20, fontWeight: "700" }}>Mesud Guluyev</Text>
        <Text style={{ color: pal.w55, fontSize: 13 }}>mesud@example.com</Text>
      </View>
      <DarkRow icon="account" title="Name" value="Mesud Guluyev" />
      <DarkRow icon="email" title="Email" value="mesud@example.com" />
      <DarkRow
        icon="translate"
        title="Language"
        value={language}
        onPress={() => navigation.navigate("Language", { fromSettings: true })}
      />
      <View style={{ flexGrow: 1, minHeight: 18 }} />
      <GlassButton label="Logout" onPress={() => navigation.navigate("SignIn")} />
    </DarkScreen>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const screens = {
  Welcome, Language, AuthChoice, SignIn, CreateAccount, VerifyEmail,
  CreatePassword, AccountCreated, ForgotPassword, ResetEmailSent,
  PasswordResetSuccess, AddDevice, DeviceFound, WifiCredentials,
  PairingProgress, PairingSuccess, PairingError, Dashboard, FanControl,
  SleepMode, FilterMaintenance, ReplaceFilter, Analytics, Automation,
  CustomAutomation, Settings, Aroma, DeviceManagement, Notifications,
  FirmwareAvailable, FirmwareUpdating, FirmwareComplete, UserProfile,
};

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {routes.map((name) => (
          <Stack.Screen key={name} name={name} component={screens[name]} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AromaTimerProvider>
        <AppNavigator />
      </AromaTimerProvider>
    </LanguageProvider>
  );
}

// ─── Dashboard-specific Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  dashContainer:  { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 38 },
  dashTop:        { alignItems: "center", marginTop: 6 },
  welcomeHome:    { fontSize: 34, color: CREAM, fontStyle: "italic", fontWeight: "300", letterSpacing: 0.5 },
  aromaTimer:     { fontSize: 28, color: "rgba(221,215,193,0.82)", fontWeight: "200", letterSpacing: 4, marginTop: 10 },
  dashRoom:       { fontSize: 12, color: "rgba(221,215,193,0.52)", marginTop: 8, letterSpacing: 2, textTransform: "uppercase" },
  fanWrapper:     { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 8 },
  dashBottom:     { alignItems: "center", gap: 8, width: "100%" },
  airClean:       { fontSize: 20, color: "rgba(221,215,193,0.88)", fontStyle: "italic", fontWeight: "300" },
  dashMetrics:    { color: "rgba(221,215,193,0.42)", fontSize: 11, letterSpacing: 3 },
  dashNavRow:     { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "center" },
  dashPill:       { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: "rgba(221,215,193,0.11)", borderWidth: 1, borderColor: "rgba(221,215,193,0.17)" },
  dashPillText:   { color: "rgba(221,215,193,0.84)", fontSize: 13, fontWeight: "600" },
});
