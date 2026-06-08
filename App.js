import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StatusBar,
  Dimensions
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Rect, Line, Path } from "react-native-svg";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

const colors = {
  bg: "#FFFFFF",
  soft: "#FAFAFA",
  card: "#FFFFFF",
  border: "#E7E7E7",
  borderDark: "#D8D8D8",
  text: "#111111",
  sub: "#6B6B6B",
  red: "#A32323",
  redSoft: "#FFF4F4",
  green: "#2EAD55",
  orange: "#E39A2F",
  danger: "#D04545"
};

const routes = [
  "Welcome",
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
  "Dashboard",
  "SleepMode",
  "FilterMaintenance",
  "ReplaceFilter",
  "Analytics",
  "Automation",
  "CustomAutomation",
  "Settings",
  "DeviceManagement",
  "Notifications",
  "FirmwareAvailable",
  "FirmwareUpdating",
  "FirmwareComplete",
  "UserProfile"
];

function nextOf(name) {
  const index = routes.indexOf(name);
  return routes[Math.min(routes.length - 1, index + 1)];
}

function Screen({ children, padded = true }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.screen, padded && styles.padded]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, subtitle, navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function Button({ label, onPress, variant = "primary" }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.button, variant === "secondary" && styles.buttonSecondary]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonSecondaryText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Field({ label, value, secure }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          value={value}
          editable={false}
          secureTextEntry={secure}
          placeholderTextColor={colors.sub}
          style={styles.input}
        />
      </View>
    </View>
  );
}

function Product({ size = 160 }) {
  const w = size * 0.64;
  const h = size;
  return (
    <View style={[styles.productBox, { width: size, height: size * 1.18 }]}>
      <Svg width={size} height={size * 1.18} viewBox={`0 0 ${size} ${size * 1.18}`}>
        <Circle cx={size / 2} cy={size * 1.08} r={size * 0.22} fill="#D9D9D9" opacity={0.5} />
        <Rect x={(size - w) / 2} y={18} width={w} height={h} rx={size * 0.12} fill="#fff" stroke="#D8D8D8" />
        <Rect x={(size - w * 0.55) / 2} y={32} width={w * 0.55} height={12} rx={6} fill="#E9E9E9" />
        <Circle cx={size / 2} cy={70} r={10} fill={colors.green} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={i}
            x1={(size - w * 0.48) / 2}
            x2={(size + w * 0.48) / 2}
            y1={size * 0.48 + i * 8}
            y2={size * 0.48 + i * 8}
            stroke="#C9C9C9"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <TextSvg x={size / 2 - 22} y={size * 0.9} text="VESTEL" />
      </Svg>
    </View>
  );
}

function TextSvg({ x, y, text }) {
  return null;
}

function BrandMark() {
  return (
    <View style={styles.brandMark}>
      <Text style={styles.brandMarkText}>V</Text>
    </View>
  );
}

function MetricCard({ icon, value, label }) {
  return (
    <View style={styles.metricCard}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.red} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, title, value, onPress, danger }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.row} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color={danger ? colors.danger : colors.red} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.sub} />
    </TouchableOpacity>
  );
}

function Toggle({ on = true }) {
  return (
    <View style={[styles.toggle, !on && styles.toggleOff]}>
      <View style={[styles.knob, !on && styles.knobOff]} />
    </View>
  );
}

function Progress({ value = 0.7, color = colors.red }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function Chart({ type = "line" }) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>{type === "bars" ? "Weekly PM2.5 trend" : "PM2.5 - last 24 hours"}</Text>
      <Svg width="100%" height={130} viewBox="0 0 320 130">
        {type === "bars" ? (
          [64, 82, 70, 88, 96, 58, 52].map((h, i) => (
            <Rect key={i} x={18 + i * 42} y={118 - h} width={26} height={h} rx={7} fill={colors.red} opacity={0.72} />
          ))
        ) : (
          <>
            <Path
              d="M10 86 C45 25, 75 100, 110 54 S180 88, 216 45 S276 64, 310 36"
              fill="none"
              stroke={colors.red}
              strokeWidth={4}
              strokeLinecap="round"
            />
            {[10, 58, 110, 166, 216, 270, 310].map((x, i) => (
              <Circle key={i} cx={x} cy={[86, 44, 54, 80, 45, 60, 36][i]} r={5} fill={colors.red} />
            ))}
          </>
        )}
      </Svg>
    </Card>
  );
}

