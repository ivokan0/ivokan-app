import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, TextInput, Switch } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { paymentMethodsService, PaymentMethod, UpdatePaymentMethodData } from '../../services/paymentMethods';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RouteParams {
  paymentMethod: PaymentMethod;
}

const EditPaymentMethodScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentMethod } = route.params as RouteParams;
  
  const [formData, setFormData] = useState<UpdatePaymentMethodData>({
    id: paymentMethod.id,
    payment_type: paymentMethod.payment_type,
    account_number: paymentMethod.account_number,
    account_name: paymentMethod.account_name,
    is_default: paymentMethod.is_default,
    bank_name: paymentMethod.bank_name || '',
    country: paymentMethod.country,
  });
  
  const [loading, setLoading] = useState(false);
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false);

  const paymentTypes = [
    { value: 'orange_money', label: t('settings.paymentMethods.types.orange_money') },
    { value: 'wave', label: t('settings.paymentMethods.types.wave') },
    { value: 'mtn_money', label: t('settings.paymentMethods.types.mtn_money') },
    { value: 'moov_money', label: t('settings.paymentMethods.types.moov_money') },
    { value: 'bank_transfer', label: t('settings.paymentMethods.types.bank_transfer') },
  ] as const;

  const handleSave = async () => {
    if (!user?.id) return;

    // Validation
    if (!formData.account_number?.trim()) {
      Alert.alert('Error', 'Account number is required');
      return;
    }
    if (!formData.account_name?.trim()) {
      Alert.alert('Error', 'Account name is required');
      return;
    }
    if (!formData.country?.trim()) {
      Alert.alert('Error', 'Country is required');
      return;
    }
    if (formData.payment_type === 'bank_transfer' && !formData.bank_name?.trim()) {
      Alert.alert('Error', 'Bank name is required for bank transfer');
      return;
    }

    try {
      setLoading(true);
      await paymentMethodsService.updatePaymentMethod(formData);
      // @ts-ignore
      navigation.goBack();
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof UpdatePaymentMethodData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const PaymentTypeDropdown = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setShowPaymentTypeDropdown(!showPaymentTypeDropdown)}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.colors.onSurface }]}>
          {t(`settings.paymentMethods.types.${formData.payment_type}`)}
        </Text>
        <MaterialCommunityIcons
          name={showPaymentTypeDropdown ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
      
      {showPaymentTypeDropdown && (
        <View style={[styles.dropdownOptions, { backgroundColor: theme.colors.surface }]}>
          {paymentTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.dropdownOption,
                formData.payment_type === type.value && { backgroundColor: theme.colors.primaryContainer }
              ]}
              onPress={() => {
                updateFormData('payment_type', type.value);
                setShowPaymentTypeDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownOptionText,
                { color: formData.payment_type === type.value ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
        {/* Payment Type */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            {t('settings.paymentMethods.paymentType')}
          </Text>
          <PaymentTypeDropdown />
        </View>

        {/* Account Number */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            {t('settings.paymentMethods.accountNumber')}
          </Text>
          <TextInput
            value={formData.account_number || ''}
            onChangeText={(text) => updateFormData('account_number', text)}
            style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
            contentStyle={[styles.textInputContent, { color: theme.colors.onSurface }]}
            placeholder={t('settings.paymentMethods.accountNumber')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            mode="outlined"
            outlineStyle={[styles.textInputOutline, { borderColor: theme.colors.outline }]}
          />
        </View>

        {/* Account Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            {t('settings.paymentMethods.accountName')}
          </Text>
          <TextInput
            value={formData.account_name || ''}
            onChangeText={(text) => updateFormData('account_name', text)}
            style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
            contentStyle={[styles.textInputContent, { color: theme.colors.onSurface }]}
            placeholder={t('settings.paymentMethods.accountName')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            mode="outlined"
            outlineStyle={[styles.textInputOutline, { borderColor: theme.colors.outline }]}
          />
        </View>

        {/* Bank Name (only for bank transfer) */}
        {formData.payment_type === 'bank_transfer' && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              {t('settings.paymentMethods.bankName')}
            </Text>
            <TextInput
              value={formData.bank_name || ''}
              onChangeText={(text) => updateFormData('bank_name', text)}
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              contentStyle={[styles.textInputContent, { color: theme.colors.onSurface }]}
              placeholder={t('settings.paymentMethods.bankName')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              mode="outlined"
              outlineStyle={[styles.textInputOutline, { borderColor: theme.colors.outline }]}
            />
          </View>
        )}

        {/* Country */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            {t('settings.paymentMethods.country')}
          </Text>
          <TextInput
            value={formData.country || ''}
            onChangeText={(text) => updateFormData('country', text)}
            style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
            contentStyle={[styles.textInputContent, { color: theme.colors.onSurface }]}
            placeholder={t('settings.paymentMethods.country')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            mode="outlined"
            outlineStyle={[styles.textInputOutline, { borderColor: theme.colors.outline }]}
          />
        </View>

        {/* Set as Default */}
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: theme.colors.onSurface }]}>
            {t('settings.paymentMethods.setAsDefault')}
          </Text>
          <Switch
            value={formData.is_default || false}
            onValueChange={(value) => updateFormData('is_default', value)}
            color={theme.colors.primary}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.6 }
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>
            {loading ? t('common.loading') : t('settings.paymentMethods.save')}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    borderRadius: 12,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  textInput: {
    borderRadius: 8,
  },
  textInputContent: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  textInputOutline: {
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default EditPaymentMethodScreen;
