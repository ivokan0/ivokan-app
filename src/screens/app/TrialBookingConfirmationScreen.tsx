import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { useTheme, Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCurrency } from '../../hooks/useCurrency';
import { createTrialBooking } from '../../services/trialBookings';
import { useAuth } from '../../hooks/useAuth';

type RouteParams = {
  tutor: { first_name?: string | null; last_name?: string | null; avatar_url?: string | null; average_rating?: number; total_reviews?: number };
  booking: { date: string; start_time: string; end_time: string; duration_minutes: number; price_eur: number; price_fcfa: number };
  bookingData: any;
};

const TrialBookingConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { currency, formatCurrency } = useCurrency();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const { tutor, booking, bookingData } = route.params as unknown as RouteParams;

  const formatDateLabel = (isoDate: string) => {
    const date = new Date(isoDate);
    const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return `${weekday}, ${booking.start_time} – ${booking.end_time}`;
  };

  const getDateInfo = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const computeAmount = () => {
    const base = currency === 'FCFA' ? booking.price_fcfa : booking.price_eur;
    return { base, total: base };
  };

  const amount = computeAmount();

  const handlePayment = async () => {
    if (!profile?.user_id) return;

    try {
      setIsLoading(true);
      const { data: booking, error } = await createTrialBooking(bookingData, profile.user_id);

      if (error) {
        Alert.alert(t('errors.booking.title'), error.message);
      } else {
        Alert.alert(
          t('booking.success.title'),
          t('booking.success.trialLessonBooked'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('Main'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(t('errors.booking.title'), t('errors.booking.create'));
    } finally {
      setIsLoading(false);
    }
  };

     return (
     <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
       <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
         {/* Tutor card */}
         <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
           <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Votre professeur</Text>
           <View style={styles.tutorRow}>
                        <Image source={tutor.avatar_url ? { uri: tutor.avatar_url } : require('../../../assets/icon.png')} style={styles.avatar} />
             <View style={{ flex: 1 }}>
               <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
                 {tutor.first_name || ''} {tutor.last_name || ''}
               </Text>
               <Text style={[styles.tutorMeta, { color: theme.colors.onSurfaceVariant }]}>★ {tutor.average_rating ?? 5} ({tutor.total_reviews ?? 0} avis)</Text>
             </View>
           </View>
         </View>

         {/* Lesson details */}
         <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
           <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Détails du cours d'essai</Text>
                    <View style={styles.lessonRow}>
              <View style={styles.dateBadge}>
                <Text style={[styles.monthText, { color: theme.colors.primary }]}>{getDateInfo(booking.date).month}</Text>
                <Text style={[styles.dayText, { color: theme.colors.onSurface }]}>{getDateInfo(booking.date).day}</Text>
              </View>
             <View style={{ flex: 1 }}>
               <Text style={[styles.lessonWhen, { color: theme.colors.onSurface }]}>{formatDateLabel(booking.date)}</Text>
               <Text style={[styles.lessonSub, { color: theme.colors.onSurfaceVariant }]}>Heure locale d'après votre emplacement</Text>
             </View>
           </View>
           <Text style={[styles.freeCancel, { color: theme.colors.primary }]}>Annulez ou reprogrammez gratuitement jusqu'à 01:30</Text>
         </View>

         {/* Payment details */}
         <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
           <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Détails du paiement</Text>
                    <View style={styles.rowBetween}>
              <Text style={[styles.payLabel, { color: theme.colors.onSurfaceVariant }]}>{booking.duration_minutes} min de cours</Text>
              <Text style={[styles.payValue, { color: theme.colors.onSurface }]}>{formatCurrency(amount.total)}</Text>
            </View>
         </View>

         {/* Info banner */}
         <View style={[styles.infoBanner, { backgroundColor: theme.colors.surfaceVariant }]}>
           <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>Changement de professeur gratuit</Text>
           <Text style={[styles.infoSub, { color: theme.colors.onSurfaceVariant }]}>Ce professeur ne vous correspond pas ? Faites l'essai avec 2 autres personnes, gratuitement</Text>
         </View>
       </ScrollView>

       {/* Fixed bottom button */}
       <View style={styles.bottomContainer}>
         <Button 
           mode="contained" 
           onPress={handlePayment}
           loading={isLoading}
           style={styles.payButton} 
           labelStyle={{ fontFamily: 'Baloo2_600SemiBold', fontSize: 16 }}
         >
           Payer
         </Button>
       </View>
     </SafeAreaView>
   );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontFamily: 'Baloo2_600SemiBold', fontSize: 16, marginBottom: 8 },
  tutorRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd' },
  tutorName: { fontFamily: 'Baloo2_600SemiBold', fontSize: 18 },
  tutorMeta: { fontFamily: 'Baloo2_400Regular', fontSize: 13 },
  lessonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dateBadge: { width: 56, height: 64, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  monthText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12 },
  dayText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 20 },
  lessonWhen: { fontFamily: 'Baloo2_600SemiBold', fontSize: 16 },
  lessonSub: { fontFamily: 'Baloo2_400Regular', fontSize: 13 },
  freeCancel: { marginTop: 8, fontFamily: 'Baloo2_400Regular', fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  payLabel: { fontFamily: 'Baloo2_400Regular', fontSize: 14 },
  payValue: { fontFamily: 'Baloo2_500Medium', fontSize: 14 },
  totalLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 16 },
  totalValue: { fontFamily: 'Baloo2_600SemiBold', fontSize: 16 },
  infoBanner: { padding: 12, borderRadius: 12, marginBottom: 12 },
  infoText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14 },
  infoSub: { fontFamily: 'Baloo2_400Regular', fontSize: 13 },
     bottomContainer: {
     padding: 16,
     borderTopWidth: 1,
     borderTopColor: '#f0f0f0',
     backgroundColor: '#fff',
   },
   payButton: { 
     paddingVertical: 12,
   },
});

export default TrialBookingConfirmationScreen;


