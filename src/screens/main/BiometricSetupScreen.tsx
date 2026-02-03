import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Theme } from '../../styles/themes';
import { useBiometric } from '../../hooks/useBiometric';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isAvailable, biometryType, isEnabled, enableBiometric, authenticate } = useBiometric();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      setCurrentStep(3);
      setSetupComplete(true);
    }
  }, [isEnabled]);

  const getBiometricName = () => {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
      case 'Fingerprint':
        return 'Fingerprint';
      default:
        return 'Biometric';
    }
  };

  const getBiometricIcon = (): string => {
    switch (biometryType) {
      case 'FaceID':
        return 'face-smile';
      case 'TouchID':
      case 'Fingerprint':
        return 'fingerprint';
      default:
        return 'lock';
    }
  };

  const openDeviceSettings = () => {
    setLoading(true);
    
    Linking.openSettings().then(() => {
      setLoading(false);
    }).catch(() => {
      Alert.alert(
        'Device Settings',
        getSetupInstructions(),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' }
        ]
      );
      setLoading(false);
    });
  };

  const getSetupInstructions = () => {
    if (Platform.OS === 'ios') {
      if (biometryType === 'FaceID') {
        return 'Please go to:\nSettings > Face ID & Passcode > Set Up Face ID\n\nFollow the on-screen instructions to register your face.';
      } else {
        return 'Please go to:\nSettings > Touch ID & Passcode > Add a Fingerprint\n\nFollow the on-screen instructions to register your fingerprint.';
      }
    } else {
      return 'Please go to:\nSettings > Security > Fingerprint\n\nFollow the on-screen instructions to register your fingerprint.';
    }
  };

  const handleCheckSetup = async () => {
    setLoading(true);
    
    try {
      const authSuccess = await authenticate();
      
      if (authSuccess) {
        setCurrentStep(2);
        Alert.alert(
          'Success!',
          `${getBiometricName()} is working correctly.`,
          [{ text: 'Continue', onPress: () => setCurrentStep(3) }]
        );
      } else {
        Alert.alert(
          'Setup Required',
          `Please complete ${getBiometricName()} setup in your device settings first.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to verify biometric setup. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnableAppBiometric = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    setLoading(true);
    try {
      const success = await enableBiometric(user.email, 'your-password');
      
      if (success) {
        setSetupComplete(true);
        Alert.alert(
          'Setup Complete!',
          `${getBiometricName()} has been enabled for this app. You can now use it for secure login.`,
          [{ text: 'Finish', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to enable ${getBiometricName()}. Please try again.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while enabling biometric authentication.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <FontAwesome6 name="gear" size={32} color={Theme.colors.primary} iconStyle='solid'/>
        <Text style={styles.stepTitle}>Device Setup</Text>
      </View>
      
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name={getBiometricIcon() as any} size={80} color={Theme.colors.primary} />
        </View>

        <Text style={styles.stepDescription}>
          {`First, set up ${getBiometricName()} in your device settings.`}
        </Text>
        
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <FontAwesome6 name="circle-info" size={20} color={Theme.colors.primary} iconStyle='solid'/>
            <Text style={styles.instructionTitle}>Setup Instructions:</Text>
          </View>
          <Text style={styles.instructionText}>
            {getSetupInstructions()}
          </Text>
        </View>

        <Button
          title="Open Device Settings"
          onPress={openDeviceSettings}
          loading={loading}
          variant="primary"
          size="large"
          style={styles.actionButton}
          icon='gear'
        />

        <Button
          title="I've Completed Device Setup"
          onPress={handleCheckSetup}
          loading={loading}
          variant="outline"
          size="large"
          style={styles.actionButton}
          icon="circle-check"
          />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <FontAwesome6 name="check" size={32} color={Theme.colors.success} iconStyle='solid' />
        <Text style={styles.stepTitle}>Verification</Text>
      </View>
      
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name="circle-check" size={80} color={Theme.colors.success} />
        </View>

        <Text style={styles.stepDescription}>
          {`Great! ${getBiometricName()} is set up on your device.`}
        </Text>
        
        <View style={styles.verificationCard}>
          <FontAwesome6 name="shield" size={40} color={Theme.colors.success} iconStyle='solid'/>
          <Text style={styles.verificationText}>
            {`Your ${getBiometricName()} is working correctly.`}
          </Text>
        </View>

        <Button
          title="Continue to App Setup"
          onPress={() => setCurrentStep(3)}
          variant="primary"
          size="large"
          style={styles.actionButton}
          icon="arrow-right"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <FontAwesome6 name="mobile-screen-button" size={32} color={Theme.colors.primary} iconStyle='solid'/>
        <Text style={styles.stepTitle}>App Setup</Text>
      </View>
      
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name="lock" size={80} color={Theme.colors.primary} iconStyle='solid'/>
        </View>

        <Text style={styles.stepDescription}>
          {`Enable ${getBiometricName()} for secure app authentication.`}
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <FontAwesome6 name="bolt" size={20} color={Theme.colors.success}iconStyle='solid' />
            <Text style={styles.featureText}>Quick and secure login</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome6 name="key" size={20} color={Theme.colors.success} iconStyle='solid'/>
            <Text style={styles.featureText}>No password needed</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome6 name="shield-halved" size={20} color={Theme.colors.success} iconStyle='solid'/>
            <Text style={styles.featureText}>Enhanced security</Text>
          </View>
        </View>

        <View style={styles.securityCard}>
          <FontAwesome6 name="shield" size={24} color={Theme.colors.text.secondary} iconStyle='solid'/>
          <Text style={styles.securityNote}>
            Your biometric data never leaves your device and is not shared with our servers.
          </Text>
        </View>

        <Button
          title={`Enable ${getBiometricName()}`}
          onPress={handleEnableAppBiometric}
          loading={loading}
          variant="primary"
          size="large"
          style={styles.actionButton}
          icon="lock"
        />
      </View>
    </View>
  );

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.progressStep}>
          <View style={[
            styles.progressCircle,
            currentStep >= step ? styles.progressCircleActive : styles.progressCircleInactive
          ]}>
            {currentStep > step ? (
              <FontAwesome6 name="check" size={16} color={Theme.colors.white} iconStyle='solid'/>
            ) : (
              <Text style={[
                styles.progressText,
                currentStep >= step ? styles.progressTextActive : styles.progressTextInactive
              ]}>
                {step}
              </Text>
            )}
          </View>
          {step < 3 && (
            <View style={[
              styles.progressLine,
              currentStep > step ? styles.progressLineActive : styles.progressLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <Container>
        <Loading text="Checking setup..." />
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <FontAwesome6 name={getBiometricIcon() as any} size={48} color={Theme.colors.primary} />
          <Text style={styles.title}>{getBiometricName()} Setup</Text>
          <Text style={styles.subtitle}>
            Follow these steps to set up {getBiometricName()} for secure authentication
          </Text>
        </View>

        {/* Progress Indicator */}
        {renderProgress()}

        {/* Steps */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <FontAwesome6 name="circle-question" size={24} color={Theme.colors.text.primary} />
            <Text style={styles.helpTitle}>Need Help?</Text>
          </View>
          <View style={styles.helpItems}>
            <View style={styles.helpItem}>
              <FontAwesome6 name="mobile" size={16} color={Theme.colors.text.secondary} iconStyle='solid' />
              <Text style={styles.helpText}>Make sure your device supports {getBiometricName()}</Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="lock" size={16} color={Theme.colors.text.secondary} iconStyle='solid' />
              <Text style={styles.helpText}>Ensure screen lock is enabled</Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="book" size={16} color={Theme.colors.text.secondary} iconStyle='solid' />
              <Text style={styles.helpText}>Follow on-screen instructions carefully</Text>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="life-ring" size={16} color={Theme.colors.text.secondary} />
                <Text style={styles.helpText}>Contact support if you encounter issues</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.size.xxl,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginVertical: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.md,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: Theme.colors.primary,
  },
  progressCircleInactive: {
    backgroundColor: Theme.colors.gray[200],
  },
  progressText: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.bold,
  },
  progressTextActive: {
    color: Theme.colors.white,
  },
  progressTextInactive: {
    color: Theme.colors.text.secondary,
  },
  progressLine: {
    width: 60,
    height: 2,
    marginHorizontal: Theme.spacing.sm,
  },
  progressLineActive: {
    backgroundColor: Theme.colors.primary,
  },
  progressLineInactive: {
    backgroundColor: Theme.colors.gray[200],
  },
  stepContainer: {
    marginBottom: Theme.spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  stepTitle: {
    fontSize: Theme.typography.size.xl,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  stepContent: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borders.radius.large,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    ...Theme.shadows.small,
  },
  iconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  stepDescription: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.lineHeight.md,
  },
  instructionCard: {
    backgroundColor: Theme.colors.primaryLight + '20',
    borderRadius: Theme.borders.radius.medium,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  instructionTitle: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  instructionText: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.md,
  },
  verificationCard: {
    backgroundColor: Theme.colors.success + '20',
    borderRadius: Theme.borders.radius.medium,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  verificationText: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    lineHeight: Theme.typography.lineHeight.md,
  },
  featureList: {
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  featureText: {
    fontSize: Theme.typography.size.md,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.md,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.gray[50],
    borderRadius: Theme.borders.radius.medium,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  securityNote: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.md,
    flex: 1,
    fontStyle: 'italic',
  },
  actionButton: {
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  helpSection: {
    backgroundColor: Theme.colors.gray[50],
    borderRadius: Theme.borders.radius.large,
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  helpTitle: {
    fontSize: Theme.typography.size.lg,
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.sm,
  },
  helpItems: {
    gap: Theme.spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    fontSize: Theme.typography.size.sm,
    fontFamily: Theme.typography.family.regular,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
});

export default BiometricSetupScreen;