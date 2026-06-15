import React, { useRef, useEffect, useState, createContext, useContext, useCallback } from "react";
import { nextTelemetry, aqiInfo } from "./src/sim/telemetry";
import { isValidEmail, isValidOtp } from "./src/lib/validation";
import {
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
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  AccessibilityInfo,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, Ellipse } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

// ─── Palette (from design images) ────────────────────────────────────────────
const CREAM = "#DDD7C1";
const CREAM_RGB = "221,215,193";

const pal = {
  teal:        "#4A8B7A",
  khaki:       "#C5BC8A",
  mauve:       "#B08D8D",
  purple:      "#744C8B",
  terracotta:  "#C87050",
  burgundy:    "#8B2535",
  white:       CREAM,
  w88:         `rgba(${CREAM_RGB},0.92)`,
  w70:         `rgba(${CREAM_RGB},0.82)`,
  w55:         `rgba(${CREAM_RGB},0.68)`,
  w30:         `rgba(${CREAM_RGB},0.48)`,
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
  "Devices",
  "AddNewPurifier",
  "PlacePurifier",
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
  "DeviceControl",
  "ActiveMode",
  "FanSpeedSetting",
  "AromaCartridge",
  "TimerSetting",
  "DeviceFilterMaintenance",
  "DeviceSettings",
  "AddCustomRoom",
  "Notifications",
  "FirmwareAvailable",
  "FirmwareUpdating",
  "FirmwareComplete",
  "UserProfile",
];

const SCREENS_WITHOUT_HOME_NAV = new Set([
  "Welcome",
  "Language",
  "SignIn",
  "CreateAccount",
  "Dashboard",
  "AuthChoice",
  "VerifyEmail",
  "CreatePassword",
  "AccountCreated",
  "ForgotPassword",
  "ResetEmailSent",
  "PasswordResetSuccess",
]);

// ─── Layout Components ────────────────────────────────────────────────────────
const HOME_ICON_COLOR = "#E4DCBC";

function HomeNavButton({ navigation }) {
  return (
    <SafeAreaView pointerEvents="box-none" style={{ position: "absolute", top: 0, right: 0, left: 0, zIndex: 100, alignItems: "flex-end" }}>
      <View style={{ marginTop: 20, minHeight: 38, justifyContent: "center", paddingRight: 18 }}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate("Dashboard")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="home-outline" size={26} color={HOME_ICON_COLOR} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function withHomeNav(ScreenComponent, routeName) {
  if (SCREENS_WITHOUT_HOME_NAV.has(routeName)) return ScreenComponent;
  return function ScreenWithHomeNav(props) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenComponent {...props} />
        <HomeNavButton navigation={props.navigation} />
      </View>
    );
  };
}

function DarkScreen({ children, gradient = G_NEUTRAL, padded = true, scroll = true }) {
  const isQuality = gradient === G_QUALITY || gradient === G_TERRACOTTA;
  const inner = scroll ? (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
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
    </KeyboardAvoidingView>
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

function DarkHeader({ title, subtitle, navigation, onBack }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
      {navigation && (
        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pal.glassBorder }}
          onPress={onBack || (() => navigation.goBack())}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

function GlassButton({ label, onPress, filled = false, color = pal.teal, disabled = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
        filled
          ? { backgroundColor: color }
          : { backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder },
        disabled && { opacity: 0.4 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
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
        <TouchableOpacity activeOpacity={0.88} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
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

function MauveFlatButton({ label, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: "100%",
        height: 52,
        borderRadius: 16,
        backgroundColor: pal.mauve,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(176,141,141,0.55)",
      }}
    >
      <Text style={{ color: MAUVE_BTN_TEXT, fontWeight: "700", fontSize: 15, letterSpacing: 0.4 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    if (AccessibilityInfo.isReduceMotionEnabled) {
      AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduce(!!v));
    }
    const sub = AccessibilityInfo.addEventListener
      ? AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => setReduce(!!v))
      : null;
    return () => {
      mounted = false;
      if (sub && sub.remove) sub.remove();
    };
  }, []);
  return reduce;
}

function PulseGlowInviteCard({ children, ringId = "Invite", variant = "tealTerracotta", animate: animateProp = true, oval = false }) {
  const reduceMotion = useReduceMotion();
  const animate = animateProp && !reduceMotion;
  const pulse = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const ringSize = Math.min(width - 48, 320);
  const h = ringSize * (oval ? 1.22 : 1.08);
  const cx = ringSize / 2;
  const cy = h / 2;
  const id = ringId;
  const isPurple = variant === "tealTerracottaPurple";

  useEffect(() => {
    if (!animate) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse, animate]);

  const glowOpacity = animate ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) : 1;
  const ringScale = animate ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) : 1;

  const ringSvg = (
    <Svg width={ringSize} height={h}>
      <Defs>
        <RadialGradient id={`inviteHalo${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={pal.teal} stopOpacity="0" />
          <Stop offset="38%" stopColor="#4AACA9" stopOpacity={isPurple ? "0.22" : "0.08"} />
          <Stop offset="55%" stopColor={pal.teal} stopOpacity={isPurple ? "0.32" : "0.08"} />
          <Stop offset="68%" stopColor={pal.terracotta} stopOpacity={isPurple ? "0.48" : "0.22"} />
          <Stop offset="82%" stopColor={isPurple ? "#DA7A59" : "#DA7A59"} stopOpacity={isPurple ? "0.58" : "0.32"} />
          <Stop offset="100%" stopColor={isPurple ? pal.purple : pal.teal} stopOpacity={isPurple ? "0.42" : "0.14"} />
        </RadialGradient>
        <RadialGradient id={`inviteMid${id}`} cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={CREAM} stopOpacity={isPurple ? "0.12" : "0"} />
          <Stop offset="40%" stopColor={pal.terracotta} stopOpacity={isPurple ? "0.32" : "0.14"} />
          <Stop offset="58%" stopColor={isPurple ? pal.mauve : pal.terracotta} stopOpacity={isPurple ? "0.38" : "0.14"} />
          <Stop offset="72%" stopColor="#4AACA9" stopOpacity={isPurple ? "0.42" : "0.20"} />
          <Stop offset="100%" stopColor={isPurple ? pal.purple : pal.teal} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={cx} cy={cy} rx={ringSize * 0.49} ry={h * (oval ? 0.48 : 0.47)} fill={`url(#inviteHalo${id})`} />
      <Ellipse cx={cx} cy={cy - (oval ? 4 : 2)} rx={ringSize * 0.38} ry={h * (oval ? 0.40 : 0.36)} fill={`url(#inviteMid${id})`} />
      {oval ? (
        <>
          <Ellipse cx={cx} cy={cy} rx={ringSize * 0.44} ry={h * 0.42} fill="none" stroke={pal.teal} strokeWidth={2.5} strokeOpacity={isPurple ? 0.32 : 0.14} />
          <Ellipse cx={cx} cy={cy} rx={ringSize * 0.41} ry={h * 0.39} fill="none" stroke="#4AACA9" strokeWidth={1.5} strokeOpacity={isPurple ? 0.45 : 0.22} />
          <Ellipse cx={cx} cy={cy} rx={ringSize * 0.46} ry={h * 0.44} fill="none" stroke={pal.terracotta} strokeWidth={2} strokeOpacity={isPurple ? 0.42 : 0.16} />
          <Ellipse cx={cx} cy={cy} rx={ringSize * 0.48} ry={h * 0.46} fill="none" stroke={isPurple ? pal.purple : "#DA7A59"} strokeWidth={1} strokeOpacity={isPurple ? 0.38 : 0.12} />
        </>
      ) : (
        <>
          <Circle cx={cx} cy={cy} r={ringSize * 0.44} fill="none" stroke={pal.teal} strokeWidth={2.5} strokeOpacity={isPurple ? 0.32 : 0.14} />
          <Circle cx={cx} cy={cy} r={ringSize * 0.41} fill="none" stroke="#4AACA9" strokeWidth={1.5} strokeOpacity={isPurple ? 0.45 : 0.22} />
          <Circle cx={cx} cy={cy} r={ringSize * 0.46} fill="none" stroke={pal.terracotta} strokeWidth={2} strokeOpacity={isPurple ? 0.42 : 0.16} />
          <Circle cx={cx} cy={cy} r={ringSize * 0.48} fill="none" stroke={isPurple ? pal.purple : "#DA7A59"} strokeWidth={1} strokeOpacity={isPurple ? 0.38 : 0.12} />
        </>
      )}
    </Svg>
  );

  const ringBody = (
    <>
      {animate ? (
        <Animated.View pointerEvents="none" style={{ position: "absolute", width: ringSize, height: h, opacity: glowOpacity }}>
          {ringSvg}
        </Animated.View>
      ) : (
        <View pointerEvents="none" style={{ position: "absolute", width: ringSize, height: h }}>
          {ringSvg}
        </View>
      )}
      <View style={{ width: ringSize * 0.74, alignItems: "center", gap: 14, paddingVertical: oval ? 20 : 10 }}>
        {children}
      </View>
    </>
  );

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      {animate ? (
        <Animated.View
          style={{
            width: ringSize,
            height: h,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: ringScale }],
          }}
        >
          {ringBody}
        </Animated.View>
      ) : (
        <View
          style={{
            width: ringSize,
            height: h,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {ringBody}
        </View>
      )}
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

function TealTerracottaOmbreCard({ children, style }) {
  return (
    <View style={{ width: "100%" }}>
      <LinearGradient
        colors={[
          "rgba(74,172,169,0.07)",
          "rgba(176,152,136,0.09)",
          "rgba(200,112,80,0.07)",
          "rgba(74,139,122,0.06)",
        ]}
        locations={[0, 0.38, 0.68, 1]}
        start={{ x: 0.12, y: 0.06 }}
        end={{ x: 0.88, y: 0.94 }}
        style={{ borderRadius: 22, padding: 1 }}
      >
        <View
          style={{
            borderRadius: 21,
            overflow: "hidden",
            backgroundColor: "rgba(22,14,4,0.28)",
            borderWidth: 1,
            borderColor: "rgba(221,215,193,0.05)",
          }}
        >
          <LinearGradient
            colors={[
              "rgba(74,139,122,0.11)",
              "rgba(188,152,152,0.08)",
              "rgba(200,112,80,0.09)",
              "rgba(74,172,169,0.05)",
            ]}
            locations={[0, 0.4, 0.72, 1]}
            start={{ x: 0.18, y: 0.08 }}
            end={{ x: 0.82, y: 0.92 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          <View style={[{ padding: 18, gap: 10 }, style]}>{children}</View>
        </View>
      </LinearGradient>
    </View>
  );
}

function GlassField({ label, value = "", onChangeText, placeholder, secure, keyboardType, autoCapitalize = "none", editable }) {
  const canEdit = editable ?? onChangeText != null;
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: pal.w70, fontSize: 12, fontWeight: "600" }}>{label}</Text> : null}
      <View style={{ height: 50, borderRadius: 14, borderWidth: focused ? 1.5 : 1, borderColor: focused ? pal.khaki : pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, justifyContent: "center" }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={canEdit}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          style={{ color: pal.w88, fontSize: 15, padding: 0 }}
          placeholderTextColor={pal.w55}
        />
      </View>
    </View>
  );
}

function secondsToBuffer(total) {
  const t = Math.max(0, Math.floor(total || 0));
  const mm = Math.min(99, Math.floor(t / 60));
  const ss = t % 60;
  return (String(mm).padStart(2, "0") + String(ss).padStart(2, "0")).replace(/^0+(?=\d)/, "");
}

function bufferToSeconds(raw) {
  const padded = raw.padStart(4, "0").slice(-4);
  const mm = parseInt(padded.slice(0, 2), 10) || 0;
  // Seconds field is clamped to 59 so a stray entry like "7:89" can't run.
  const ss = Math.min(59, parseInt(padded.slice(2), 10) || 0);
  return mm * 60 + ss;
}

// Segmented MM:SS entry with industry "shift-from-the-right" typing (like a
// timer app): each new digit pushes in from the right, backspace pops it off.
// Same look as the verification-code boxes.
function TimeBoxes({ initialSeconds = 0, onChange }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(() => secondsToBuffer(initialSeconds));

  const update = (text) => {
    const next = text.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "").slice(-4);
    setRaw(next);
    onChange?.(bufferToSeconds(next));
  };

  const padded = raw.padStart(4, "0").slice(-4);

  const renderBox = (i) => {
    const entered = i >= 4 - raw.length;
    return (
      <View key={i} style={{ width: 48, height: 60, borderRadius: 12, borderWidth: focused ? 1.5 : 1, borderColor: focused ? pal.khaki : pal.glassBorder, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: entered ? pal.white : pal.w30, fontSize: 28, fontWeight: "700" }}>{padded[i]}</Text>
      </View>
    );
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {renderBox(0)}
        {renderBox(1)}
        <Text style={{ color: pal.w70, fontSize: 30, fontWeight: "700" }}>:</Text>
        {renderBox(2)}
        {renderBox(3)}
      </View>
      <TextInput
        ref={inputRef}
        value={raw}
        onChangeText={update}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        caretHidden
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0, textAlign: "center" }}
      />
    </View>
  );
}

