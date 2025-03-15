type TranslationKey = string;

interface Translations {
  [key: string]: {
    [key in TranslationKey]: string;
  };
}

const translations: Translations = {
  en: {
    settings: 'Settings',
    farmProfile: 'Farm Profile',
    personalDetails: 'Personal Details',
    farmLocation: 'Farm Location',
    cropManagement: 'Crop Management',
    preferences: 'Preferences',
    language: 'Language',
    voiceSettings: 'Voice Settings',
    notifications: 'Notifications',
    dataPrivacy: 'Data & Privacy',
    offlineStorage: 'Offline Storage',
    privacySettings: 'Privacy Settings',
    support: 'Support',
    help: 'Help',
    aboutKrishiAI: 'About KrishiAI',
    account: 'Account',
    email: 'Email',
    name: 'Name',
    signOut: 'Sign Out',
    selectLanguage: 'Select Language',
    manageCrops: 'Manage Crops',
    enterCropsCommaSeparated: 'Enter crops (comma separated)',
    enterFarmLocation: 'Enter farm location',
    enterYourName: 'Enter your name',
    save: 'Save',
    notSet: 'Not set',
    noCropsAdded: 'No crops added',
    noEmail: 'No email',
    noName: 'No name',
  },
  hi: {
    settings: 'सेटिंग्स',
    farmProfile: 'खेत प्रोफाइल',
    personalDetails: 'व्यक्तिगत विवरण',
    farmLocation: 'खेत का स्थान',
    cropManagement: 'फसल प्रबंधन',
    preferences: 'प्राथमिकताएँ',
    language: 'भाषा',
    voiceSettings: 'आवाज़ सेटिंग्स',
    notifications: 'सूचनाएँ',
    dataPrivacy: 'डेटा और गोपनीयता',
    offlineStorage: 'ऑफलाइन स्टोरेज',
    privacySettings: 'गोपनीयता सेटिंग्स',
    support: 'सहायता',
    help: 'मदद',
    aboutKrishiAI: 'कृषि AI के बारे में',
    account: 'खाता',
    email: 'ईमेल',
    name: 'नाम',
    signOut: 'साइन आउट',
    selectLanguage: 'भाषा चुनें',
    manageCrops: 'फसलों का प्रबंधन',
    enterCropsCommaSeparated: 'फसलें दर्ज करें (अल्पविराम से अलग)',
    enterFarmLocation: 'खेत का स्थान दर्ज करें',
    enterYourName: 'अपना नाम दर्ज करें',
    save: 'सहेजें',
    notSet: 'सेट नहीं है',
    noCropsAdded: 'कोई फसल नहीं जोड़ी गई',
    noEmail: 'कोई ईमेल नहीं',
    noName: 'कोई नाम नहीं',
  },
};

export class I18n {
  private locale: string;

  constructor(locale: string) {
    this.locale = translations[locale] ? locale : 'en';
  }

  t(key: TranslationKey): string {
    if (!translations[this.locale] || !translations[this.locale][key]) {
      // Fallback to English if translation is missing
      return translations.en[key] || key;
    }
    return translations[this.locale][key];
  }

  setLocale(locale: string): void {
    if (translations[locale]) {
      this.locale = locale;
    }
  }

  getLocale(): string {
    return this.locale;
  }
} 