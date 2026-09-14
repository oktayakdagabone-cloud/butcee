import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCards } from "./context/CardContext";
import { Installment, useInstallments } from "./context/InstallmentContext";

const COLORS = { bg: "#F7F8FA", card: "#FFFFFF", text: "#17202A", secondary: "#7A8492", green: "#16A34A", blue: "#2563EB", red: "#DC2626", border: "#E2E8F0" };

function onlyNumber(value: string) { return value.replace(/\D/g, ""); }

export default function InstallmentsScreen() {
  const { cards } = useCards();
  const { installments, addInstallment, updateInstallment, deleteInstallment, setPaidInstallments } = useInstallments();
  const [editing, setEditing] = useState<Installment | null>(null);
  const [name, setName] = useState("");
  const [cardId, setCardId] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => installments.filter((item) => item.paidInstallments < item.totalInstallments), [installments]);
  const completed = installments.length - active.length;

  function resetForm() { setEditing(null); setName(""); setCardId(""); setTotal(""); setPaid(""); setNote(""); }
  function beginEdit(item: Installment) {
    setEditing(item); setName(item.name); setCardId(item.cardId); setTotal(String(item.totalInstallments)); setPaid(String(item.paidInstallments)); setNote(item.note ?? "");
  }

  async function save() {
    const totalInstallments = Number(total);
    const paidInstallments = Number(paid || "0");
    if (!name.trim() || !cardId || !Number.isInteger(totalInstallments) || totalInstallments < 1 || !Number.isInteger(paidInstallments) || paidInstallments < 0 || paidInstallments > totalInstallments) {
      Alert.alert("Bilgileri kontrol et", "Ad, kart, toplam taksit ve ödenen taksit sayısını geçerli gir."); return;
    }
    try {
      setSaving(true);
      const input = { name: name.trim(), cardId, totalInstallments, paidInstallments, note: note.trim() || undefined };
      if (editing) await updateInstallment(editing.id, input); else await addInstallment(input);
      resetForm();
    } catch (error) { Alert.alert("Kaydedilemedi", error instanceof Error ? error.message : "Taksit kaydedilemedi."); }
    finally { setSaving(false); }
  }

  function cardName(id: string) { const card = cards.find((item) => item.id === id); return card ? `${card.bankName} · ${card.name}` : "Silinmiş kart"; }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.title}>Taksitler</Text><Text style={styles.subtitle}>Kart taksitlerini manuel olarak takip et.</Text></View><Pressable onPress={() => router.back()}><Text style={styles.back}>Geri</Text></Pressable></View>

    <View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{active.length}</Text><Text style={styles.statLabel}>Devam eden</Text></View><View style={styles.stat}><Text style={[styles.statValue, { color: COLORS.green }]}>{completed}</Text><Text style={styles.statLabel}>Tamamlanan</Text></View></View>

    <View style={styles.form}><Text style={styles.formTitle}>{editing ? "Taksiti Düzenle" : "Yeni Taksit Ekle"}</Text>
      <Text style={styles.label}>Taksit / harcama adı</Text><TextInput value={name} onChangeText={setName} placeholder="Örn. Telefon alışverişi" placeholderTextColor="#94A3B8" style={styles.input} />
      <Text style={styles.label}>İşlem yapılacak kart</Text>
      {cards.length === 0 ? <Text style={styles.emptyText}>Önce Kartlar menüsünden bir kart eklemelisin.</Text> : <View style={styles.cardChoices}>{cards.filter((card) => card.type === "credit").map((card) => <Pressable key={card.id} onPress={() => setCardId(card.id)} style={[styles.choice, card.id === cardId && styles.choiceActive]}><Text style={[styles.choiceText, card.id === cardId && styles.choiceTextActive]}>{card.bankName} · {card.name}</Text></Pressable>)}</View>}
      <View style={styles.numberRow}><View style={styles.numberField}><Text style={styles.label}>Toplam taksit</Text><TextInput value={total} onChangeText={(value) => setTotal(onlyNumber(value))} keyboardType="number-pad" placeholder="12" placeholderTextColor="#94A3B8" style={styles.input} /></View><View style={styles.numberField}><Text style={styles.label}>Ödenen taksit</Text><TextInput value={paid} onChangeText={(value) => setPaid(onlyNumber(value))} keyboardType="number-pad" placeholder="0" placeholderTextColor="#94A3B8" style={styles.input} /></View></View>
      <Text style={styles.helper}>Kalan taksit: {Math.max(0, Number(total || 0) - Number(paid || 0))}</Text>
      <Text style={styles.label}>Not (isteğe bağlı)</Text><TextInput value={note} onChangeText={setNote} multiline placeholder="Ek bilgi..." placeholderTextColor="#94A3B8" style={[styles.input, styles.note]} />
      <View style={styles.formActions}><Pressable disabled={saving} onPress={save} style={styles.save}><Text style={styles.saveText}>{saving ? "Kaydediliyor..." : editing ? "Değişiklikleri Kaydet" : "Taksiti Kaydet"}</Text></Pressable>{editing && <Pressable disabled={saving} onPress={resetForm} style={styles.cancel}><Text style={styles.cancelText}>Vazgeç</Text></Pressable>}</View>
    </View>

    <Text style={styles.sectionTitle}>Kayıtlı Taksitler</Text>
    {installments.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>Henüz taksit yok</Text><Text style={styles.emptyText}>Kartına ait taksitli harcamaları yukarıdaki formdan ekleyebilirsin.</Text></View> : installments.map((item) => {
      const remaining = item.totalInstallments - item.paidInstallments;
      const progress = Math.round((item.paidInstallments / item.totalInstallments) * 100);
      return <View key={item.id} style={styles.item}><View style={styles.itemTop}><View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemCard}>{cardName(item.cardId)}</Text></View><Text style={[styles.status, remaining === 0 && styles.statusDone]}>{remaining === 0 ? "Tamamlandı" : `${remaining} taksit kaldı`}</Text></View><View style={styles.progressTrack}><View style={[styles.progress, { width: `${progress}%` }]} /></View><Text style={styles.progressText}>{item.paidInstallments}. taksit ödendi · Toplam {item.totalInstallments} taksit</Text>{item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}<View style={styles.itemActions}><Pressable disabled={remaining === 0} onPress={() => setPaidInstallments(item.id, item.paidInstallments + 1)} style={[styles.smallButton, remaining === 0 && styles.smallButtonDisabled]}><Text style={styles.smallButtonText}>+ 1 taksit ödendi</Text></Pressable><Pressable onPress={() => beginEdit(item)}><Text style={styles.edit}>Düzenle</Text></Pressable><Pressable onPress={() => Alert.alert("Taksiti sil", `“${item.name}” kaydını silmek istiyor musun?`, [{ text: "Vazgeç", style: "cancel" }, { text: "Sil", style: "destructive", onPress: () => deleteInstallment(item.id) }])}><Text style={styles.delete}>Sil</Text></Pressable></View></View>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg }, content: { width: "100%", maxWidth: 920, alignSelf: "center", padding: 24, paddingBottom: 70 }, header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }, title: { fontSize: 30, fontWeight: "900", color: COLORS.text }, subtitle: { marginTop: 5, color: COLORS.secondary }, back: { color: COLORS.blue, fontWeight: "800", marginTop: 10 }, stats: { flexDirection: "row", gap: 12, marginBottom: 22 }, stat: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border }, statValue: { fontSize: 26, fontWeight: "900", color: COLORS.blue }, statLabel: { marginTop: 3, color: COLORS.secondary, fontSize: 12 }, form: { backgroundColor: COLORS.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: COLORS.border }, formTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 16 }, label: { marginTop: 12, marginBottom: 7, color: COLORS.text, fontWeight: "800", fontSize: 13 }, input: { minHeight: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 13, color: COLORS.text, backgroundColor: "#FFF" }, note: { minHeight: 74, paddingTop: 12, textAlignVertical: "top" }, cardChoices: { gap: 8 }, choice: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12 }, choiceActive: { borderColor: COLORS.blue, backgroundColor: "#EFF6FF" }, choiceText: { color: COLORS.text, fontWeight: "700" }, choiceTextActive: { color: COLORS.blue }, numberRow: { flexDirection: "row", gap: 12 }, numberField: { flex: 1 }, helper: { marginTop: 8, color: COLORS.green, fontWeight: "800", fontSize: 12 }, formActions: { flexDirection: "row", gap: 10, marginTop: 20 }, save: { flex: 1, minHeight: 50, borderRadius: 12, backgroundColor: COLORS.green, alignItems: "center", justifyContent: "center" }, saveText: { color: "#FFF", fontWeight: "900" }, cancel: { minHeight: 50, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" }, cancelText: { color: COLORS.secondary, fontWeight: "800" }, sectionTitle: { marginTop: 28, marginBottom: 11, fontSize: 18, fontWeight: "900", color: COLORS.text }, empty: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 20 }, emptyTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text }, emptyText: { marginTop: 5, color: COLORS.secondary, lineHeight: 19 }, item: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, marginBottom: 10 }, itemTop: { flexDirection: "row", gap: 12, justifyContent: "space-between" }, itemInfo: { flex: 1 }, itemName: { color: COLORS.text, fontSize: 16, fontWeight: "900" }, itemCard: { marginTop: 4, color: COLORS.secondary, fontSize: 12 }, status: { color: COLORS.blue, fontWeight: "800", fontSize: 12 }, statusDone: { color: COLORS.green }, progressTrack: { height: 8, borderRadius: 99, overflow: "hidden", backgroundColor: "#E2E8F0", marginTop: 16 }, progress: { height: "100%", borderRadius: 99, backgroundColor: COLORS.green }, progressText: { marginTop: 7, color: COLORS.secondary, fontSize: 12 }, itemNote: { marginTop: 8, color: COLORS.text, fontSize: 12 }, itemActions: { marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#EEF2F6", flexDirection: "row", alignItems: "center", gap: 16 }, smallButton: { backgroundColor: "#ECFDF5", paddingHorizontal: 11, minHeight: 36, borderRadius: 9, justifyContent: "center" }, smallButtonDisabled: { opacity: .45 }, smallButtonText: { color: COLORS.green, fontSize: 12, fontWeight: "900" }, edit: { color: COLORS.blue, fontWeight: "800", fontSize: 12 }, delete: { color: COLORS.red, fontWeight: "800", fontSize: 12 },
});