function Welcome({ navigation }) {
  return (
    <Screen>
      <View style={styles.topBrand}><BrandMark /><Text style={styles.lang}>US</Text></View>
      <Card style={styles.hero}>
        <Text style={styles.welcome}>WELCOME</Text>
        <Text style={styles.subtitle}>pure air for every breath</Text>
        <Product size={190} />
      </Card>
      <Button label="Get started" onPress={() => navigation.navigate("Language")} />
    </Screen>
  );
}

function Language({ navigation }) {
  return (
    <Screen>
      <Header title="Choose Language" subtitle="Select your preferred app language" navigation={navigation} />
      {["Turkish", "English", "Italian"].map((item) => (
        <TouchableOpacity key={item} style={[styles.row, item === "English" && styles.selectedRow]}>
          <Ionicons name="flag-outline" size={18} color={item === "English" ? colors.red : colors.sub} />
          <Text style={[styles.rowTitle, item === "English" && { color: colors.red }]}>{item}</Text>
          {item === "English" ? <Ionicons name="checkmark-circle" size={20} color={colors.red} /> : null}
        </TouchableOpacity>
      ))}
      <View style={styles.spacer} />
      <Button label="Continue" onPress={() => navigation.navigate("AuthChoice")} />
    </Screen>
  );
}

function AuthChoice({ navigation }) {
  return (
    <Screen>
      <Card style={styles.hero}>
        <Product size={210} />
        <Text style={styles.title}>Vestel Air Purifier</Text>
        <Text style={styles.subtitle}>Control air quality, sleep mode, filters, and automations.</Text>
      </Card>
      <Button label="Log In" onPress={() => navigation.navigate("SignIn")} />
      <Button label="Sign Up" variant="secondary" onPress={() => navigation.navigate("CreateAccount")} />
    </Screen>
  );
}

function SignIn({ navigation }) {
  return (
    <Screen>
      <Header title="Sign In" subtitle="Enter your email and password" navigation={navigation} />
      <Field label="Email" value="Your email" />
      <Field label="Password" value="Password" secure />
      <View style={styles.inline}>
        <Toggle on={false} />
        <Text style={styles.small}>Remember me</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <Button label="LOGIN" onPress={() => navigation.navigate("AddDevice")} />
      <Text style={styles.or}>or</Text>
      <Button label="Continue with Google" variant="secondary" onPress={() => navigation.navigate("AddDevice")} />
      <View style={styles.spacer} />
      <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
        <Text style={styles.centerText}>Don't have an account? <Text style={styles.link}>Sign up</Text></Text>
      </TouchableOpacity>
    </Screen>
  );
}

function CreateAccount({ navigation }) {
  return (
    <Screen>
      <Header title="Create new account" subtitle="Enter your email to sign up" navigation={navigation} />
      <Text style={styles.brandTitle}>VESTEL AIR PURIFIER</Text>
      <Field label="Email" value="ceng318@hotmail.com" />
      <Button label="Create an account" onPress={() => navigation.navigate("VerifyEmail")} />
      <Text style={styles.or}>or</Text>
      <Button label="Continue with Google" variant="secondary" onPress={() => navigation.navigate("VerifyEmail")} />
      <View style={styles.spacer} />
      <Text style={styles.legal}>By clicking continue, you agree to the Terms of Service and Privacy Policy.</Text>
    </Screen>
  );
}