function DarkRow({ icon, title, value, onPress, danger }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{ height: 60, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={value ? `${title}, ${value}` : title}
    >
      <MaterialCommunityIcons name={icon} size={20} color={danger ? "#C84545" : pal.teal} />
      <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600" }}>{title}</Text>
      {value ? <Text style={{ color: pal.w55, fontSize: 12 }}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={15} color={pal.w30} />
    </TouchableOpacity>
  );
}

function StatusRow({ icon, title, value, danger }) {
  return (
    <View style={{ minHeight: 60, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <MaterialCommunityIcons name={icon} size={20} color={danger ? "#C84545" : pal.teal} />
      <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600" }}>{title}</Text>
      {value ? <Text style={{ color: pal.w55, fontSize: 12, fontWeight: "600" }}>{value}</Text> : null}
    </View>
  );
}

function Toggle({ on = true, activeColor = pal.teal, onPress, label }) {
  const track = (
    <View style={[{ width: 48, height: 28, borderRadius: 14, padding: 3 }, on ? { backgroundColor: activeColor } : { backgroundColor: "rgba(221,215,193,0.15)" }]}>
      <View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: CREAM }, on ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }]} />
    </View>
  );
  return onPress ? (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
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

function ScrollCue({ text }) {
  const bounce = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;
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
  }, [bounce, reduceMotion]);

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

function SelectRow({ icon, title, selected, onPress, iconLib = "ionicons" }) {
  const IconComponent = iconLib === "mci" ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={title}
      style={{
        minHeight: 60,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: selected ? pal.mauve : pal.glassBorder,
        backgroundColor: selected ? `${pal.mauve}28` : pal.glass,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <IconComponent name={icon} size={20} color={selected ? pal.mauve : pal.teal} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: selected ? pal.white : pal.w88 }}>{title}</Text>
      {selected ? <Text style={{ color: pal.w55, fontSize: 12 }}>Selected</Text> : null}
      <Ionicons name="chevron-forward" size={15} color={pal.w30} />
    </TouchableOpacity>
  );
}

function ControlTile({ icon, iconLib = "ionicons", value, label, onPress, readOnly = false }) {
  const IconComponent = iconLib === "mci" ? MaterialCommunityIcons : Ionicons;
  const content = (
    <>
      <IconComponent name={icon} size={28} color={pal.teal} />
      <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>{value}</Text>
      <Text style={{ fontSize: 12, color: pal.w55, letterSpacing: 0.3 }}>{label}</Text>
    </>
  );
  const style = {
    flex: 1,
    minWidth: "46%",
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: pal.glassBorder,
    backgroundColor: pal.glass,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
  };

  if (readOnly || !onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style} accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label}>
      {content}
    </TouchableOpacity>
  );
}

function PurifierIllustration({ size = 100 }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 6 }}>
      <FanSpiral size={size * 0.85} />
    </View>
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

const CHART_DATA = {
  Day: {
    labels: ["6", "9", "12", "15", "18", "21", "24"],
    points: [[10, 40], [58, 30], [110, 48], [166, 26], [216, 52], [270, 34], [310, 20]],
    trend: "Improving",
    delta: "-8%",
  },
  Week: {
    labels: ["T", "W", "T", "F", "S", "S", "M"],
    points: [[10, 52], [58, 28], [110, 32], [166, 46], [216, 22], [270, 38], [310, 16]],
    trend: "Steady",
    delta: "+12%",
  },
  Month: {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
    points: [[10, 30], [58, 44], [110, 24], [166, 50], [216, 34], [270, 42], [310, 28]],
    trend: "Variable",
    delta: "+5%",
  },
};

function WeekChart({ range = "Week", onFilterStatus }) {
  const data = CHART_DATA[range] || CHART_DATA.Week;
  const d = `M ${data.points.map((p) => p.join(" ")).join(" L ")}`;
  return (
    <GlassCard>
      <Text style={{ color: pal.w70, fontSize: 12, fontWeight: "700" }}>AQI trend · lower is cleaner</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6 }}>
        {data.labels.map((label, i) => (
          <Text key={i} style={{ color: pal.w55, fontSize: 11, letterSpacing: 1 }}>{label}</Text>
        ))}
      </View>
      <Svg width="100%" height={72} viewBox="0 0 320 72">
        <Path d={d} fill="none" stroke="rgba(221,215,193,0.75)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.points.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={3.5} fill="rgba(221,215,193,0.90)" />
        ))}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: pal.white, fontSize: 22, fontWeight: "700" }}>{data.trend}</Text>
          <Text style={{ color: pal.teal, fontSize: 12, fontWeight: "600" }}>{data.delta}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={onFilterStatus} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: pal.glass, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: pal.glassBorder }}>
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <PulseGlowInviteCard ringId="Auth" variant="tealTerracottaPurple" animate={false} oval>
            <FanSpiral
              size={width * 0.42}
              bladeColors={[`rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`, `rgba(${CREAM_RGB},0.88)`]}
              centerColor={CREAM}
            />
            <Text style={{ color: CREAM, fontSize: 26, fontWeight: "700" }}>My Purifier</Text>
            <Text style={{ color: CREAM, fontSize: 13, textAlign: "center", lineHeight: 20 }}>
              Control air quality, sleep mode, filters, and aroma.
            </Text>
          </PulseGlowInviteCard>
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
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("mesud@example.com");
  const [password, setPassword] = useState("Vestel1234");
  const [emailErr, setEmailErr] = useState(false);

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Login" subtitle="Demo account — credentials pre-filled" navigation={navigation} onBack={() => navigation.navigate("AuthChoice")} />
      <GlassField label="Email" value={email} onChangeText={(t) => { setEmail(t); setEmailErr(false); }} placeholder="Your email" keyboardType="email-address" />
      {emailErr ? <Text style={{ color: "#F0A88C", fontSize: 12, marginTop: -8 }}>Enter a valid email address</Text> : null}
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
      <MauveOmbreButton label="Log In" onPress={() => (isValidEmail(email) ? navigation.navigate("Devices") : setEmailErr(true))} />
      <Text style={{ textAlign: "center", color: pal.w30, fontSize: 12 }}>or</Text>
      <GlassButton label="Continue with Google" onPress={() => navigation.navigate("Devices")} />
    </DarkScreen>
  );
}

function CreateAccount({ navigation }) {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Create Account" subtitle="Enter your email to sign up" navigation={navigation} onBack={() => navigation.navigate("AuthChoice")} />
      <Text style={{ color: pal.khaki, fontSize: 13, fontWeight: "600", letterSpacing: 2, textAlign: "center", marginVertical: 8 }}>
        VESTEL AIR PURIFIER
      </Text>
      <GlassField label="Email" value={email} onChangeText={(t) => { setEmail(t); setEmailErr(false); }} placeholder="Your email" keyboardType="email-address" />
      {emailErr ? <Text style={{ color: "#F0A88C", fontSize: 12, marginTop: -8 }}>Enter a valid email address</Text> : null}
      <MauveOmbreButton label="Create an account" onPress={() => (isValidEmail(email) ? navigation.navigate("VerifyEmail") : setEmailErr(true))} />
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
  const [codeErr, setCodeErr] = useState(false);
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
        {code.map((digit, i) => {
          const active = i === code.findIndex((d) => d === "");
          const highlight = digit !== "" || active;
          return (
            <View key={i} style={{ width: (width - 44 - 40) / 6, height: 52, borderRadius: 12, borderWidth: highlight ? 1.5 : 1, borderColor: highlight ? pal.khaki : pal.glassBorder, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center" }}>
              <TextInput
                ref={(ref) => { codeRefs.current[i] = ref; }}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, i)}
                onFocus={() => {
                  const target = code.findIndex((d) => d === "");
                  if (target !== -1 && i > target) codeRefs.current[target]?.focus();
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={{ color: pal.white, fontSize: 20, fontWeight: "700", textAlign: "center", width: "100%", height: "100%" }}
              />
            </View>
          );
        })}
      </View>
      {codeErr ? <Text style={{ color: "#F0A88C", fontSize: 12, textAlign: "center" }}>Enter the full 6-digit code</Text> : null}
      <MauveOmbreButton label="Verify Email" onPress={() => (isValidOtp(code) ? navigation.navigate("CreatePassword") : setCodeErr(true))} />
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
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) codeRefs.current[index + 1]?.focus();
  };

  return (
    <DarkScreen gradient={G_WARM}>
      <SuccessMark icon="mail" ombre="tealMauve" />
      <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Check your inbox</Text>
      <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>
        Enter the 6-digit code sent to mesud@example.com
      </Text>
      <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
        {code.map((digit, i) => {
          const active = i === code.findIndex((d) => d === "");
          const highlight = digit !== "" || active;
          return (
            <View key={i} style={{ width: (width - 44 - 40) / 6, height: 52, borderRadius: 12, borderWidth: highlight ? 1.5 : 1, borderColor: highlight ? pal.khaki : pal.glassBorder, backgroundColor: pal.glass, alignItems: "center", justifyContent: "center" }}>
              <TextInput
                ref={(ref) => { codeRefs.current[i] = ref; }}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, i)}
                onFocus={() => {
                  const target = code.findIndex((d) => d === "");
                  if (target !== -1 && i > target) codeRefs.current[target]?.focus();
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={{ color: pal.white, fontSize: 20, fontWeight: "700", textAlign: "center", width: "100%", height: "100%" }}
              />
            </View>
          );
        })}
      </View>
      <MauveOmbreButton label="Verify code" onPress={() => navigation.navigate("PasswordResetSuccess")} />
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

// ─── Setup Flow (post-login) ──────────────────────────────────────────────────
function Devices({ navigation }) {
  const { devices } = useRooms();
  const isEmpty = devices.length === 0;

  return (
    <DarkScreen gradient={G_WARM} scroll={!isEmpty}>
      <DarkHeader title="Devices" subtitle="Select a purifier to continue" navigation={navigation.canGoBack() ? navigation : null} />
      {isEmpty ? (
        <View style={{ flex: 1, justifyContent: "center", paddingBottom: 48 }}>
          <PulseGlowInviteCard>
            <PurifierIllustration size={120} />
            <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>0 Devices Connected</Text>
            <Text style={{ fontSize: 13, color: pal.w70, textAlign: "center", lineHeight: 20 }}>
              Add or reconnect a purifier to start controlling air
            </Text>
            <MauveFlatButton label="Add New Purifier" onPress={() => navigation.navigate("AddNewPurifier")} />
          </PulseGlowInviteCard>
        </View>
      ) : (
        <>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} navigation={navigation} compact />
          ))}
          <GlassButton label="Add New Purifier" onPress={() => navigation.navigate("AddNewPurifier")} />
          <MauveOmbreButton label="Open Dashboard" onPress={() => navigation.navigate("Dashboard")} />
        </>
      )}
    </DarkScreen>
  );
}

