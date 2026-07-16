import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY
);
fetch(process.env.EXPO_PUBLIC_SUPABASE_URL)
  .then(r => console.log('Raggiungibile:', r.status))
  .catch(e => console.log('Non raggiungibile:', e.message));

export default function App() {
  const [candidati, setCandidati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  useEffect(() => {
    caricaCandidati();
  }, []);

  async function caricaCandidati() {
    const { data, error } = await supabase
      .from('screener_results')
      .select('ticker, nome, score, revenue_growth, momentum_6m')
      .eq('passa_filtro', true)
      .order('score', { ascending: false });

    if (error) setErrore(error.message);
    else setCandidati(data ?? []);
    setLoading(false);
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1A6EBD" />
      <Text style={styles.muted}>Caricamento...</Text>
    </View>
  );

  if (errore) return (
    <View style={styles.center}>
      <Text style={{ color: 'red' }}>{errore}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📈 MyViewInvest</Text>
      <Text style={styles.muted}>{candidati.length} candidati oggi</Text>
      <FlatList
        data={candidati}
        keyExtractor={(item) => item.ticker}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.score}</Text>
              </View>
            </View>
            <Text style={styles.nome}>{item.nome}</Text>
            <View style={styles.row}>
              <Text style={styles.metrica}>
                Rev: {item.revenue_growth ? (item.revenue_growth * 100).toFixed(1) + '%' : '-'}
              </Text>
              <Text style={styles.metrica}>
                Mom: {item.momentum_6m ? (item.momentum_6m * 100).toFixed(1) + '%' : '-'}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#0F2B4C', paddingHorizontal: 16, marginBottom: 4 },
  muted: { fontSize: 13, color: '#5A6A7E', paddingHorizontal: 16, marginBottom: 12 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10,
    borderRadius: 10, padding: 14, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticker: { fontSize: 18, fontWeight: 'bold', color: '#0F2B4C' },
  badge: { backgroundColor: '#1A6EBD', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  nome: { fontSize: 12, color: '#5A6A7E', marginTop: 2, marginBottom: 8 },
  metrica: { fontSize: 12, color: '#1C2B3A' },
});