import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { useAppStore } from '@/store';
import { SupportAPI } from '@/api/support';

interface HelpTip {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

const helpTips: HelpTip[] = [
    {
        id: '1',
        icon: 'lock-closed-outline',
        title: 'Unlocking Your Device',
        description: 'Tap the unlock button on your device card to remotely unlock it. Make sure your device is online and connected.',
    },
    {
        id: '2',
        icon: 'link-outline',
        title: 'Creating Access Links',
        description: 'Go to the Links tab to create temporary access links for delivery drivers. Set expiry time and usage limits for security.',
    },
    {
        id: '3',
        icon: 'notifications-outline',
        title: 'Managing Notifications',
        description: 'Customize your notification preferences in Settings > Notifications. Enable alerts for unlocks, low battery, and more.',
    },
    {
        id: '4',
        icon: 'add-circle-outline',
        title: 'Adding a Device',
        description: 'Go to Settings and tap "Add Device". Enter your device serial number and PIN to link it to your account.',
    },
    {
        id: '5',
        icon: 'battery-charging-outline',
        title: 'Battery Monitoring',
        description: 'Check your device battery level on the home screen. You\'ll receive alerts when battery is low.',
    },
    {
        id: '6',
        icon: 'time-outline',
        title: 'Delivery Tracking',
        description: 'View all your deliveries in the Deliveries tab. Track when packages are delivered and who accessed your device.',
    },
];

export default function HelpAndSupportScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAppStore((state) => state.user);

    const [showContactForm, setShowContactForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitRequest = async () => {
        if (!subject.trim() || subject.trim().length < 5) {
            Alert.alert('Invalid Subject', 'Please enter a subject (at least 5 characters)');
            return;
        }

        if (!message.trim() || message.trim().length < 10) {
            Alert.alert('Invalid Message', 'Please describe your issue in detail (at least 10 characters)');
            return;
        }

        setIsSubmitting(true);

        try {
            await SupportAPI.submitRequest({
                subject: subject.trim(),
                message: message.trim(),
            });

            Alert.alert(
                'Request Submitted',
                'Your support request has been submitted successfully. Our team will review it and get back to you soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSubject('');
                            setMessage('');
                            setShowContactForm(false);
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Failed to submit support request:', error);
            Alert.alert(
                'Submission Failed',
                error.response?.data?.detail || 'Failed to submit your request. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <Header title="Help & Support" showBack={true} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {!showContactForm ? (
                    <>
                        {/* Help Tips Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                How to Use LoQey
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.tabIconDefault }]}>
                                Quick tips to help you get the most out of your LoQey smart lockbox
                            </Text>

                            {helpTips.map((tip) => (
                                <View key={tip.id} style={[styles.tipCard, { backgroundColor: colors.card }]}>
                                    <View style={[styles.tipIconContainer, { backgroundColor: colors.tint + '20' }]}>
                                        <Ionicons name={tip.icon} size={24} color={colors.tint} />
                                    </View>
                                    <View style={styles.tipContent}>
                                        <Text style={[styles.tipTitle, { color: colors.text }]}>
                                            {tip.title}
                                        </Text>
                                        <Text style={[styles.tipDescription, { color: colors.tabIconDefault }]}>
                                            {tip.description}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Contact Support Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Need More Help?
                            </Text>
                            <Text style={[styles.sectionDescription, { color: colors.tabIconDefault }]}>
                                Can't find what you're looking for? Our support team is here to help.
                            </Text>

                            <TouchableOpacity
                                style={[styles.contactButton, { backgroundColor: colors.tint }]}
                                onPress={() => setShowContactForm(true)}
                            >
                                <Ionicons name="mail-outline" size={20} color="white" />
                                <Text style={styles.contactButtonText}>Contact Our Team</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Additional Resources */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Additional Resources
                            </Text>

                            <TouchableOpacity
                                style={[styles.resourceItem, { backgroundColor: colors.card }]}
                                onPress={() => Alert.alert('FAQ', 'FAQ page coming soon!')}
                            >
                                <Ionicons name="help-circle-outline" size={24} color={colors.tint} />
                                <Text style={[styles.resourceText, { color: colors.text }]}>
                                    Frequently Asked Questions
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    /* Contact Form */
                    <View style={styles.section}>

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Contact Support
                        </Text>
                        <Text style={[styles.sectionDescription, { color: colors.tabIconDefault }]}>
                            Describe the issue you're experiencing and our team will get back to you.
                        </Text>

                        <View style={styles.formContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.card,
                                        color: colors.text,
                                        borderColor: colors.tabIconDefault + '40',
                                    },
                                ]}
                                placeholder="Brief description of your issue"
                                placeholderTextColor={colors.tabIconDefault}
                                value={subject}
                                onChangeText={setSubject}
                                maxLength={255}
                                editable={!isSubmitting}
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Message *</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: colors.card,
                                        color: colors.text,
                                        borderColor: colors.tabIconDefault + '40',
                                    },
                                ]}
                                placeholder="Please provide detailed information about your issue..."
                                placeholderTextColor={colors.tabIconDefault}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={8}
                                textAlignVertical="top"
                                editable={!isSubmitting}
                            />

                            <View style={styles.userInfo}>
                                <Ionicons name="information-circle-outline" size={16} color={colors.tabIconDefault} />
                                <Text style={[styles.userInfoText, { color: colors.tabIconDefault }]}>
                                    Your contact information ({user?.email}) will be included with this request.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: colors.tint },
                                    isSubmitting && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmitRequest}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="send-outline" size={20} color="white" />
                                        <Text style={styles.submitButtonText}>Submit Request</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    tipCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tipIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    tipDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    contactButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resourceText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginLeft: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    formContainer: {
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
        minHeight: 150,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        gap: 6,
    },
    userInfoText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