function AddNewPurifier({ navigation }) {
  return (
    <DarkScreen gradient={G_WARM} scroll={false}>
      <View style={{ flex: 1, gap: 14 }}>
        <DarkHeader title="Add New Purifier" subtitle="Start purifier setup" navigation={navigation} />
        <View style={{ flex: 1, justifyContent: "center", paddingBottom: 8 }}>
          <PulseGlowInviteCard ringId="Setup">
            <PurifierIllustration size={130} />
            <Text style={{ fontSize: 18, fontWeight: "700", color: pal.white }}>Vestel VHT-402 WiFi</Text>
            <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center", lineHeight: 20, paddingHorizontal: 12 }}>
              Power on the purifier and keep it near your router.
            </Text>
          </PulseGlowInviteCard>
        </View>
        <MauveOmbreButton label="Continue Setup" onPress={() => navigation.navigate("PlacePurifier")} />
      </View>
    </DarkScreen>
  );
}

function PlacePurifier({ navigation }) {
  const { allRoomOptions, pairingRoomId, setPairingRoomId, addCustomRoom } = useRooms();
  const [customName, setCustomName] = useState("");
  const [customError, setCustomError] = useState("");
  const pairingRoom = allRoomOptions.find((room) => room.id === pairingRoomId) ?? allRoomOptions[0];

  const handleAddCustomRoom = () => {
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError("Enter a room name");
      return;
    }
    if (!addCustomRoom(trimmed)) {
      setCustomError("This room already exists");
      return;
    }
    setCustomName("");
    setCustomError("");
  };

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Place your purifier" subtitle="Where would you like to place this purifier?" navigation={navigation} />
      <TealTerracottaOmbreCard style={{ alignItems: "center", gap: 10 }}>
        <PurifierIllustration size={100} />
        <Text style={{ fontSize: 17, fontWeight: "700", color: pal.white }}>{pairingRoom.name} Purifier</Text>
        <Text style={{ fontSize: 13, color: pal.w55 }}>Selected room: {pairingRoom.name}</Text>
      </TealTerracottaOmbreCard>
      {allRoomOptions.map((room) => (
        <SelectRow
          key={room.id}
          icon={room.icon || "home-outline"}
          title={room.isCustom ? `${room.name} · Custom` : room.name}
          selected={room.id === pairingRoomId}
          onPress={() => setPairingRoomId(room.id)}
        />
      ))}
      <GlassCard style={{ gap: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: pal.white }}>Add custom room</Text>
        <Text style={{ fontSize: 12, color: pal.w55, lineHeight: 18 }}>
          Create a new room name alongside the defaults above.
        </Text>
        <GlassField
          label="Room name"
          value={customName}
          onChangeText={(text) => {
            setCustomName(text);
            setCustomError("");
          }}
          placeholder="e.g. Home Office, Nursery"
          autoCapitalize="words"
        />
        {customError ? <Text style={{ color: "#C84545", fontSize: 12 }}>{customError}</Text> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ROOM_PRESETS.map((preset) => {
            const taken = allRoomOptions.some((room) => room.name.toLowerCase() === preset.toLowerCase());
            const selected = customName.toLowerCase() === preset.toLowerCase();
            return (
              <TouchableOpacity
                key={preset}
                activeOpacity={0.85}
                disabled={taken}
                onPress={() => {
                  setCustomName(preset);
                  setCustomError("");
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  opacity: taken ? 0.4 : 1,
                  borderColor: selected ? pal.mauve : pal.glassBorder,
                  backgroundColor: selected ? `${pal.mauve}28` : pal.glass,
                }}
              >
                <Text style={{ color: selected ? pal.white : pal.w70, fontSize: 12, fontWeight: "600" }}>{preset}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <GlassButton label="Add room" onPress={handleAddCustomRoom} />
      </GlassCard>
      <MauveOmbreButton label="Continue to Wi-Fi" onPress={() => navigation.navigate("WifiCredentials")} />
    </DarkScreen>
  );
}

function DeviceCard({ device, navigation, compact = false }) {
  const { activeRoomId, setActiveRoomId, removeDevice } = useRooms();
  const isActive = device.roomId === activeRoomId && device.status !== "Disconnected";

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isActive ? pal.mauve : pal.glassBorder,
        backgroundColor: isActive ? `${pal.mauve}22` : pal.glass,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}
        onPress={() => {
          setActiveRoomId(device.roomId);
          navigation.navigate("DeviceControl", { deviceId: device.id });
        }}
      >
        <PurifierIllustration size={72} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: pal.white }}>{device.roomName} Purifier</Text>
          <Text style={{ fontSize: 12, color: pal.w55 }}>{device.roomName} • {device.model}</Text>
          <View style={{ alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: device.status === "Disconnected" ? "rgba(221,215,193,0.12)" : `${pal.teal}30` }}>
            <Text style={{ color: device.status === "Disconnected" ? pal.w55 : pal.teal, fontSize: 11, fontWeight: "700" }}>{device.status}</Text>
          </View>
        </View>
        {!compact ? <Ionicons name="chevron-forward" size={18} color={pal.w30} /> : null}
      </TouchableOpacity>
      {!compact ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <GlassButton
            label="Delete Device"
            onPress={() =>
              Alert.alert("Delete device?", `Remove the ${device.roomName} purifier from your account.`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeDevice(device.id) },
              ])
            }
          />
        </View>
      ) : null}
    </View>
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
  const { pairingRoom } = useRooms();

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
          <Text style={{ color: CREAM, fontSize: 13, textAlign: "center", lineHeight: 20 }}>Signal strong · {pairingRoom.name}</Text>
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
  const { addPairedDevice, pairingRoomId } = useRooms();

  return (
    <DarkScreen gradient={G_WARM} padded={false} scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 44, justifyContent: "space-between" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <SuccessMark ombre="tealMauve" />
          <Text style={{ fontSize: 24, fontWeight: "800", color: pal.white, textAlign: "center" }}>Purifier connected</Text>
          <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center", lineHeight: 20 }}>Air quality monitoring is active.</Text>
        </View>
        <MauveOmbreButton
          label="Go to Device Management"
          onPress={() => {
            addPairedDevice(pairingRoomId);
            navigation.navigate("DeviceManagement");
          }}
        />
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

// ─── Device Timers (per-device aroma + purifier) ──────────────────────────────
function formatDuration(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function shutOffLabelToSeconds(label) {
  switch (label) {
    case "15 min": return 15 * 60;
    case "30 min": return 30 * 60;
    case "45 min": return 45 * 60;
    case "1 hour": return 3600;
    case "2 hours": return 7200;
    case "4 hours": return 14400;
    default: return null;
  }
}

const emptyTimerSlot = () => ({ secondsRemaining: null, isRunning: false, isPaused: false });

function ensureDeviceTimers(state, deviceId) {
  if (state[deviceId]) return state;
  return {
    ...state,
    [deviceId]: { aroma: emptyTimerSlot(), purifier: emptyTimerSlot() },
  };
}

const DeviceTimersContext = createContext(null);

function DeviceTimersProvider({ children }) {
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((current) => {
        let next = null;
        for (const deviceId of Object.keys(current)) {
          const deviceTimers = current[deviceId];
          let deviceChanged = false;
          const updatedDevice = { ...deviceTimers };
          for (const type of ["aroma", "purifier"]) {
            const slot = deviceTimers[type];
            if (slot?.isRunning && !slot.isPaused && slot.secondsRemaining > 0) {
              const remaining = slot.secondsRemaining - 1;
              updatedDevice[type] = {
                ...slot,
                secondsRemaining: remaining,
                isRunning: remaining > 0,
                isPaused: false,
              };
              deviceChanged = true;
            }
          }
          if (deviceChanged) {
            if (!next) next = { ...current };
            next[deviceId] = updatedDevice;
          }
        }
        return next || current;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTimer = (deviceId, type, totalSeconds) => {
    setTimers((current) => {
      const base = ensureDeviceTimers(current, deviceId);
      return {
        ...base,
        [deviceId]: {
          ...base[deviceId],
          [type]: { secondsRemaining: totalSeconds, isRunning: true, isPaused: false },
        },
      };
    });
  };

  const pauseTimer = (deviceId, type) => {
    setTimers((current) => {
      const base = ensureDeviceTimers(current, deviceId);
      const slot = base[deviceId][type];
      return {
        ...base,
        [deviceId]: {
          ...base[deviceId],
          [type]: { ...slot, isRunning: false, isPaused: true },
        },
      };
    });
  };

  const resumeTimer = (deviceId, type) => {
    setTimers((current) => {
      const base = ensureDeviceTimers(current, deviceId);
      const slot = base[deviceId][type];
      if (slot.secondsRemaining > 0) {
        return {
          ...base,
          [deviceId]: {
            ...base[deviceId],
            [type]: { ...slot, isRunning: true, isPaused: false },
          },
        };
      }
      return base;
    });
  };

  const resetTimer = (deviceId, type) => {
    setTimers((current) => {
      const base = ensureDeviceTimers(current, deviceId);
      return {
        ...base,
        [deviceId]: { ...base[deviceId], [type]: emptyTimerSlot() },
      };
    });
  };

  const getDeviceTimers = (deviceId) => {
    const device = timers[deviceId];
    if (!device) return { aroma: emptyTimerSlot(), purifier: emptyTimerSlot() };
    return device;
  };

  return (
    <DeviceTimersContext.Provider value={{ startTimer, pauseTimer, resumeTimer, resetTimer, getDeviceTimers }}>
      {children}
    </DeviceTimersContext.Provider>
  );
}

function useDeviceTimers() {
  return useContext(DeviceTimersContext);
}

// ─── Rooms (shared) ───────────────────────────────────────────────────────────
const BASE_ROOM_OPTIONS = [
  { id: "living-room", name: "Living Room", icon: "home-outline" },
  { id: "bedroom", name: "Bedroom", icon: "home-outline" },
  { id: "kitchen", name: "Kitchen", icon: "home-outline" },
  { id: "office", name: "Office", icon: "home-outline" },
];

const ROOM_PRESETS = ["Nursery", "Garage", "Study", "Balcony"];

const RoomsContext = createContext(null);

function RoomsProvider({ children }) {
  const [customRooms, setCustomRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState("living-room");
  const [pairingRoomId, setPairingRoomId] = useState("living-room");

  const allRoomOptions = [...BASE_ROOM_OPTIONS, ...customRooms];

  const addCustomRoom = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (allRoomOptions.some((room) => room.name.toLowerCase() === trimmed.toLowerCase())) return false;
    const id = `custom-${Date.now()}`;
    const room = { id, name: trimmed, icon: "home-outline", isCustom: true };
    setCustomRooms((prev) => [...prev, room]);
    setPairingRoomId(id);
    setActiveRoomId(id);
    return true;
  };

  const setActiveRoom = (roomId) => {
    setActiveRoomId(roomId);
  };

  const addPairedDevice = (roomId) => {
    const room = allRoomOptions.find((item) => item.id === roomId);
    if (!room) return;
    setDevices((prev) => {
      const withoutRoom = prev.filter((device) => device.roomId !== roomId);
      return [
        ...withoutRoom,
        {
          id: `device-${Date.now()}`,
          roomId,
          roomName: room.name,
          model: "VESTEL VHT-402 WiFi",
          status: "Active",
        },
      ];
    });
    setActiveRoomId(roomId);
  };

  const removeDevice = (deviceId) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
  };

  const disconnectDevice = (deviceId) => {
    setDevices((prev) =>
      prev.map((device) => (device.id === deviceId ? { ...device, status: "Disconnected" } : device))
    );
  };

  const connectDevice = (deviceId) => {
    let roomId = activeRoomId;
    setDevices((prev) => {
      const target = prev.find((device) => device.id === deviceId);
      if (!target) return prev;
      roomId = target.roomId;
      return prev.map((device) =>
        device.id === deviceId ? { ...device, status: "Active" } : device
      );
    });
    setActiveRoomId(roomId);
  };

  const activeDevices = devices.filter((device) => device.status === "Active");

  const activeRoom = allRoomOptions.find((room) => room.id === activeRoomId) ?? allRoomOptions[0];
  const pairingRoom = allRoomOptions.find((room) => room.id === pairingRoomId) ?? allRoomOptions[0];

  return (
    <RoomsContext.Provider
      value={{
        allRoomOptions,
        customRooms,
        devices,
        activeDevices,
        activeRoom,
        activeRoomId,
        setActiveRoomId: setActiveRoom,
        pairingRoomId,
        setPairingRoomId,
        pairingRoom,
        addCustomRoom,
        addPairedDevice,
        removeDevice,
        disconnectDevice,
        connectDevice,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

function useRooms() {
  return useContext(RoomsContext);
}

// ─── Device Settings (shared) ─────────────────────────────────────────────────
const DEFAULT_AUTOMATIONS = [
  { id: "allergy", name: "Allergy preset", on: true },
  { id: "pet", name: "Pet preset", on: false },
  { id: "night", name: "Night preset", on: true },
];

// Per-device (per-room) controllable properties.
const DEVICE_DEFAULTS = {
  activeMode: "Sleep",
  fanSpeed: 40,
  aromaLevel: 62,
  aromaScent: "Lavender",
  aromaIntensity: 0.6,
  timer: "Off",
  aqi: 42,
  aqiLabel: "Good",
  pm25: 8,
  tvoc: 85,
  hepaLife: 78,
  carbonLife: 41,
  uvLife: 16,
  sleepEnabled: true,
  ledOn: false,
  autoActivation: true,
  sleepSchedule: "22:30 – 07:00",
};

const DEVICE_KEYS = Object.keys(DEVICE_DEFAULTS);

// Account-level prefs shared across all devices.
const GLOBAL_DEFAULTS = {
  automations: DEFAULT_AUTOMATIONS,
  profileName: "Mesud Guluyev",
  profileEmail: "mesud@example.com",
  notifications: {
    "Filter replacement reminder": true,
    "Poor air quality alert": true,
    "Device offline alert": true,
    "Firmware update available": true,
  },
};

const DeviceSettingsContext = createContext(null);

function DeviceSettingsProvider({ children }) {
  const { activeRoomId, devices } = useRooms();
  const [global, setGlobal] = useState(GLOBAL_DEFAULTS);
  const [byRoom, setByRoom] = useState({}); // roomId -> per-device settings

  // Route each patch to per-device props vs account-level props so existing
  // screens keep calling updateSettings(patch) unchanged — now scoped to the
  // active device (room).
  const updateSettings = (patch) => {
    const devicePatch = {};
    const globalPatch = {};
    Object.keys(patch).forEach((k) => {
      if (DEVICE_KEYS.includes(k)) devicePatch[k] = patch[k];
      else globalPatch[k] = patch[k];
    });
    if (Object.keys(devicePatch).length) {
      setByRoom((prev) => ({ ...prev, [activeRoomId]: { ...DEVICE_DEFAULTS, ...prev[activeRoomId], ...devicePatch } }));
    }
    if (Object.keys(globalPatch).length) {
      setGlobal((prev) => ({ ...prev, ...globalPatch }));
    }
  };

  // Live air-quality simulation per device: each room's AQI drifts and is cleaned
  // faster at its own fan speed.
  useEffect(() => {
    const id = setInterval(() => {
      setByRoom((prev) => {
        const next = { ...prev };
        const roomIds = new Set(devices.map((d) => d.roomId));
        roomIds.add(activeRoomId);
        roomIds.forEach((rid) => {
          const cur = next[rid] || DEVICE_DEFAULTS;
          const t = nextTelemetry({ aqi: cur.aqi }, { fanSpeed: cur.fanSpeed });
          next[rid] = { ...DEVICE_DEFAULTS, ...cur, aqi: t.aqi, aqiLabel: t.aqiLabel, pm25: t.pm25, tvoc: t.tvoc };
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [devices, activeRoomId]);

  const settings = { ...DEVICE_DEFAULTS, ...(byRoom[activeRoomId] || {}), ...global };

  return (
    <DeviceSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </DeviceSettingsContext.Provider>
  );
}

function useDeviceSettings() {
  return useContext(DeviceSettingsContext);
}

// ─── Main App Screens ─────────────────────────────────────────────────────────
function Dashboard({ navigation }) {
  const { getDeviceTimers } = useDeviceTimers();
  const { activeDevices, setActiveRoomId } = useRooms();

  const auraSize = width * 0.92;
  const auraTopY = height * 0.5 - auraSize * 0.5;
  const listTopY = auraTopY + 6;

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
            <TouchableOpacity
              style={s.dashSettingsBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings-sharp" size={24} color="#4A2E5C" />
            </TouchableOpacity>

            <View style={s.dashTopBar}>
              <Text style={s.welcomeHome}>Home</Text>
            </View>

            <View style={[s.dashListBlock, { paddingTop: listTopY }]}>
              <View style={s.activeDeviceList}>
                {activeDevices.map((device) => {
                  const { aroma, purifier } = getDeviceTimers(device.id);
                  const showAroma = aroma.secondsRemaining !== null && aroma.secondsRemaining > 0;
                  const showPurifier = purifier.secondsRemaining !== null && purifier.secondsRemaining > 0;

                  return (
                    <View key={device.id} style={s.activeDeviceBlock}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={s.activeDeviceOval}
                        onPress={() => {
                          setActiveRoomId(device.roomId);
                          navigation.navigate("DeviceControl", { deviceId: device.id });
                        }}
                      >
                        <View style={s.activeDeviceIcon}>
                          <FanSpiral size={36} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={s.activeDeviceTitle}>{device.roomName} Purifier</Text>
                          <Text style={s.activeDeviceMeta}>{device.model}</Text>
                        </View>
                        <View style={s.activeDeviceBadge}>
                          <Text style={s.activeDeviceBadgeText}>Active</Text>
                        </View>
                      </TouchableOpacity>
                      {(showAroma || showPurifier) ? (
                        <View style={s.deviceTimerRow}>
                          {showAroma ? (
                            <View style={s.deviceTimerChip}>
                              <MaterialCommunityIcons name="flower" size={14} color={pal.burgundy} />
                              <Text style={s.deviceTimerChipText}>
                                Aroma {formatDuration(aroma.secondsRemaining)}
                                {aroma.isPaused ? " · Paused" : ""}
                              </Text>
                            </View>
                          ) : null}
                          {showPurifier ? (
                            <View style={s.deviceTimerChip}>
                              <Ionicons name="timer-outline" size={14} color={pal.terracotta} />
                              <Text style={s.deviceTimerChipText}>
                                Shut-off {formatDuration(purifier.secondsRemaining)}
                                {purifier.isPaused ? " · Paused" : ""}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FanControl({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const fanDegree = Math.min(5, Math.max(1, Math.round(settings.fanSpeed / 20) || 1));

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
                    onPress={() => updateSettings({ fanSpeed: deg * 20 })}
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

function ToggleRow({ icon, title, on, onPress }) {
  return (
    <View style={{ minHeight: 60, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <MaterialCommunityIcons name={icon} size={20} color={pal.teal} />
      <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600" }}>{title}</Text>
      <Toggle on={on} onPress={onPress} label={title} />
    </View>
  );
}

function SleepMode({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Sleep Mode" subtitle="Silent bedroom routine" navigation={navigation} />
      <GlassCard style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Noise Level</Text>
        <Text style={{ color: pal.white, fontSize: 44, fontWeight: "300" }}>
          {settings.sleepEnabled ? "22" : "38"} <Text style={{ fontSize: 20, color: pal.w55 }}>dB</Text>
        </Text>
        <ProgressBar value={settings.sleepEnabled ? 0.3 : 0.6} />
      </GlassCard>
      <ToggleRow icon="power-sleep" title="Sleep mode" on={settings.sleepEnabled} onPress={() => updateSettings({ sleepEnabled: !settings.sleepEnabled })} />
      <DarkRow icon="calendar-night" title="Schedule" value={settings.sleepSchedule} />
      <ToggleRow icon="brightness-6" title="LED brightness" on={settings.ledOn} onPress={() => updateSettings({ ledOn: !settings.ledOn })} />
      <ToggleRow icon="auto-fix" title="Auto activation" on={settings.autoActivation} onPress={() => updateSettings({ autoActivation: !settings.autoActivation })} />
    </DarkScreen>
  );
}

function FilterMaintenance({ navigation }) {
  const { settings } = useDeviceSettings();
  return (
    <DarkScreen gradient={G_QUALITY}>
      <DarkHeader title="Filter Life" subtitle="HEPA H13 status" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <CircleRing value={settings.hepaLife / 100} size={210} label="HEPA filter" color={pal.teal} />
      </View>
      <StatusRow icon="air-filter" title="HEPA H13 Filter" value={`${settings.hepaLife}%`} />
      <StatusRow icon="air-filter" title="Carbon Pre-filter" value={`${settings.carbonLife}%`} />
      <StatusRow icon="lamp" title="UV-C Lamp" value={`${settings.uvLife}%`} danger />
      <GlassButton label="Replace filter" onPress={() => navigation.navigate("ReplaceFilter")} filled />
    </DarkScreen>
  );
}

function ReplaceFilter({ navigation }) {
  const { updateSettings } = useDeviceSettings();
  const showToast = useToast();
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Replace Filter" subtitle="Guided workflow" navigation={navigation} />
      {["Turn purifier off", "Remove old filter", "Install new filter"].map((x, i) => (
        <DarkRow key={x} icon={`numeric-${i + 1}-circle`} title={`${i + 1}. ${x}`} value="" />
      ))}
      <GlassButton
        label="Filter replaced"
        onPress={() => {
          updateSettings({ hepaLife: 100, carbonLife: 100, uvLife: 100 });
          showToast("Filter replaced");
          navigation.navigate("FilterMaintenance");
        }}
        filled
      />
    </DarkScreen>
  );
}

const ANALYTICS_STATS = {
  Day: { best: "6", avg: "14", peak: "39" },
  Week: { best: "5", avg: "12", peak: "48" },
  Month: { best: "4", avg: "18", peak: "63" },
};

function Analytics({ navigation }) {
  const [range, setRange] = useState("Week");
  const stats = ANALYTICS_STATS[range];
  return (
    <DarkScreen gradient={G_QUALITY}>
      <DarkHeader title="Air Quality" subtitle={`${range} overview`} navigation={navigation} />
      <View style={{ flexDirection: "row", height: 38, borderRadius: 14, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, padding: 4 }}>
        {["Day", "Week", "Month"].map((t) => {
          const selected = range === t;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.85}
              onPress={() => setRange(t)}
              style={[{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 }, selected && { backgroundColor: pal.teal }]}
            >
              <Text style={[{ fontSize: 13, fontWeight: "700" }, selected ? { color: pal.white } : { color: pal.w55 }]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <WeekChart range={range} onFilterStatus={() => navigation.navigate("FilterMaintenance")} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[["leaf", stats.best, "Best"], ["chart-line", stats.avg, "Avg"], ["alert", stats.peak, "Peak"]].map(([icon, value, label]) => (
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

const AUTOMATION_ICONS = { allergy: "flower-pollen", pet: "paw", night: "weather-night" };

function Automation({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const toggle = (id) =>
    updateSettings({ automations: settings.automations.map((a) => (a.id === id ? { ...a, on: !a.on } : a)) });
  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Automation" subtitle="Scenario presets" navigation={navigation} />
      {settings.automations.map((a) => (
        <ToggleRow key={a.id} icon={AUTOMATION_ICONS[a.id] || "robot"} title={a.name} on={a.on} onPress={() => toggle(a.id)} />
      ))}
      <GlassButton label="Create rule" onPress={() => navigation.navigate("CustomAutomation")} filled />
    </DarkScreen>
  );
}

const TRIGGER_OPTIONS = ["PM2.5 above 35", "PM2.5 above 50", "AQI above 100", "Pollen high"];
const CONDITION_OPTIONS = ["18:00 – 23:00", "All day", "Night only", "Weekends"];
const ACTION_OPTIONS = ["Allergy Mode", "Boost fan", "Sleep Mode", "Turbo"];

function CustomAutomation({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const [ruleName, setRuleName] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [condition, setCondition] = useState(0);
  const [action, setAction] = useState(0);

  const handleSave = () => {
    const name = ruleName.trim() || ACTION_OPTIONS[action];
    updateSettings({ automations: [...settings.automations, { id: `rule-${Date.now()}`, name, on: true }] });
    navigation.navigate("Automation");
  };

  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Custom Rule" subtitle="Trigger-based action" navigation={navigation} />
      <GlassField label="Rule name" value={ruleName} onChangeText={setRuleName} placeholder="e.g. Evening allergy care" />
      <SelectRow icon="target" title={`Trigger · ${TRIGGER_OPTIONS[trigger]}`} onPress={() => setTrigger((i) => (i + 1) % TRIGGER_OPTIONS.length)} />
      <SelectRow icon="clock-outline" title={`Condition · ${CONDITION_OPTIONS[condition]}`} onPress={() => setCondition((i) => (i + 1) % CONDITION_OPTIONS.length)} />
      <SelectRow icon="auto-fix" title={`Action · ${ACTION_OPTIONS[action]}`} onPress={() => setAction((i) => (i + 1) % ACTION_OPTIONS.length)} />
      <Text style={{ color: pal.w30, fontSize: 11, textAlign: "center" }}>Tap a row to change it</Text>
      <GlassButton label="Save automation" onPress={handleSave} filled />
    </DarkScreen>
  );
}

// ─── Settings & Aroma ─────────────────────────────────────────────────────────
function Settings({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  return (
    <DarkScreen gradient={G_QUALITY}>
      <View style={{ paddingTop: 8, paddingBottom: 6 }}>
        <Text style={{ color: pal.white, fontSize: 28, fontWeight: "700" }}>Settings</Text>
        <Text style={{ color: pal.w55, fontSize: 13, marginTop: 4 }}>App and device preferences</Text>
      </View>
      <DarkRow icon="brightness-6" title="Display" value={settings.ledOn ? "LED on" : "LED off"} onPress={() => updateSettings({ ledOn: !settings.ledOn })} />
      <DarkRow icon="bell-outline" title="Notifications" onPress={() => navigation.navigate("Notifications")} />
      <DarkRow icon="information-outline" title="Device Management" onPress={() => navigation.navigate("DeviceManagement")} />
      <View style={{ height: 8 }} />
      <DarkRow icon="account-outline" title="Account" value="Mesud" onPress={() => navigation.navigate("UserProfile")} />
      <DarkRow icon="download" title="Firmware" value="v1.8.2" onPress={() => navigation.navigate("FirmwareAvailable")} />
    </DarkScreen>
  );
}

function Aroma({ navigation, route }) {
  const { settings, updateSettings } = useDeviceSettings();
  const { devices, activeRoom } = useRooms();
  const { startTimer, pauseTimer, resumeTimer, resetTimer, getDeviceTimers } = useDeviceTimers();
  const deviceId =
    route?.params?.deviceId
    ?? devices.find((item) => item.roomId === activeRoom.id)?.id
    ?? devices.find((item) => item.status === "Active")?.id
    ?? devices[0]?.id;
  const { aroma: aromaTimer } = getDeviceTimers(deviceId);
  const { secondsRemaining, isRunning, isPaused } = aromaTimer;
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
  const [selectedAroma, setSelectedAroma] = useState(settings.aromaScent ?? "Lavender");
  const [intensity, setIntensity] = useState(settings.aromaIntensity ?? 0.6);
  const [durationSeconds, setDurationSeconds] = useState(180);
  const showToast = useToast();

  const handleTimerPress = () => {
    if (!deviceId) return;
    if (secondsRemaining === null) {
      const total = Math.max(60, durationSeconds);
      startTimer(deviceId, "aroma", total);
      return;
    }
    if (isRunning) {
      pauseTimer(deviceId, "aroma");
      return;
    }
    if (secondsRemaining > 0) {
      resumeTimer(deviceId, "aroma");
      return;
    }
    resetTimer(deviceId, "aroma");
  };

  const handleSave = () => {
    updateSettings({ aromaScent: selectedAroma, aromaIntensity: intensity });
    showToast("Aroma saved");
    navigation.goBack();
  };

  return (
    <LinearGradient colors={G_TERRACOTTA} locations={[0, 0.5, 1]} style={{ flex: 1 }} start={{ x: 0.05, y: 0 }} end={{ x: 0.95, y: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <DarkHeader title="Aroma" subtitle="Scent, timer & cartridge" navigation={navigation} />

          <GlassCard style={{ gap: 12 }}>
            <Text style={{ fontSize: 11, letterSpacing: 1.5, color: pal.w55, fontWeight: "600" }}>AROMA LEFT</Text>
            <Text style={{ fontSize: 52, fontWeight: "700", color: pal.white }}>{settings.aromaLevel}%</Text>
            <ProgressBar value={settings.aromaLevel / 100} color={pal.burgundy} />
            <Text style={{ fontSize: 12, color: pal.w55 }}>Cartridge remaining</Text>
          </GlassCard>

          <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>Choose scent</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {aromas.map((a) => {
              const selected = a.name === selectedAroma;
              return (
                <TouchableOpacity
                  key={a.name}
                  activeOpacity={0.85}
                  onPress={() => setSelectedAroma(a.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
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
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 4 }}
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
            <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Diffuser timer</Text>
            <Text style={{ color: pal.w30, fontSize: 11 }}>Session countdown · max 60 minutes</Text>
            {secondsRemaining === null ? (
              <TimeBoxes initialSeconds={180} onChange={setDurationSeconds} />
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
            {secondsRemaining !== null ? (
              <TouchableOpacity activeOpacity={0.8} onPress={() => resetTimer(deviceId, "aroma")}>
                <Text style={{ color: pal.w55, fontSize: 12, fontWeight: "600" }}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </GlassCard>

          <GlassButton label="Save settings" onPress={handleSave} filled color={pal.burgundy} />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Device Control Screens ───────────────────────────────────────────────────
function DeviceControl({ navigation, route }) {
  const { activeRoom, devices } = useRooms();
  const { settings } = useDeviceSettings();
  const device = devices.find((item) => item.id === route?.params?.deviceId) ?? devices.find((item) => item.roomId === activeRoom.id);
  const title = device ? `${device.roomName} Purifier` : `${activeRoom.name} Purifier`;

  return (
    <DarkScreen gradient={G_MAUVE}>
      <DarkHeader title={title} subtitle="VESTEL VHT-402 WiFi" navigation={navigation} />
      <GlassCard style={{ gap: 14, borderColor: `${pal.mauve}55` }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 11, letterSpacing: 1.5, color: pal.w55, fontWeight: "600" }}>AIR QUALITY INDEX</Text>
            <Text style={{ fontSize: 28, fontWeight: "700", color: pal.white }}>{settings.aqiLabel}</Text>
          </View>
          <Text style={{ fontSize: 42, fontWeight: "700", color: pal.white }}>{settings.aqi}</Text>
        </View>
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: "rgba(221,215,193,0.06)", padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: pal.w88 }}>PM2.5 live</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${pal.teal}30` }}>
            <Text style={{ color: pal.teal, fontSize: 12, fontWeight: "700" }}>{settings.pm25} µg/m³</Text>
          </View>
        </View>
      </GlassCard>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <ControlTile icon="moon" value={settings.activeMode} label="Mode" onPress={() => navigation.navigate("ActiveMode")} />
        <ControlTile icon="fan" iconLib="mci" value={`${settings.fanSpeed}%`} label="Fan Speed" onPress={() => navigation.navigate("FanSpeedSetting")} />
        <ControlTile icon="flower" iconLib="mci" value={`${settings.aromaLevel}%`} label="Aroma Left" onPress={() => navigation.navigate("Aroma", { deviceId: device?.id })} />
        <ControlTile icon="timer-outline" value={settings.timer} label="Timer" onPress={() => navigation.navigate("TimerSetting", { deviceId: device?.id })} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <GlassButton label="Analytics" onPress={() => navigation.navigate("Analytics")} />
        </View>
        <View style={{ flex: 1 }}>
          <GlassButton label="Settings" onPress={() => navigation.navigate("DeviceSettings")} />
        </View>
      </View>
    </DarkScreen>
  );
}

function ActiveMode({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const [mode, setMode] = useState(settings.activeMode);
  const showToast = useToast();
  const modes = [
    { id: "Sleep", icon: "moon" },
    { id: "Auto", icon: "sparkles" },
    { id: "Allergy", icon: "sparkles" },
  ];
  const modeProgress = { Sleep: 0.33, Auto: 0.6, Allergy: 0.9 };

  return (
    <DarkScreen gradient={G_TEAL}>
      <DarkHeader title="Active Mode" subtitle="Choose the purifier behavior" navigation={navigation} />
      <GlassCard>
        <Text style={{ fontSize: 11, letterSpacing: 1.5, color: pal.w55, fontWeight: "600" }}>CURRENT MODE</Text>
        <Text style={{ fontSize: 32, fontWeight: "700", color: pal.white }}>{mode}</Text>
        <ProgressBar value={modeProgress[mode] ?? 0.5} color={pal.teal} />
      </GlassCard>
      {modes.map((item) => (
        <SelectRow key={item.id} icon={item.icon} title={item.id} selected={mode === item.id} onPress={() => setMode(item.id)} />
      ))}
      <GlassButton
        label="Save setting"
        filled
        onPress={() => {
          updateSettings({ activeMode: mode });
          showToast("Mode saved");
          navigation.goBack();
        }}
      />
    </DarkScreen>
  );
}

function FanSpeedSetting({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const [speed, setSpeed] = useState(settings.fanSpeed);
  const showToast = useToast();
  const presets = [20, 40, 60, 80];

  const adjust = (delta) => {
    setSpeed((prev) => Math.min(100, Math.max(0, prev + delta)));
  };

  return (
    <DarkScreen gradient={G_TEAL_OMBRE}>
      <DarkHeader title="Fan Speed" subtitle="Fine tune airflow" navigation={navigation} />
      <GlassCard style={{ alignItems: "center", gap: 16 }}>
        <Text style={{ alignSelf: "flex-start", fontSize: 11, letterSpacing: 1.5, color: pal.w55, fontWeight: "600" }}>FAN SPEED</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <TouchableOpacity
            onPress={() => adjust(-10)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 22, color: pal.white, fontWeight: "700" }}>−</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 44, fontWeight: "700", color: pal.white, minWidth: 120, textAlign: "center" }}>{speed}%</Text>
          <TouchableOpacity
            onPress={() => adjust(10)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 22, color: pal.white, fontWeight: "700" }}>+</Text>
          </TouchableOpacity>
        </View>
        <ProgressBar value={speed / 100} color={pal.teal} />
      </GlassCard>
      {presets.map((preset) => (
        <SelectRow key={preset} icon="fan" iconLib="mci" title={`${preset}% airflow`} selected={speed === preset} onPress={() => setSpeed(preset)} />
      ))}
      <GlassButton
        label="Save setting"
        filled
        onPress={() => {
          updateSettings({ fanSpeed: speed });
          showToast("Fan speed saved");
          navigation.goBack();
        }}
      />
    </DarkScreen>
  );
}

function AromaCartridge({ navigation }) {
  const { settings } = useDeviceSettings();

  return (
    <DarkScreen gradient={G_BURGUNDY}>
      <DarkHeader title="Aroma" subtitle="Cartridge level" navigation={navigation} />
      <GlassCard style={{ gap: 12 }}>
        <Text style={{ fontSize: 11, letterSpacing: 1.5, color: pal.w55, fontWeight: "600" }}>AROMA LEFT</Text>
        <Text style={{ fontSize: 52, fontWeight: "700", color: pal.white }}>{settings.aromaLevel}%</Text>
        <ProgressBar value={settings.aromaLevel / 100} color={pal.burgundy} />
        <Text style={{ fontSize: 12, color: pal.w55 }}>Cartridge remaining</Text>
      </GlassCard>
    </DarkScreen>
  );
}

function TimerSetting({ navigation, route }) {
  const { settings, updateSettings } = useDeviceSettings();
  const { devices, activeRoom } = useRooms();
  const { startTimer, resetTimer, getDeviceTimers } = useDeviceTimers();
  const deviceId =
    route?.params?.deviceId
    ?? devices.find((item) => item.roomId === activeRoom.id)?.id
    ?? devices.find((item) => item.status === "Active")?.id;
  const { purifier } = getDeviceTimers(deviceId);
  const purifierActive = purifier.secondsRemaining !== null && purifier.secondsRemaining > 0;
  const initialSecs = shutOffLabelToSeconds(settings.timer) ?? 0;
  // The clock is editable (type your own MM:SS); a preset just seeds it.
  const [durationSeconds, setDurationSeconds] = useState(initialSecs);
  const [seed, setSeed] = useState({ seconds: initialSecs, key: 0 });
  const showToast = useToast();
  const options = ["Off", "15 min", "30 min", "45 min", "1 hour"];
  // A preset counts as selected whenever the clock equals its duration, so
  // typing a value that matches a preset highlights it too ("Off" === 00:00).
  const matchedPreset = options.find((o) => (shutOffLabelToSeconds(o) ?? 0) === durationSeconds) ?? null;

  const selectPreset = (option) => {
    const secs = shutOffLabelToSeconds(option) ?? 0;
    setDurationSeconds(secs);
    setSeed((prev) => ({ seconds: secs, key: prev.key + 1 }));
  };

  const handleStart = () => {
    if (deviceId && durationSeconds > 0) startTimer(deviceId, "purifier", durationSeconds);
  };

  const handleStop = () => {
    if (deviceId) resetTimer(deviceId, "purifier");
  };

  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Timer" subtitle="Schedule auto shut-off" navigation={navigation} />
      {options.map((option) => (
        <SelectRow key={option} icon="timer-outline" title={option} selected={matchedPreset === option} onPress={() => selectPreset(option)} />
      ))}
      <GlassCard style={{ alignItems: "center", gap: 12 }}>
        <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Shut-off timer</Text>
        <Text style={{ color: pal.w30, fontSize: 11 }}>Tap a preset or type minutes : seconds</Text>
        {purifierActive ? (
          <Text style={{ color: pal.white, fontSize: 52, fontWeight: "200", letterSpacing: 3 }}>{formatDuration(purifier.secondsRemaining)}</Text>
        ) : (
          <TimeBoxes key={seed.key} initialSeconds={seed.seconds} onChange={setDurationSeconds} />
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={purifierActive ? handleStop : handleStart}
          disabled={!purifierActive && durationSeconds <= 0}
          accessibilityRole="button"
          accessibilityLabel={purifierActive ? "Stop timer" : "Start timer"}
          style={[
            { width: 52, height: 52, borderRadius: 26, backgroundColor: pal.glass, borderWidth: 1, borderColor: pal.glassBorder, alignItems: "center", justifyContent: "center" },
            !purifierActive && durationSeconds <= 0 && { opacity: 0.4 },
          ]}
        >
          <Ionicons name={purifierActive ? "stop" : "play"} size={22} color={pal.white} />
        </TouchableOpacity>
        <Text style={{ color: pal.w30, fontSize: 11 }}>
          {purifierActive ? "Counting down to shut-off…" : durationSeconds > 0 ? "Tap to start countdown" : "Set a duration to start"}
        </Text>
      </GlassCard>
      <GlassButton
        label="Save setting"
        filled
        color={pal.terracotta}
        onPress={() => {
          updateSettings({ timer: matchedPreset ?? "Custom" });
          showToast("Timer saved");
          navigation.goBack();
        }}
      />
    </DarkScreen>
  );
}

function DeviceFilterMaintenance({ navigation }) {
  const { activeRoom, devices } = useRooms();
  const { settings } = useDeviceSettings();
  const device = devices.find((item) => item.roomId === activeRoom.id);
  const subtitle = device ? `${device.roomName} Purifier` : `${activeRoom.name} Purifier`;

  return (
    <DarkScreen gradient={G_QUALITY}>
      <DarkHeader title="Filter Maintenance" subtitle={subtitle} navigation={navigation} />
      <GlassCard style={{ alignItems: "center", gap: 12, paddingVertical: 24 }}>
        <Text style={{ fontSize: 48, fontWeight: "700", color: pal.white }}>{settings.hepaLife}%</Text>
        <Text style={{ fontSize: 14, color: pal.w55, textAlign: "center" }}>HEPA H13 filter life remaining</Text>
        <ProgressBar value={settings.hepaLife / 100} color={pal.teal} />
      </GlassCard>
      <StatusRow icon="air-filter" title="HEPA H13 Filter" value={`${settings.hepaLife}%`} />
      <StatusRow icon="air-filter" title="Carbon Pre-filter" value={`${settings.carbonLife}%`} />
      <StatusRow icon="lamp" title="UV-C Lamp" value={`${settings.uvLife}%`} />
      <GlassButton label="Back to settings" onPress={() => navigation.navigate("DeviceSettings")} />
    </DarkScreen>
  );
}

function DeviceSettings({ navigation }) {
  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Settings" subtitle="Device preferences" navigation={navigation} />
      <DarkRow icon="air-filter" title="Filter Maintenance" onPress={() => navigation.navigate("FilterMaintenance")} />
      <DarkRow icon="bell-outline" title="Notifications" onPress={() => navigation.navigate("Notifications")} />
      <DarkRow icon="download" title="Firmware Update" onPress={() => navigation.navigate("FirmwareAvailable")} />
      <GlassButton label="Back to purifier" onPress={() => navigation.navigate("DeviceControl")} />
    </DarkScreen>
  );
}

// ─── Device & Account Screens ─────────────────────────────────────────────────
function DeviceManagement({ navigation }) {
  const { devices } = useRooms();

  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Device Management" subtitle="Rooms and paired purifiers" navigation={navigation} />
      {devices.length === 0 ? (
        <GlassCard style={{ alignItems: "center", gap: 12, paddingVertical: 24 }}>
          <PurifierIllustration size={100} />
          <Text style={{ fontSize: 16, fontWeight: "700", color: pal.white }}>No purifiers yet</Text>
          <Text style={{ fontSize: 13, color: pal.w55, textAlign: "center" }}>
            Add a purifier and assign it to a room to see it here.
          </Text>
        </GlassCard>
      ) : (
        <View style={{ gap: 14 }}>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} navigation={navigation} />
          ))}
        </View>
      )}
      <GlassButton label="Add Purifier" onPress={() => navigation.navigate("AddNewPurifier")} filled color={pal.terracotta} />
      <MauveOmbreButton label="Go to Home" onPress={() => navigation.navigate("Dashboard")} />
    </DarkScreen>
  );
}

function AddCustomRoom({ navigation }) {
  const { allRoomOptions, addCustomRoom } = useRooms();
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmed = roomName.trim();
    if (!trimmed) {
      setError("Enter a room name");
      return;
    }
    if (allRoomOptions.some((room) => room.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("This room already exists");
      return;
    }
    addCustomRoom(trimmed);
    navigation.goBack();
  };

  const selectPreset = (name) => {
    setRoomName(name);
    setError("");
  };

  return (
    <DarkScreen gradient={G_WARM}>
      <DarkHeader title="Custom Room" subtitle="Name your space" navigation={navigation} />
      <Text style={{ color: pal.w70, fontSize: 14, lineHeight: 22 }}>
        Create a custom room for your purifier.
      </Text>
      <GlassField
        label="Room name"
        value={roomName}
        onChangeText={(text) => {
          setRoomName(text);
          setError("");
        }}
        placeholder="e.g. Home Office"
        autoCapitalize="words"
      />
      {error ? <Text style={{ color: "#C84545", fontSize: 12 }}>{error}</Text> : null}
      <GlassCard>
        <Text style={{ color: pal.w55, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Suggestions</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ROOM_PRESETS.map((preset) => {
            const taken = allRoomOptions.some((room) => room.name.toLowerCase() === preset.toLowerCase());
            const selected = roomName.toLowerCase() === preset.toLowerCase();
            return (
              <TouchableOpacity
                key={preset}
                activeOpacity={0.85}
                disabled={taken}
                onPress={() => selectPreset(preset)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderWidth: 1,
                  opacity: taken ? 0.4 : 1,
                  backgroundColor: selected ? `${pal.mauve}28` : pal.glass,
                  borderColor: selected ? pal.mauve : pal.glassBorder,
                }}
              >
                <Text style={{ color: selected ? pal.white : pal.w70, fontSize: 13, fontWeight: "600" }}>{preset}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>
      <MauveOmbreButton label="Save room" onPress={handleSave} />
    </DarkScreen>
  );
}

const NOTIFICATION_ITEMS = [
  "Filter replacement reminder",
  "Poor air quality alert",
  "Device offline alert",
  "Firmware update available",
];

function Notifications({ navigation }) {
  const { settings, updateSettings } = useDeviceSettings();
  const toggle = (item) =>
    updateSettings({ notifications: { ...settings.notifications, [item]: !settings.notifications[item] } });

  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Notifications" subtitle="Alerts and reminders" navigation={navigation} />
      {NOTIFICATION_ITEMS.map((x) => (
        <View key={x} style={{ minHeight: 62, borderRadius: 16, borderWidth: 1, borderColor: pal.glassBorder, backgroundColor: pal.glass, paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ flex: 1, fontSize: 14, color: pal.w88, fontWeight: "600", paddingRight: 12, lineHeight: 20 }}>{x}</Text>
          <Toggle
            on={settings.notifications[x]}
            activeColor={pal.terracotta}
            onPress={() => toggle(x)}
            label={x}
          />
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
        </View>
      </View>
    </DarkScreen>
  );
}

function FirmwareUpdating({ navigation }) {
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
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Updating Firmware" subtitle="Do not unplug the purifier" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <CircleRing value={progress} size={200} label="Installing v1.8.2" />
      </View>
      <View style={{ flexGrow: 1, minHeight: 16 }} />
      {complete ? (
        <GlassButton label="Finish demo" onPress={() => navigation.navigate("FirmwareComplete")} filled />
      ) : null}
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
  const { settings, updateSettings } = useDeviceSettings();
  const [name, setName] = useState(settings.profileName);
  const [email, setEmail] = useState(settings.profileEmail);
  const showToast = useToast();
  const initial = (settings.profileName || "U").trim().charAt(0).toUpperCase() || "U";

  const handleSave = () => {
    updateSettings({
      profileName: name.trim() || settings.profileName,
      profileEmail: email.trim() || settings.profileEmail,
    });
    showToast("Profile saved");
  };

  return (
    <DarkScreen gradient={G_TERRACOTTA}>
      <DarkHeader title="Profile" subtitle="Account management" navigation={navigation} />
      <View style={{ alignItems: "center", paddingVertical: 12, gap: 10 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: pal.terracotta, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: pal.glassBorder }}>
          <Text style={{ color: pal.white, fontSize: 28, fontWeight: "900" }}>{initial}</Text>
        </View>
        <Text style={{ color: pal.white, fontSize: 20, fontWeight: "700" }}>{settings.profileName}</Text>
        <Text style={{ color: pal.w55, fontSize: 13 }}>{settings.profileEmail}</Text>
      </View>
      <GlassField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
      <GlassField label="Email" value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" />
      <DarkRow
        icon="translate"
        title="Language"
        value={language}
        onPress={() => navigation.navigate("Language", { fromSettings: true })}
      />
      <GlassButton label="Save changes" filled color={pal.terracotta} onPress={handleSave} />
      <GlassButton
        label="Logout"
        onPress={() =>
          Alert.alert("Log out?", "You'll need to sign in again.", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: () => navigation.navigate("SignIn") },
          ])
        }
      />
    </DarkScreen>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const screens = {
  Welcome, Language, AuthChoice, SignIn, CreateAccount, VerifyEmail,
  CreatePassword, AccountCreated, ForgotPassword, ResetEmailSent,
  PasswordResetSuccess, Devices, AddNewPurifier, PlacePurifier, AddDevice, DeviceFound, WifiCredentials,
  PairingProgress, PairingSuccess, PairingError, Dashboard, FanControl,
  SleepMode, FilterMaintenance, ReplaceFilter, Analytics, Automation,
  CustomAutomation, Settings, Aroma, DeviceManagement, DeviceControl, ActiveMode,
  FanSpeedSetting, AromaCartridge, TimerSetting, DeviceFilterMaintenance, DeviceSettings,
  AddCustomRoom, Notifications,
  FirmwareAvailable, FirmwareUpdating, FirmwareComplete, UserProfile,
};

// ─── Watch Prototype (in-app Apple-Watch faces; shares the phone's state) ──────
const WATCH_W = 198;
const WATCH_H = 240;

const watchStyles = StyleSheet.create({
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  roundTxt: { color: "#fff", fontSize: 22, fontWeight: "700" },
});

function WatchFrame({ children }) {
  return (
    <View style={{ width: WATCH_W + 26, height: WATCH_H + 30, borderRadius: 60, backgroundColor: "#0B0B0D", borderWidth: 2, borderColor: "#2C2C30", alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: WATCH_W, height: WATCH_H, borderRadius: 46, overflow: "hidden", backgroundColor: "#000" }}>
        {children}
      </View>
      <View style={{ position: "absolute", right: -3, top: WATCH_H * 0.34, width: 7, height: 34, borderRadius: 4, backgroundColor: "#3A3A3E" }} />
    </View>
  );
}

function WatchFace({ gradient, children }) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: WATCH_W, height: WATCH_H }}>
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 16, justifyContent: "center", gap: 6 }}>{children}</View>
    </LinearGradient>
  );
}

function WatchHome() {
  const { settings } = useDeviceSettings();
  const { activeRoom } = useRooms();
  const info = aqiInfo(settings.aqi);
  return (
    <WatchFace gradient={["#E2DCC6", "#A9C2B5", "#4A8B7A"]}>
      <Text style={{ color: "#28302C", fontSize: 17, fontWeight: "700", fontStyle: "italic", textAlign: "center" }}>Welcome Home</Text>
      <Text style={{ color: "#28302C", fontSize: 11, textAlign: "center" }}>{activeRoom?.name ?? "Living Room"}</Text>
      <View style={{ alignItems: "center", marginVertical: 2 }}>
        <FanSpiral size={92} bladeColors={[info.color, info.color, info.color]} centerColor="#FFFFFF" />
      </View>
      <Text style={{ color: info.color, fontSize: 13, fontWeight: "800", textAlign: "center" }}>
        {info.key === "good" ? "Air is clean" : `The air quality is ${info.label.toLowerCase()}`}
      </Text>
      <Text style={{ color: "#28302C", fontSize: 10, textAlign: "center" }}>PM2.5 {settings.pm25}  |  TVOC {settings.tvoc}</Text>
    </WatchFace>
  );
}

function WatchAirQuality() {
  const { settings } = useDeviceSettings();
  const info = aqiInfo(settings.aqi);
  return (
    <WatchFace gradient={["#2E5E63", "#39395F", "#241636"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>AIR QUALITY</Text>
      <Text style={{ color: pal.white, fontSize: 40, fontWeight: "800", textAlign: "center" }}>{settings.aqi}</Text>
      <Text style={{ color: info.color, fontSize: 13, fontWeight: "700", textAlign: "center" }}>{settings.aqiLabel}</Text>
      <Svg width={WATCH_W - 36} height={40} viewBox="0 0 160 40" style={{ alignSelf: "center", marginTop: 4 }}>
        <Path d="M2 30 C 20 10, 40 26, 60 16 S 100 28, 120 12 S 150 22, 158 8" fill="none" stroke="rgba(221,215,193,0.8)" strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <Text style={{ color: pal.w55, fontSize: 10, textAlign: "center" }}>PM2.5 {settings.pm25} · TVOC {settings.tvoc}</Text>
    </WatchFace>
  );
}

function WatchFan() {
  const { settings, updateSettings } = useDeviceSettings();
  const deg = Math.min(5, Math.max(1, Math.round(settings.fanSpeed / 20) || 1));
  const setDeg = (d) => updateSettings({ fanSpeed: Math.min(100, Math.max(20, d * 20)) });
  return (
    <WatchFace gradient={["#4AACA9", "#39395F", "#241636"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>FAN DEGREE</Text>
      <View style={{ alignItems: "center" }}><FanSpiral size={66} bladeColors={[pal.white, pal.white, pal.white]} centerColor="#FFFFFF" /></View>
      <Text style={{ color: pal.white, fontSize: 30, fontWeight: "800", textAlign: "center" }}>{deg}</Text>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}>
        <TouchableOpacity onPress={() => setDeg(deg - 1)} style={watchStyles.round}><Text style={watchStyles.roundTxt}>−</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setDeg(deg + 1)} style={watchStyles.round}><Text style={watchStyles.roundTxt}>+</Text></TouchableOpacity>
      </View>
    </WatchFace>
  );
}

function WatchAroma() {
  const { settings, updateSettings } = useDeviceSettings();
  const { devices, activeRoomId } = useRooms();
  const { startTimer, pauseTimer, resumeTimer, resetTimer, getDeviceTimers } = useDeviceTimers();
  const deviceId = devices.find((d) => d.roomId === activeRoomId)?.id ?? devices[0]?.id;
  const { aroma } = getDeviceTimers(deviceId);
  const running = aroma.secondsRemaining !== null;
  const scents = ["Mint", "Lavender", "Eucalyptus"];
  const [pendingMin, setPendingMin] = useState(5);

  return (
    <WatchFace gradient={["#8B2535", "#4D1020", "#1A0508"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>AROMA</Text>
      {running ? (
        <>
          <MaterialCommunityIcons name="flower" size={28} color="#E8C9C9" style={{ alignSelf: "center" }} />
          <Text style={{ color: "#F0DADA", fontSize: 30, fontWeight: "800", textAlign: "center" }}>{formatDuration(aroma.secondsRemaining)}</Text>
          <Text style={{ color: pal.w55, fontSize: 10, textAlign: "center" }}>{aroma.isRunning ? "Diffusing…" : "Paused"}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={aroma.isRunning ? "Pause diffuser" : "Resume diffuser"} onPress={() => (aroma.isRunning ? pauseTimer(deviceId, "aroma") : resumeTimer(deviceId, "aroma"))} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" }}>
              <Ionicons name={aroma.isRunning ? "pause" : "play"} size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Stop diffuser" onPress={() => resetTimer(deviceId, "aroma")} style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" }}>
              <Ionicons name="stop" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={{ color: "#F0DADA", fontSize: 18, fontWeight: "800", textAlign: "center" }}>{settings.aromaScent}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
            {scents.map((sc) => (
              <TouchableOpacity key={sc} onPress={() => updateSettings({ aromaScent: sc })} accessibilityRole="button" accessibilityState={{ selected: sc === settings.aromaScent }} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: sc === settings.aromaScent ? "#E8C9C9" : "rgba(255,255,255,0.22)" }}>
                <Text style={{ color: pal.white, fontSize: 10 }}>{sc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: pal.w55, fontSize: 10, textAlign: "center" }}>Diffuser timer</Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            {[3, 5, 10].map((m) => {
              const sel = pendingMin === m;
              return (
                <TouchableOpacity key={m} accessibilityRole="button" accessibilityState={{ selected: sel }} accessibilityLabel={`${m} minutes`} onPress={() => setPendingMin(m)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: sel ? "#E8C9C9" : "transparent", backgroundColor: sel ? "rgba(232,201,201,0.25)" : "rgba(255,255,255,0.12)" }}>
                  <Text style={{ color: pal.white, fontSize: 11, fontWeight: sel ? "800" : "600" }}>{m}m</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Start ${pendingMin} minute diffuser`}
            onPress={() => {
              if (!deviceId) return;
              startTimer(deviceId, "aroma", pendingMin * 60);
            }}
            style={{ alignSelf: "center", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14, backgroundColor: "#B0656B" }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Start {pendingMin}m</Text>
          </TouchableOpacity>
        </>
      )}
    </WatchFace>
  );
}

function WatchFilter() {
  const { settings } = useDeviceSettings();
  return (
    <WatchFace gradient={["#2E5E63", "#39395F", "#241636"]}>
      <View style={{ alignItems: "center" }}>
        <CircleRing value={settings.hepaLife / 100} size={134} color={pal.khaki} label="HEPA filter" />
      </View>
    </WatchFace>
  );
}

function WatchSettings() {
  const { settings, updateSettings } = useDeviceSettings();
  const row = (label, value, onPress) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label} style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, backgroundColor: "rgba(0,0,0,0.24)", paddingHorizontal: 12, paddingVertical: 11 }}>
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", flex: 1 }}>{label}</Text>
      {value ? <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{value}</Text> : null}
    </TouchableOpacity>
  );
  return (
    <WatchFace gradient={["#E2DCC6", "#A9C2B5", "#4A8B7A"]}>
      {row("Display", settings.ledOn ? "On" : "Off", () => updateSettings({ ledOn: !settings.ledOn }))}
      {row("Device Info", "VHT-402", () => {})}
    </WatchFace>
  );
}

function WatchDevices() {
  const { devices, activeRoomId, setActiveRoomId } = useRooms();
  return (
    <WatchFace gradient={["#39395F", "#2A1840", "#160E20"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>DEVICES</Text>
      {devices.length === 0 ? (
        <Text style={{ color: pal.w55, fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 16 }}>No devices yet.{"\n"}Pair one on the phone.</Text>
      ) : (
        devices.map((d) => {
          const active = d.roomId === activeRoomId;
          return (
            <TouchableOpacity
              key={d.id}
              activeOpacity={0.8}
              onPress={() => setActiveRoomId(d.roomId)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: active ? `${pal.teal}40` : "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: active ? pal.teal : "rgba(255,255,255,0.12)" }}
            >
              <MaterialCommunityIcons name="air-purifier" size={16} color={active ? pal.teal : pal.w55} />
              <Text style={{ color: pal.white, fontSize: 12, fontWeight: "600", flex: 1 }}>{d.roomName}</Text>
              {active ? <Ionicons name="checkmark-circle" size={16} color={pal.teal} /> : null}
            </TouchableOpacity>
          );
        })
      )}
    </WatchFace>
  );
}

function WatchMode() {
  const { settings, updateSettings } = useDeviceSettings();
  return (
    <WatchFace gradient={["#4AACA9", "#39395F", "#241636"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>MODE</Text>
      {["Sleep", "Auto", "Allergy"].map((m) => {
        const active = settings.activeMode === m;
        return (
          <TouchableOpacity key={m} activeOpacity={0.8} onPress={() => updateSettings({ activeMode: m })} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ borderRadius: 12, paddingVertical: 10, alignItems: "center", backgroundColor: active ? pal.teal : "rgba(255,255,255,0.1)" }}>
            <Text style={{ color: active ? "#0B1A14" : pal.white, fontWeight: "700", fontSize: 13 }}>{m}</Text>
          </TouchableOpacity>
        );
      })}
    </WatchFace>
  );
}

function WatchTimer() {
  const { settings, updateSettings } = useDeviceSettings();
  const { devices, activeRoomId } = useRooms();
  const { startTimer, resetTimer, getDeviceTimers } = useDeviceTimers();
  const deviceId = devices.find((d) => d.roomId === activeRoomId)?.id ?? devices[0]?.id;
  const { purifier } = getDeviceTimers(deviceId);
  const running = purifier.secondsRemaining !== null && purifier.secondsRemaining > 0;

  return (
    <WatchFace gradient={["#C87050", "#7A4A38", "#2A1810"]}>
      <Text style={{ color: pal.w70, fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: 1 }}>SHUT-OFF TIMER</Text>
      {running ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#6BD08A" }} />
            <Text style={{ color: "#6BD08A", fontSize: 11, fontWeight: "700" }}>Timer running</Text>
          </View>
          <Text style={{ color: pal.white, fontSize: 30, fontWeight: "800", textAlign: "center" }}>{formatDuration(purifier.secondsRemaining)}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Stop timer" onPress={() => resetTimer(deviceId, "purifier")} style={{ alignSelf: "center", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)" }}>
            <Text style={{ color: pal.white, fontSize: 12, fontWeight: "700" }}>Stop</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ color: pal.white, fontSize: 20, fontWeight: "800", textAlign: "center" }}>{settings.timer}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {["Off", "30 min", "1 hour", "2 hours", "4 hours"].map((o) => {
              const active = settings.timer === o;
              return (
                <TouchableOpacity key={o} activeOpacity={0.8} onPress={() => updateSettings({ timer: o })} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: active ? pal.terracotta : "rgba(255,255,255,0.12)" }}>
                  <Text style={{ color: pal.white, fontSize: 12, fontWeight: "600" }}>{o}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {settings.timer !== "Off" && deviceId ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Start timer" onPress={() => { startTimer(deviceId, "purifier", shutOffLabelToSeconds(settings.timer)); }} style={{ alignSelf: "center", paddingHorizontal: 20, paddingVertical: 9, borderRadius: 14, backgroundColor: pal.terracotta }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Start</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </WatchFace>
  );
}

const WATCH_FACES = [
  { key: "home", label: "Home", icon: "home-variant", lib: "mci", color: "#4A8B7A", Comp: WatchHome },
  { key: "devices", label: "Devices", icon: "air-purifier", lib: "mci", color: "#9470B8", Comp: WatchDevices },
  { key: "air", label: "Air Quality", icon: "weather-windy", lib: "mci", color: "#4AACA9", Comp: WatchAirQuality },
  { key: "fan", label: "Fan", icon: "fan", lib: "mci", color: "#4A8B7A", Comp: WatchFan },
  { key: "mode", label: "Mode", icon: "weather-night", lib: "mci", color: "#744C8B", Comp: WatchMode },
  { key: "aroma", label: "Aroma", icon: "flower", lib: "mci", color: "#8B2535", Comp: WatchAroma },
  { key: "filter", label: "Filter", icon: "air-filter", lib: "mci", color: "#C5BC8A", Comp: WatchFilter },
  { key: "timer", label: "Timer", icon: "timer-outline", lib: "ion", color: "#C87050", Comp: WatchTimer },
  { key: "settings", label: "Settings", icon: "cog", lib: "mci", color: "#5E9E8C", Comp: WatchSettings },
];

function CircleBubble({ face, size, onOpen, style }) {
  const Icon = face.lib === "ion" ? Ionicons : MaterialCommunityIcons;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onOpen(face.key)}
      accessibilityRole="button"
      accessibilityLabel={face.label}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${face.color}66`, borderWidth: 1.5, borderColor: face.color, alignItems: "center", justifyContent: "center" }, style]}
    >
      <Icon name={face.icon} size={size * 0.42} color="#fff" />
    </TouchableOpacity>
  );
}

// Apple-Watch-style circular hub: a center bubble + a ring of bubbles. Tap one
// to open that setting's page.
function WatchHub({ onOpen }) {
  const center = WATCH_FACES[0];
  const ring = WATCH_FACES.slice(1);
  const cx = WATCH_W / 2;
  const cy = WATCH_H / 2;
  const R = 74;
  const bubble = 46;
  return (
    <LinearGradient colors={["#1B2530", "#241636", "#160E20"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: WATCH_W, height: WATCH_H }}>
      {ring.map((f, i) => {
        const a = (i / ring.length) * 2 * Math.PI - Math.PI / 2;
        return (
          <CircleBubble
            key={f.key}
            face={f}
            size={bubble}
            onOpen={onOpen}
            style={{ position: "absolute", left: cx + R * Math.cos(a) - bubble / 2, top: cy + R * Math.sin(a) - bubble / 2 }}
          />
        );
      })}
      <CircleBubble face={center} size={56} onOpen={onOpen} style={{ position: "absolute", left: cx - 28, top: cy - 28 }} />
    </LinearGradient>
  );
}

function WatchApp() {
  const [view, setView] = useState("home"); // "home" | "hub" | <faceKey>
  const detail = view !== "home" && view !== "hub" ? WATCH_FACES.find((f) => f.key === view) : null;

  // Home: swipe up → wheel.
  const panUp = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 14 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderRelease: (_, g) => { if (g.dy < -40) setView("hub"); },
  })).current;
  // Wheel: swipe down → home.
  const panDown = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 14 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderRelease: (_, g) => { if (g.dy > 40) setView("home"); },
  })).current;
  // Detail: swipe → back to wheel.
  const panBack = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 45) setView("hub"); },
  })).current;

  let content;
  let footer;
  if (view === "home") {
    content = (
      <View style={{ flex: 1 }} {...panUp.panHandlers}>
        <WatchHome />
        <View pointerEvents="none" style={{ position: "absolute", bottom: 6, left: 0, right: 0, alignItems: "center" }}>
          <Ionicons name="chevron-up" size={16} color="rgba(40,48,44,0.5)" />
        </View>
      </View>
    );
    footer = "Swipe up for controls";
  } else if (view === "hub") {
    content = (
      <View style={{ flex: 1 }} {...panDown.panHandlers}>
        <WatchHub onOpen={setView} />
      </View>
    );
    footer = "Tap a bubble · swipe down for home";
  } else {
    content = (
      <View style={{ flex: 1 }} {...panBack.panHandlers}>
        <detail.Comp />
      </View>
    );
    footer = `${detail.label} · swipe to go back`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#15161A", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <WatchFrame>{content}</WatchFrame>
      <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{footer}</Text>
    </View>
  );
}

function ModeSwitch({ mode, onChange }) {
  const opt = (m, label) => (
    <TouchableOpacity onPress={() => onChange(m)} activeOpacity={0.85} accessibilityRole="button" accessibilityState={{ selected: mode === m }} style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 16, backgroundColor: mode === m ? pal.teal : "transparent" }}>
      <Text style={{ color: mode === m ? "#0B1A14" : "rgba(255,255,255,0.8)", fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
  // Inline bar (not an overlay): it takes its own space at the top so it never
  // covers the app. RootShell renders the app in the flex region below it.
  return (
    <View style={{ alignItems: "center", paddingVertical: 8, backgroundColor: "#0E0E12", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
      <View style={{ flexDirection: "row", padding: 4, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
        {opt("phone", "Phone")}
        {opt("watch", "Watch")}
      </View>
    </View>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {routes.map((name) => (
          <Stack.Screen key={name} name={name} component={withHomeNav(screens[name], name)} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const ToastContext = createContext(() => {});
function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const show = useCallback((text) => {
    setMsg(text);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }, 1600);
  }, [opacity]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={{ position: "absolute", bottom: 92, left: 0, right: 0, alignItems: "center", opacity }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(10,10,12,0.92)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" }}>
          <Ionicons name="checkmark-circle" size={16} color={pal.teal} />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{msg}</Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

function Providers({ children }) {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <RoomsProvider>
          <DeviceSettingsProvider>
            <DeviceTimersProvider>
              <ToastProvider>{children}</ToastProvider>
            </DeviceTimersProvider>
          </DeviceSettingsProvider>
        </RoomsProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function RootShell() {
  const [mode, setMode] = useState("phone");
  // Top safe-area bar holds the switch; the app fills the region below it.
  // SafeAreaView(top) consumes the top inset so nested screens don't double it.
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#0E0E12" }}>
      <ModeSwitch mode={mode} onChange={setMode} />
      <View style={{ flex: 1 }}>
        {mode === "watch" ? <WatchApp /> : <AppNavigator />}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Providers>
      <RootShell />
    </Providers>
  );
}

// Exposed for tests / side-by-side previews.
export function WatchPreview() {
  return (
    <Providers>
      <WatchApp />
    </Providers>
  );
}

// ─── Dashboard-specific Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  dashContainer:     { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingBottom: 38 },
  dashTopBar:        { width: "100%", alignItems: "center", justifyContent: "center", paddingTop: 32, paddingBottom: 8, paddingHorizontal: 44, minHeight: 56 },
  dashSettingsBtn:   { position: "absolute", top: 8, right: 0, zIndex: 10, padding: 8 },
  dashListBlock:     { flex: 1, width: "100%" },
  welcomeHome:       { fontSize: 34, color: CREAM, fontStyle: "italic", fontWeight: "300", letterSpacing: 0.5 },
  activeDeviceList:  { width: "100%", gap: 14 },
  activeDeviceBlock: { width: "100%", gap: 6 },
  deviceTimerRow:    { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 8 },
  deviceTimerChip:   {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(221,215,193,0.08)",
    borderWidth: 1,
    borderColor: "rgba(221,215,193,0.12)",
  },
  deviceTimerChipText: { color: "rgba(221,215,193,0.78)", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  activeDeviceOval:  {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(221,215,193,0.10)",
    borderWidth: 1,
    borderColor: "rgba(221,215,193,0.16)",
  },
  activeDeviceIcon:  {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(221,215,193,0.08)",
  },
  activeDeviceTitle: { color: CREAM, fontSize: 15, fontWeight: "700" },
  activeDeviceMeta:  { color: "rgba(221,215,193,0.52)", fontSize: 11 },
  activeDeviceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(74,139,122,0.28)",
  },
  activeDeviceBadgeText: { color: pal.teal, fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
});
