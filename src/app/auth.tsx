import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

const QUESTIONS = ["İlk evcil hayvanının adı nedir?", "İlkokulunun adı nedir?", "En sevdiğin öğretmenin adı nedir?"];
type Mode = "login" | "register" | "recover";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [question, setQuestion] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [loadedQuestion, setLoadedQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function clearLoginFields() { setEmail(""); setPassword(""); setShowPassword(false); }
  function switchMode(next: Mode) { setMode(next); setMessage(""); setLoadedQuestion(""); setAnswer(""); }

  async function submit() {
    if (!email.trim()) return setMessage("E-posta adresini gir.");
    try {
      setBusy(true); setMessage("");
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (mode === "register") {
        if (password.length < 8 || !answer.trim()) throw new Error("Şifren en az 8 karakter olmalı ve güvenlik cevabını girmelisin.");
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { security_question: question, security_answer: answer } } });
        if (error) throw error;
        clearLoginFields(); setAnswer(""); setMode("login");
        setMessage("Kayıt tamamlandı. E-postana gelen onay bağlantısına bas. Ardından buradan giriş yap.");
      } else if (!loadedQuestion) {
        const { data, error } = await supabase.rpc("get_security_question", { p_email: email.trim() });
        if (error || !data) throw new Error("Bu e-posta için güvenlik sorusu bulunamadı.");
        setLoadedQuestion(data);
      } else {
        const { data, error } = await supabase.rpc("verify_security_answer", { p_email: email.trim(), p_answer: answer });
        if (error || !data) throw new Error("Güvenlik cevabı eşleşmedi.");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (resetError) throw resetError;
        setMessage("Şifre yenileme bağlantısı e-posta adresine gönderildi.");
        switchMode("login");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "İşlem yapılamadı. Tekrar dene."); }
    finally { setBusy(false); }
  }

  const title = mode === "login" ? "Giriş yap" : mode === "register" ? "Hesap oluştur" : "Şifremi unuttum";
  return <ScrollView contentContainerStyle={styles.screen}><View style={styles.card}>
    <Text style={styles.logo}>Bütçe</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>Verilerin yalnızca kendi hesabında saklanır.</Text>
    <>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="E-posta adresi" placeholderTextColor="#94A3B8" style={styles.input} />
      {mode !== "recover" && <View style={styles.passwordRow}><TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Şifre" placeholderTextColor="#94A3B8" style={styles.passwordInput} /><Pressable onPress={() => setShowPassword((value) => !value)} style={styles.showButton}><Text style={styles.showButtonText}>{showPassword ? "Gizle" : "Göster"}</Text></Pressable></View>}
      {mode === "register" && <><Text style={styles.label}>Güvenlik sorusu</Text>{QUESTIONS.map((item) => <Pressable key={item} onPress={() => setQuestion(item)} style={[styles.question, question === item && styles.questionActive]}><Text style={styles.questionText}>{item}</Text></Pressable>)}<TextInput value={answer} onChangeText={setAnswer} placeholder="Cevabın" placeholderTextColor="#94A3B8" style={styles.input} /></>}
      {mode === "recover" && loadedQuestion && <><Text style={styles.label}>{loadedQuestion}</Text><TextInput value={answer} onChangeText={setAnswer} placeholder="Cevabın" placeholderTextColor="#94A3B8" style={styles.input} /></>}
    </>
    {!!message && <Text style={styles.message}>{message}</Text>}
    <Pressable disabled={busy} onPress={submit} style={[styles.submit, busy && styles.submitDisabled]}><Text style={styles.submitText}>{busy ? "Bekle..." : mode === "recover" && !loadedQuestion ? "Soruyu göster" : mode === "recover" ? "Şifre yenileme bağlantısı gönder" : mode === "login" ? "Giriş yap" : "Kayıt ol"}</Text></Pressable>
    <View style={styles.links}>{mode !== "login" && <Pressable onPress={() => { clearLoginFields(); switchMode("login"); }}><Text style={styles.link}>Girişe dön</Text></Pressable>}{mode === "login" && <><Pressable onPress={() => switchMode("register")}><Text style={styles.link}>Kayıt ol</Text></Pressable><Pressable onPress={() => switchMode("recover")}><Text style={styles.link}>Şifremi unuttum</Text></Pressable></>}</View>
  </View></ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: "#F7F8FA", justifyContent: "center", padding: 24 }, card: { alignSelf: "center", width: "100%", maxWidth: 420, backgroundColor: "#FFF", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#E2E8F0" }, logo: { fontSize: 26, fontWeight: "900", color: "#17202A" }, title: { marginTop: 24, fontSize: 24, fontWeight: "900", color: "#17202A" }, subtitle: { marginTop: 6, color: "#64748B" }, input: { minHeight: 50, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, marginTop: 12, color: "#17202A" }, passwordRow: { minHeight: 50, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, marginTop: 12, flexDirection: "row", alignItems: "center" }, passwordInput: { flex: 1, minHeight: 48, paddingHorizontal: 14, color: "#17202A" }, showButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 14 }, showButtonText: { color: "#2563EB", fontWeight: "800", fontSize: 13 }, label: { marginTop: 16, fontWeight: "800", color: "#17202A" }, question: { marginTop: 8, padding: 11, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10 }, questionActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" }, questionText: { fontSize: 12, color: "#334155" }, message: { marginTop: 14, color: "#B45309", fontSize: 13, fontWeight: "700", lineHeight: 19 }, submit: { minHeight: 52, marginTop: 20, borderRadius: 12, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" }, submitDisabled: { opacity: 0.65 }, submitText: { color: "#FFF", fontWeight: "900" }, links: { marginTop: 18, flexDirection: "row", justifyContent: "space-between" }, link: { color: "#2563EB", fontWeight: "800", fontSize: 13 },
});