function VerifyEmail({ navigation }) {
  return (
    <Screen>
      <Header title="Verify email" subtitle="We sent a 6 digit code" navigation={navigation} />
      <Text style={styles.body}>Please enter the code sent to ceng318@hotmail.com.</Text>
      <View style={styles.otpRow}>{[1, 2, 3, 4, 5, 6].map((i) => <View key={i} style={styles.otp}><Text>{i < 4 ? i : ""}</Text></View>)}</View>
      <Button label="Verify email" onPress={() => navigation.navigate("CreatePassword")} />
      <Button label="Send to different email" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function CreatePassword({ navigation }) {
  return (
    <Screen>
      <Header title="Create password" subtitle="Password strength: strong" navigation={navigation} />
      <Field label="Password" value="************" secure />
      <Progress value={1} color={colors.green} />
      <Card>
        {["8 characters minimum", "A number", "A capital letter"].map((x) => (
          <View key={x} style={styles.checkRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.green} />
            <Text style={styles.rowTitle}>{x}</Text>
          </View>
        ))}
      </Card>
      <Button label="Continue" onPress={() => navigation.navigate("AccountCreated")} />
    </Screen>
  );
}

function AccountCreated({ navigation }) {
  return (
    <Screen>
      <View style={styles.successMark}><Ionicons name="checkmark" size={46} color="#fff" /></View>
      <Text style={styles.title}>Your account was successfully created</Text>
      <Text style={styles.subtitle}>Only one click to explore online activation.</Text>
      <View style={styles.spacer} />
      <Button label="Log in" onPress={() => navigation.navigate("SignIn")} />
    </Screen>
  );
}

function ForgotPassword({ navigation }) {
  return (
    <Screen>
      <Header title="Forgot Password" subtitle="Reset your account access" navigation={navigation} />
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subtitle}>Enter your email address and we will send you a secure reset link.</Text>
      <Field label="Email" value="mesud@example.com" />
      <Button label="Send reset link" onPress={() => navigation.navigate("ResetEmailSent")} />
      <Button label="Back to sign in" variant="secondary" onPress={() => navigation.navigate("SignIn")} />
    </Screen>
  );
}

function ResetEmailSent({ navigation }) {
  return (
    <Screen>
      <View style={styles.successMark}><Ionicons name="mail" size={38} color="#fff" /></View>
      <Text style={styles.title}>Reset email sent</Text>
      <Text style={styles.subtitle}>Check your inbox for a password reset link.</Text>
      <Row icon="email-outline" title="Sent to" value="mesud@example.com" />
      <Button label="Open email app" onPress={() => navigation.navigate("PasswordResetSuccess")} />
      <Button label="Back to sign in" variant="secondary" onPress={() => navigation.navigate("SignIn")} />
    </Screen>
  );
}

function PasswordResetSuccess({ navigation }) {
  return (
    <Screen>
      <View style={styles.successMark}><Ionicons name="checkmark" size={46} color="#fff" /></View>
      <Text style={styles.title}>Password reset</Text>
      <Text style={styles.subtitle}>Your password was updated successfully.</Text>
      <Button label="Back to sign in" onPress={() => navigation.navigate("SignIn")} />
    </Screen>
  );
}

function AddDevice({ navigation }) {
  return (
    <Screen>
      <Header title="Find your device" subtitle="Nearby purifier" navigation={navigation} />
      <Row icon="air-purifier" title="Vestel VHT-402 WiFi" value="Ready" onPress={() => navigation.navigate("DeviceFound")} />
      <View style={styles.spacer} />
      <Button label="Can't see my device" variant="secondary" onPress={() => navigation.navigate("WifiCredentials")} />
    </Screen>
  );
}

function DeviceFound({ navigation }) {
  return (
    <Screen>
      <Header title="Device found" subtitle="Vestel VHT-402 WiFi is ready to pair" navigation={navigation} />
      <Card style={styles.hero}>
        <Product size={170} />
        <Text style={styles.title}>Vestel VHT-402 WiFi</Text>
        <Text style={styles.subtitle}>Signal strong • Living Room</Text>
      </Card>
      <Button label="Pair this purifier" onPress={() => navigation.navigate("WifiCredentials")} />
    </Screen>
  );
}

function WifiCredentials({ navigation }) {
  return (
    <Screen>
      <Header title="Connect to Wi-Fi" subtitle="Use a 2.4 GHz network" navigation={navigation} />
      <Field label="Network name" value="Home_2.4G" />
      <Field label="Password" value="**********" secure />
      <View style={styles.inline}><Toggle on={false} /><Text style={styles.small}>No password</Text></View>
      <Button label="Start pairing" onPress={() => navigation.navigate("PairingProgress")} />
    </Screen>
  );
}

function PairingProgress({ navigation }) {
  return (
    <Screen>
      <Header title="Pairing purifier" subtitle="This may take up to one minute" navigation={navigation} />
      <Card style={styles.hero}>
        <Product size={155} />
        <Progress value={0.68} />
        <Text style={styles.metricValue}>68%</Text>
        <Text style={styles.subtitle}>Sending Wi-Fi credentials</Text>
      </Card>
      <Button label="Continue" onPress={() => navigation.navigate("PairingSuccess")} />
    </Screen>
  );
}

function PairingSuccess({ navigation }) {
  return (
    <Screen>
      <View style={styles.successMark}><Ionicons name="checkmark" size={46} color="#fff" /></View>
      <Text style={styles.title}>Purifier connected</Text>
      <Text style={styles.subtitle}>Air quality monitoring is active.</Text>
      <Button label="Go to dashboard" onPress={() => navigation.navigate("Dashboard")} />
    </Screen>
  );
}

function PairingError({ navigation }) {
  return (
    <Screen>
      <View style={[styles.successMark, { backgroundColor: colors.danger }]}><Text style={styles.bang}>!</Text></View>
      <Text style={styles.title}>Pairing failed</Text>
      <Text style={styles.subtitle}>Check Wi-Fi password and router frequency.</Text>
      <Button label="Try again" onPress={() => navigation.navigate("WifiCredentials")} />
    </Screen>
  );
}

function Dashboard({ navigation }) {
  return (
    <Screen>
      <Header title="Living Room" subtitle="VESTEL VHT-402 WiFi" navigation={navigation} />
      <Card style={styles.aqiCard}>
        <View style={styles.aqiTop}>
          <View><Text style={styles.sectionTitle}>Air Quality Index</Text><Text style={styles.title}>Good</Text></View>
          <Text style={styles.aqiValue}>42</Text>
        </View>
        <View style={styles.pmLive}><Text style={styles.rowTitle}>PM2.5 live</Text><Text style={styles.greenPill}>8 µg/m³</Text></View>
      </Card>
      <View style={styles.grid}>
        <MetricCard icon="weather-night" value="Sleep" label="Active Mode" />
        <MetricCard icon="fan" value="40%" label="Fan Speed" />
        <MetricCard icon="flower" value="62%" label="Aroma Left" />
        <MetricCard icon="timer-outline" value="2:30" label="Timer Left" />
      </View>
      <Button label="Sleep Mode" onPress={() => navigation.navigate("SleepMode")} />
      <View style={styles.rowActions}>
        <Button label="Analytics" variant="secondary" onPress={() => navigation.navigate("Analytics")} />
        <Button label="Settings" variant="secondary" onPress={() => navigation.navigate("Settings")} />
      </View>
    </Screen>
  );
}

function SleepMode({ navigation }) {
  return (
    <Screen>
      <Header title="Sleep Mode" subtitle="Silent bedroom routine" navigation={navigation} />
      <Card><Text style={styles.sectionTitle}>Noise level</Text><Text style={styles.aqiValue}>22 dB</Text><Progress value={0.3} /></Card>
      <Row icon="calendar-night" title="Every night" value="22:30 - 07:00" />
      <Row icon="brightness-6" title="LED brightness" value="Off" />
      <Row icon="auto-fix" title="Auto activation" value="On" />
    </Screen>
  );
}

function FilterMaintenance({ navigation }) {
  return (
    <Screen>
      <Header title="Filter Maintenance" subtitle="Transparent upkeep" navigation={navigation} />
      <Card style={styles.hero}><Text style={styles.aqiValue}>72%</Text><Text style={styles.subtitle}>HEPA H13 filter life remaining</Text><Progress value={0.72} color={colors.green} /></Card>
      <Row icon="air-filter" title="HEPA H13 Filter" value="72%" />
      <Row icon="air-filter" title="Carbon Pre-filter" value="41%" />
      <Row icon="lamp" title="UV-C Lamp" value="16%" danger />
      <Button label="Replace filter" onPress={() => navigation.navigate("ReplaceFilter")} />
    </Screen>
  );
}

function ReplaceFilter({ navigation }) {
  return (
    <Screen>
      <Header title="Replace Filter" subtitle="Guided workflow" navigation={navigation} />
      {["Turn purifier off", "Remove old filter", "Install new filter"].map((x, i) => <Row key={x} icon="numeric-1-circle" title={`${i + 1}. ${x}`} value="" />)}
      <Button label="I replaced the filter" onPress={() => navigation.navigate("FilterMaintenance")} />
    </Screen>
  );
}

function Analytics({ navigation }) {
  return (
    <Screen>
      <Header title="Air Quality Stats" subtitle="Daily verification" navigation={navigation} />
      <View style={styles.segment}><Text style={styles.segmentActive}>Day</Text><Text style={styles.segmentItem}>Week</Text><Text style={styles.segmentItem}>Month</Text></View>
      <Chart />
      <View style={styles.grid3}>
        <MetricCard icon="leaf" value="5" label="Best" />
        <MetricCard icon="chart-line" value="12" label="Avg" />
        <MetricCard icon="alert" value="48" label="Peak" />
      </View>
      <Chart type="bars" />
    </Screen>
  );
}

function Automation({ navigation }) {
  return (
    <Screen>
      <Header title="Automation" subtitle="Scenario presets" navigation={navigation} />
      <Row icon="flower-pollen" title="Allergy preset" value="On" />
      <Row icon="paw" title="Pet preset" value="Off" />
      <Row icon="weather-night" title="Night preset" value="On" />
      <Button label="Create rule" onPress={() => navigation.navigate("CustomAutomation")} />
    </Screen>
  );
}

function CustomAutomation({ navigation }) {
  return (
    <Screen>
      <Header title="Custom Rule" subtitle="Trigger-based action" navigation={navigation} />
      <Field label="Rule name" value="Evening allergy care" />
      <Row icon="target" title="Trigger" value="PM2.5 above 35" />
      <Row icon="clock-outline" title="Condition" value="18:00 - 23:00" />
      <Row icon="auto-fix" title="Action" value="Allergy Mode" />
      <Button label="Save automation" onPress={() => navigation.navigate("Automation")} />
    </Screen>
  );
}

function Settings({ navigation }) {
  return (
    <Screen>
      <Header title="Settings" subtitle="App and device preferences" navigation={navigation} />
      <Row icon="translate" title="Language" value="English" />
      <Row icon="bell-outline" title="Notifications" value="On" onPress={() => navigation.navigate("Notifications")} />
      <Row icon="devices" title="Device management" value="2 devices" onPress={() => navigation.navigate("DeviceManagement")} />
      <Row icon="account-outline" title="Account settings" value="Mesud" onPress={() => navigation.navigate("UserProfile")} />
      <Row icon="download" title="Firmware update" value="v1.8.2" onPress={() => navigation.navigate("FirmwareAvailable")} />
    </Screen>
  );
}

function DeviceManagement({ navigation }) {
  return (
    <Screen>
      <Header title="Device Management" subtitle="Rooms and paired purifiers" navigation={navigation} />
      <Row icon="air-purifier" title="Living Room" value="Good" />
      <Row icon="air-purifier" title="Bedroom" value="Silent" />
      <Button label="Add new purifier" onPress={() => navigation.navigate("AddDevice")} />
    </Screen>
  );
}

function Notifications({ navigation }) {
  return (
    <Screen>
      <Header title="Notifications" subtitle="Alerts and reminders" navigation={navigation} />
      {["Filter replacement reminder", "Poor air quality alert", "Device offline alert", "Firmware update available"].map((x) => (
        <View key={x} style={styles.notification}><Text style={styles.rowTitle}>{x}</Text><Toggle /></View>
      ))}
    </Screen>
  );
}

function FirmwareAvailable({ navigation }) {
  return (
    <Screen>
      <Header title="Firmware Update" subtitle="VESTEL VHT-402 WiFi" navigation={navigation} />
      <Card style={styles.hero}><Product size={120} /><Text style={styles.title}>Version 1.8.2</Text><Text style={styles.subtitle}>Improves Wi-Fi stability and sensor calibration.</Text></Card>
      <Button label="Update now" onPress={() => navigation.navigate("FirmwareUpdating")} />
      <Button label="Later" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function FirmwareUpdating({ navigation }) {
  return (
    <Screen>
      <Header title="Updating Firmware" subtitle="Do not unplug the purifier" navigation={navigation} />
      <Card style={styles.hero}><Product size={150} /><Progress value={0.64} /><Text style={styles.metricValue}>64%</Text><Text style={styles.subtitle}>Installing version 1.8.2</Text></Card>
      <Button label="Finish demo" onPress={() => navigation.navigate("FirmwareComplete")} />
    </Screen>
  );
}

function FirmwareComplete({ navigation }) {
  return (
    <Screen>
      <View style={styles.successMark}><Ionicons name="checkmark" size={46} color="#fff" /></View>
      <Text style={styles.title}>Update complete</Text>
      <Text style={styles.subtitle}>Your purifier is running the latest firmware.</Text>
      <Button label="Back to settings" onPress={() => navigation.navigate("Settings")} />
    </Screen>
  );
}

function UserProfile({ navigation }) {
  return (
    <Screen>
      <Header title="User Profile" subtitle="Account management" navigation={navigation} />
      <Card style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View><View><Text style={styles.titleSmall}>Mesud Guluyev</Text><Text style={styles.subtitle}>mesud@example.com</Text></View></Card>
      <Row icon="account" title="Name" value="Mesud Guluyev" />
      <Row icon="email" title="Email" value="mesud@example.com" />
      <Row icon="translate" title="Language" value="English" />
      <View style={styles.spacer} />
      <Button label="Logout" variant="secondary" onPress={() => navigation.navigate("SignIn")} />
    </Screen>
  );
}

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

const screens = {
  Welcome,
  Language,
  AuthChoice,
  SignIn,
  CreateAccount,
  VerifyEmail,
  CreatePassword,
  AccountCreated,
  ForgotPassword,
  ResetEmailSent,
  PasswordResetSuccess,
  AddDevice,
  DeviceFound,
  WifiCredentials,
  PairingProgress,
  PairingSuccess,
  PairingError,
  Dashboard,
  SleepMode,
  FilterMaintenance,
  ReplaceFilter,
  Analytics,
  Automation,
  CustomAutomation,
  Settings,
  DeviceManagement,
  Notifications,
  FirmwareAvailable,
  FirmwareUpdating,
  FirmwareComplete,
  UserProfile
};

export default function App() {
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { minHeight: "100%", gap: 16, paddingBottom: 26 },
  padded: { paddingHorizontal: 22, paddingTop: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  headerSub: { fontSize: 12, color: colors.sub, marginTop: 2 },
  topBrand: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandMark: { width: 24, height: 24, borderRadius: 8, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: "#fff", fontWeight: "800" },
  lang: { color: colors.sub, fontSize: 12 },
  hero: { alignItems: "center", justifyContent: "center", minHeight: 280 },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 },
  productBox: { alignItems: "center", justifyContent: "center" },
  welcome: { fontSize: 28, letterSpacing: 0, color: colors.text, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  titleSmall: { fontSize: 18, fontWeight: "800", color: colors.text },
  brandTitle: { fontSize: 22, fontWeight: "500", color: colors.text, textAlign: "center", marginVertical: 20 },
  subtitle: { fontSize: 13, color: colors.sub, textAlign: "center", lineHeight: 19 },
  body: { fontSize: 14, color: colors.sub, lineHeight: 21 },
  button: { height: 54, borderRadius: 14, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderDark },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  buttonSecondaryText: { color: colors.red },
  fieldWrap: { gap: 6 },
  label: { color: colors.sub, fontSize: 12, fontWeight: "600" },
  field: { height: 46, borderRadius: 13, borderWidth: 1, borderColor: colors.borderDark, backgroundColor: colors.soft, paddingHorizontal: 12, justifyContent: "center" },
  input: { color: colors.text, fontSize: 14, padding: 0 },
  row: { minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  selectedRow: { backgroundColor: colors.redSoft, borderColor: colors.red },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, color: colors.text, fontWeight: "700", flex: 1 },
  rowValue: { color: colors.sub, fontSize: 12, fontWeight: "600" },
  inline: { flexDirection: "row", alignItems: "center", gap: 10 },
  small: { color: colors.sub, fontSize: 12, flex: 1 },
  link: { color: colors.red, fontWeight: "700", fontSize: 12 },
  centerText: { textAlign: "center", color: colors.sub, fontSize: 12 },
  or: { textAlign: "center", color: colors.sub, fontSize: 12 },
  legal: { textAlign: "center", color: colors.sub, fontSize: 10, lineHeight: 16 },
  spacer: { flexGrow: 1, minHeight: 18 },
  otpRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  otp: { width: (width - 44 - 40) / 6, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  successMark: { alignSelf: "center", width: 86, height: 86, borderRadius: 43, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginTop: 20 },
  bang: { color: "#fff", fontSize: 44, fontWeight: "900" },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: "#ECECEC", overflow: "hidden", width: "100%" },
  progressFill: { height: 8, borderRadius: 4 },
  checkRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  aqiCard: { backgroundColor: colors.redSoft },
  aqiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.sub, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  aqiValue: { fontSize: 44, fontWeight: "900", color: colors.text },
  pmLive: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, padding: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  greenPill: { color: "#fff", backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, overflow: "hidden", fontSize: 12, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  grid3: { flexDirection: "row", gap: 10 },
  metricCard: { width: (width - 56) / 2, minHeight: 96, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", gap: 5, padding: 10 },
  metricValue: { fontSize: 20, fontWeight: "900", color: colors.text, textAlign: "center" },
  metricLabel: { color: colors.sub, fontSize: 11, textAlign: "center" },
  rowActions: { flexDirection: "row", gap: 10 },
  segment: { height: 42, borderRadius: 17, backgroundColor: colors.soft, flexDirection: "row", padding: 4 },
  segmentActive: { flex: 1, backgroundColor: colors.red, color: "#fff", textAlign: "center", textAlignVertical: "center", borderRadius: 14, fontWeight: "800", paddingTop: 8 },
  segmentItem: { flex: 1, color: colors.sub, textAlign: "center", paddingTop: 8, fontWeight: "700" },
  notification: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.red, padding: 3 },
  toggleOff: { backgroundColor: "#E5E5E5" },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", alignSelf: "flex-end" },
  knobOff: { alignSelf: "flex-start" },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "900" }
});
