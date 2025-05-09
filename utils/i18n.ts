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
    farmDetails: 'Farm Details',
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
    accountActions: 'Account Actions',
    comingSoon: 'Coming Soon',
    farmingExperience: 'Farming Experience',
    enterYourFarmingExperience: 'Enter your farming experience',
    yearsOfExperience: 'Years of Experience',
    farmSize: 'Farm Size',
    soilType: 'Soil Type',
    waterSources: 'Water Sources',
    primaryWaterSource: 'Primary Water Source',
    secondaryWaterSource: 'Secondary Water Source',
    irrigationSystem: 'Irrigation System',
    enterCropName: 'Enter crop name',
    yourCrops: 'Your Crops',
    cancel: 'Cancel',
    edit: 'Edit',
    // News feed and market ticker translations
    marketPrices: 'Market Prices',
    latestNews: 'Latest News',
    loadingNews: 'Loading News...',
    retry: 'Retry',
    viewArticle: 'View Article',
    readMore: 'Read More',
    shareArticle: 'Share Article',
    cropPrices: 'Crop Prices',
    priceUpdate: 'Price Update',
    // Home page specific translations
    ourAgricultureField: 'Our agriculture field',
    viewMap: 'View Map',
  },
  hi: {
    settings: 'सेटिंग्स',
    farmProfile: 'खेत प्रोफाइल',
    personalDetails: 'व्यक्तिगत विवरण',
    farmLocation: 'खेत का स्थान',
    farmDetails: 'खेत का विवरण',
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
    accountActions: 'खाता कार्रवाई',
    comingSoon: 'जल्द आ रहा है',
    farmingExperience: 'खेती का अनुभव',
    enterYourFarmingExperience: 'अपना खेती का अनुभव दर्ज करें',
    yearsOfExperience: 'खेती के वर्षों का अनुभव',
    farmSize: 'खेत का आकार',
    soilType: 'मिट्टी का प्रकार',
    waterSources: 'जल स्रोत',
    primaryWaterSource: 'प्राथमिक जल स्रोत',
    secondaryWaterSource: 'माध्यमिक जल स्रोत',
    irrigationSystem: 'सिंचाई प्रणाली',
    enterCropName: 'फसल का नाम दर्ज करें',
    yourCrops: 'आपकी फसलें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    // News feed and market ticker translations
    marketPrices: 'बाजार मूल्य',
    latestNews: 'ताजा समाचार',
    loadingNews: 'समाचार लोड हो रहा है...',
    retry: 'पुनः प्रयास करें',
    viewArticle: 'लेख देखें',
    readMore: 'और पढ़ें',
    shareArticle: 'लेख साझा करें',
    cropPrices: 'फसल मूल्य',
    priceUpdate: 'मूल्य अपडेट',
    // Home page specific translations
    ourAgricultureField: 'हमारा कृषि क्षेत्र',
    viewMap: 'नक्शा देखें',
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