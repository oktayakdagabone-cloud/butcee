import { useEffect, useRef, useState } from "react";
import { Redirect } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "./context/AuthContext";
import { authErrorMessage, authRedirectUrl, isValidEmail, MIN_PASSWORD_LENGTH, normalizeEmail, readRememberedEmail, rememberEmail } from "../lib/authHelpers";

type Mode = "login" | "register" | "recover";

export default function AuthScreen() {
  const { user, recovering, notice, signIn, signOut, finishRecovery } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let active = true;
    readRememberedEmail().then(saved => {
      if (active) { setEmail(saved); setRemember(!!saved); }
    }).catch(() => undefined).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setPassword(""); setConfirmation(""); setShowPassword(false);
    setMessage(""); setMode("login");
  }, [recovering, notice]);

  function switchMode(next: Mode) {
    if (busyRef.current) return;
    setMode(next); setMessage(""); setPassword(""); setConfirmation(""); setShowPassword(false);
  }

  function fail(text: string) { setIsError(true); setMessage(text); }

  async function toggleRemember() {
    if (busyRef.current) return;
    if (remember) {
      try { await rememberEmail("", false); }
      catch { fail("Hatırlanan e-posta silinemedi. Lütfen tekrar dene."); return; }
    }
    setRemember(!remember);
  }

  async function submit() {
    if (busyRef.current || !ready) return;
    const address = normalizeEmail(email);
    if (!recovering && !isValidEmail(address)) return fail("Geçerli bir e-posta adresi gir.");
    if ((recovering || mode !== "recover") && !password) return fail("Şifreni gir.");
    if (recovering || mode === "register") {
      if (password.length < MIN_PASSWORD_LENGTH) return fail("Şifren en az 8 karakter olmalı.");
      if (password !== confirmation) return fail("Şifreler eşleşmiyor.");
    }
    busyRef.current = true;
    setBusy(true); setMessage("");
    try {
      if (recovering) {
        await finishRecovery(password);
      } else if (mode === "login") {
        // Only email is written to disk; never the password or authentication tokens.
        await rememberEmail(address, remember);
        await signIn(address, password);
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: address, password,
          options: { emailRedirectTo: authRedirectUrl("auth") },
        });
        if (error) throw error;
        // Also require password login if email confirmation is disabled on the server.
        if (data.session) await supabase.auth.signOut({ scope: "local" });
        setPassword(""); setConfirmation(""); setShowPassword(false); setMode("login");
        setIsError(false);
        setMessage(data.session
          ? "Hesabın oluşturuldu. E-posta adresin ve şifrenle giriş yapabilirsin."
          : "E-postana gelen doğrulama bağlantısını aç, ardından şifrenle giriş yap. Mesajı göremiyorsan spam klasörünü kontrol et. Hesabın zaten varsa giriş yapmayı veya şifreni sıfırlamayı dene.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(address, {
          redirectTo: authRedirectUrl("reset-password"),
        });
        if (error) throw error;
        setIsError(false);
        setMessage("Bu e-posta adresine ait bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.");
      }
    } catch (error) { fail(authErrorMessage(error)); }
    finally { busyRef.current = false; setBusy(false); }
  }

  if (user && !recovering) return <Redirect href="/" />;
  const title = recovering ? "Yeni şifre belirle" : mode === "login" ? "Giriş yap" : mode === "register" ? "Hesap oluştur" : "Şifremi unuttum";
  const subtitle = recovering ? "Hesabın için yeni bir şifre oluştur." : mode === "recover" ? "E-posta adresine şifre sıfırlama bağlantısı gönderelim." : "Bütçeni kendi hesabından güvenle yönet.";
  const disabled = busy || !ready;
  const needsConfirmation = recovering || mode === "register";

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Image source={require("../../assets/images/butce-logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {!recovering && <>
          <Text style={styles.label}>E-posta adresi</Text>
          <TextInput accessibilityLabel="E-posta adresi" value={email} onChangeText={setEmail} editable={!disabled} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" placeholder="ornek@eposta.com" placeholderTextColor="#94A3B8" style={styles.input} onSubmitEditing={mode === "recover" ? submit : undefined} />
        </>}
        {(recovering || mode !== "recover") && <>
          <Text style={styles.label}>{needsConfirmation ? "Yeni şifre" : "Şifre"}</Text>
          <View style={styles.passwordRow}>
            <TextInput accessibilityLabel={needsConfirmation ? "Yeni şifre" : "Şifre"} value={password} onChangeText={setPassword} editable={!disabled} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="off" placeholder={needsConfirmation ? "En az 8 karakter" : "Şifren"} placeholderTextColor="#94A3B8" style={styles.passwordInput} onSubmitEditing={!needsConfirmation ? submit : undefined} />
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} disabled={disabled} onPress={() => setShowPassword(value => !value)} style={styles.showButton}><Text style={styles.link}>{showPassword ? "Gizle" : "Göster"}</Text></Pressable>
          </View>
        </>}
        {needsConfirmation && <>
          <Text style={styles.label}>Şifreyi tekrar gir</Text>
          <TextInput accessibilityLabel="Şifreyi tekrar gir" value={confirmation} onChangeText={setConfirmation} editable={!disabled} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="off" placeholder="Şifreni tekrar gir" placeholderTextColor="#94A3B8" style={styles.input} onSubmitEditing={submit} />
        </>}
        {!recovering && mode === "login" && <>
          <Pressable accessibilityRole="checkbox" accessibilityLabel="Beni hatırla" accessibilityState={{ checked: remember, disabled }} disabled={disabled} onPress={toggleRemember} style={styles.rememberRow}>
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}><Text style={styles.checkmark}>{remember ? "✓" : ""}</Text></View>
            <Text style={styles.rememberLabel}>Beni hatırla</Text>
          </Pressable>
          <Text style={styles.hint}>Yalnızca e-posta adresin hatırlanır. Her açılışta şifren istenir.</Text>
        </>}
        {!!(message || notice) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.message, message && isError ? styles.error : styles.info]}>{message || notice}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy }} disabled={disabled} onPress={submit} style={[styles.submit, disabled && styles.submitDisabled]}>
          <Text style={styles.submitText}>{busy ? "İşlem yapılıyor..." : recovering ? "Şifreyi güncelle" : mode === "recover" ? "Sıfırlama bağlantısı gönder" : mode === "login" ? "Giriş yap" : "Kayıt ol"}</Text>
        </Pressable>
        <View style={styles.links}>
          {recovering ? <Pressable accessibilityRole="button" disabled={disabled} onPress={() => { void signOut(); }}><Text style={styles.link}>Girişe dön</Text></Pressable>
            : mode !== "login" ? <Pressable accessibilityRole="button" disabled={disabled} onPress={() => switchMode("login")}><Text style={styles.link}>Girişe dön</Text></Pressable>
            : <><Pressable accessibilityRole="button" disabled={disabled} onPress={() => switchMode("register")}><Text style={styles.link}>Kayıt ol</Text></Pressable><Pressable accessibilityRole="button" disabled={disabled} onPress={() => switchMode("recover")}><Text style={styles.link}>Şifremi unuttum</Text></Pressable></>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: "#F7F8FA", justifyContent: "center", padding: 24 },
  card: { alignSelf: "center", width: "100%", maxWidth: 440, backgroundColor: "#FFF", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#E2E8F0" },
  logo: { width: 150, height: 82, alignSelf: "center" },
  title: { marginTop: 20, fontSize: 26, fontWeight: "800", color: "#17202A" },
  subtitle: { marginTop: 8, color: "#64748B", lineHeight: 21 },
  label: { marginTop: 18, marginBottom: 7, fontSize: 13, fontWeight: "700", color: "#334155" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 14, color: "#17202A" },
  passwordRow: { minHeight: 50, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 14, color: "#17202A" },
  showButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 14 },
  rememberRow: { flexDirection: "row", alignItems: "center", minHeight: 44, marginTop: 12, gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: "#94A3B8", borderRadius: 5, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  checkmark: { color: "#FFF", fontWeight: "800" },
  rememberLabel: { color: "#334155", fontWeight: "600" },
  hint: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  message: { marginTop: 16, padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 20 },
  error: { color: "#B91C1C", backgroundColor: "#FEF2F2" },
  info: { color: "#166534", backgroundColor: "#F0FDF4" },
  submit: { minHeight: 52, marginTop: 20, borderRadius: 12, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: "#FFF", fontWeight: "800" },
  links: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  link: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
});
