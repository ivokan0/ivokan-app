import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme, Divider } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { paymentMethodsService, PaymentMethod } from '../../services/paymentMethods';


const PaymentMethodsScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentMethods = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const methods = await paymentMethodsService.getPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        loadPaymentMethods();
      }
    }, [isFocused, user?.id])
  );

  const navigateToAddPaymentMethod = () => {
    // @ts-ignore
    navigation.navigate('AddPaymentMethod');
  };

  const navigateToEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    // @ts-ignore
    navigation.navigate('EditPaymentMethod', { paymentMethod });
  };

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    Alert.alert(
      t('settings.paymentMethods.deleteConfirmation'),
      t('settings.paymentMethods.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.paymentMethods.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentMethodsService.deletePaymentMethod(paymentMethod.id);
              await loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (paymentMethod: PaymentMethod) => {
    if (!user?.id) return;
    
    try {
      await paymentMethodsService.setDefaultPaymentMethod(user.id, paymentMethod.id);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const getPaymentTypeIcon = (paymentType: PaymentMethod['payment_type']) => {
    switch (paymentType) {
      case 'orange_money':
        return 'cellphone';
      case 'wave':
        return 'wave';
      case 'mtn_money':
        return 'cellphone';
      case 'moov_money':
        return 'cellphone';
      case 'bank_transfer':
        return 'bank';
      default:
        return 'credit-card';
    }
  };

  const PaymentMethodItem = ({ paymentMethod }: { paymentMethod: PaymentMethod }) => (
    <View style={[styles.paymentMethodItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodInfo}>
          <MaterialCommunityIcons
            name={getPaymentTypeIcon(paymentMethod.payment_type) as any}
            size={24}
            color={theme.colors.primary}
            style={styles.paymentMethodIcon}
          />
          <View style={styles.paymentMethodDetails}>
            <Text style={[styles.paymentMethodType, { color: theme.colors.onSurface }]}>
              {t(`settings.paymentMethods.types.${paymentMethod.payment_type}`)}
            </Text>
            <Text style={[styles.paymentMethodAccount, { color: theme.colors.onSurfaceVariant }]}>
              {paymentMethod.account_name}
            </Text>
            <Text style={[styles.paymentMethodNumber, { color: theme.colors.onSurfaceVariant }]}>
              {paymentMethod.account_number}
            </Text>
          </View>
        </View>
        {paymentMethod.is_default && (
          <View style={[styles.defaultBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.defaultText, { color: theme.colors.onPrimary }]}>
              {t('settings.paymentMethods.default')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentMethodActions}>
        {!paymentMethod.is_default && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => handleSetDefault(paymentMethod)}
          >
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={theme.colors.onPrimaryContainer}
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimaryContainer }]}>
              {t('settings.paymentMethods.setAsDefault')}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigateToEditPaymentMethod(paymentMethod)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
            {t('settings.availability.edit')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.errorContainer }]}
          onPress={() => handleDeletePaymentMethod(paymentMethod)}
        >
          <MaterialCommunityIcons
            name="delete"
            size={16}
            color={theme.colors.onErrorContainer}
          />
          <Text style={[styles.actionButtonText, { color: theme.colors.onErrorContainer }]}>
            {t('settings.paymentMethods.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Add Button */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('settings.paymentMethods.title')}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={navigateToAddPaymentMethod}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.onPrimary}
          />
          <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>
            {t('settings.paymentMethods.addPaymentMethod')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Methods List */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              {t('common.loading')}
            </Text>
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="credit-card-off"
              size={48}
              color={theme.colors.onSurfaceVariant}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              {t('settings.paymentMethods.noPaymentMethods')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.paymentMethods.addFirst')}
            </Text>
          </View>
        ) : (
          paymentMethods.map((paymentMethod) => (
            <React.Fragment key={paymentMethod.id}>
              <PaymentMethodItem paymentMethod={paymentMethod} />
              <Divider style={styles.divider} />
            </React.Fragment>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 8,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  paymentMethodItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  paymentMethodIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodType: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  paymentMethodAccount: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 2,
  },
  paymentMethodNumber: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 8,
  },
});

export default PaymentMethodsScreen;
