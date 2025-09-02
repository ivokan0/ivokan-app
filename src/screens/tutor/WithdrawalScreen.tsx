import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import WithdrawalScreenSkeleton from '../../components/ui/WithdrawalScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useWithdrawals } from '../../hooks/useWithdrawals';
import { useCurrency } from '../../hooks/useCurrency';
import { paymentMethodsService, PaymentMethod } from '../../services/paymentMethods';

const WithdrawalScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { createWithdrawal, loading, error, refresh } = useWithdrawals();
  const { formatCurrency } = useCurrency();

  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    if (!user?.id) return;

    try {
      const data = await paymentMethodsService.getPaymentMethods(user.id);
      setPaymentMethods(data || []);
      if (data && data.length > 0) {
        setSelectedPaymentMethod(data[0]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
             const { data, error } = await createWithdrawal({
         tutor_id: user!.id,
         amount: amountValue,
         payment_method_id: selectedPaymentMethod.id,
       });

      if (error) {
        Alert.alert('Error', 'Failed to create withdrawal request');
      } else {
        Alert.alert(
          'Success', 
          'Withdrawal request submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = async () => {
    await refresh();
  };

  // Show skeleton while loading
  if (loading) {
    return <WithdrawalScreenSkeleton />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >


      {/* Amount Input */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.withdrawalAmount')}
        </Text>
        <View style={styles.amountInputContainer}>
          <Text style={[styles.currencySymbol, { color: theme.colors.onSurfaceVariant }]}>
            €
          </Text>
          <TextInput
            style={[styles.amountInput, { 
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline 
            }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="numeric"
            autoFocus
          />
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.paymentMethod')}
        </Text>
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedPaymentMethod?.id === method.id && { 
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primaryContainer 
                }
              ]}
              onPress={() => setSelectedPaymentMethod(method)}
            >
                             <MaterialCommunityIcons 
                 name={getPaymentMethodIcon(method.payment_type) as any} 
                 size={24} 
                 color={selectedPaymentMethod?.id === method.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
               />
              <View style={styles.paymentMethodInfo}>
                <Text style={[styles.paymentMethodName, { color: theme.colors.onSurface }]}>
                  {method.account_name}
                </Text>
                <Text style={[styles.paymentMethodDetails, { color: theme.colors.onSurfaceVariant }]}>
                  {method.account_number} • {method.payment_type.replace('_', ' ')}
                </Text>
              </View>
              {selectedPaymentMethod?.id === method.id && (
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noPaymentMethodsContainer}>
            <MaterialCommunityIcons 
              name="bank-off" 
              size={48} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.noPaymentMethodsText, { color: theme.colors.onSurfaceVariant }]}>
              {t('tutor.noPaymentMethods')}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('PaymentMethods' as never)}
              style={styles.addPaymentMethodButton}
            >
              {t('tutor.addPaymentMethod')}
            </Button>
          </View>
        )}
      </View>

      {/* Important Notice */}
      <View style={[styles.noticeContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons 
          name="information-outline" 
          size={20} 
          color={theme.colors.primary} 
        />
        <View style={styles.noticeContent}>
          <Text style={[styles.noticeTitle, { color: theme.colors.primary }]}>
            {t('tutor.withdrawalNoticeTitle')}
          </Text>
          <Text style={[styles.noticeText, { color: theme.colors.onPrimaryContainer }]}>
            {t('tutor.withdrawalNoticeText')}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!selectedPaymentMethod || !amount || submitting}
          loading={submitting}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.submitButtonContent}
        >
          {t('tutor.submitWithdrawalRequest')}
        </Button>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={20} 
            color={theme.colors.error} 
          />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const getPaymentMethodIcon = (paymentType: string): string => {
  switch (paymentType) {
    case 'orange_money': return 'cellphone';
    case 'wave': return 'wave';
    case 'mtn_money': return 'cellphone';
    case 'moov_money': return 'cellphone';
    case 'bank_transfer': return 'bank';
    default: return 'credit-card';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },

  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    padding: 0,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  paymentMethodDetails: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  noPaymentMethodsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noPaymentMethodsText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
     addPaymentMethodButton: {
     marginTop: 8,
   },
   noticeContainer: {
     flexDirection: 'row',
     alignItems: 'flex-start',
     margin: 16,
     padding: 16,
     borderRadius: 12,
     gap: 12,
   },
   noticeContent: {
     flex: 1,
   },
   noticeTitle: {
     fontSize: 14,
     fontWeight: '600',
     fontFamily: 'Baloo2_600SemiBold',
     marginBottom: 4,
   },
   noticeText: {
     fontSize: 13,
     fontFamily: 'Baloo2_400Regular',
     lineHeight: 18,
   },
   submitContainer: {
    margin: 16,
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default WithdrawalScreen;
