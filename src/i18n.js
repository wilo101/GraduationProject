import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

const LANG_KEY = 'augustus:lang';

// Default UI language: English (LTR). Arabic resources remain available if switched later.
const defaultLng = 'en';
try {
    window.localStorage.setItem(LANG_KEY, defaultLng);
} catch (_) {
    /* ignore */
}

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: { translation: enTranslation },
            ar: { translation: arTranslation },
        },
        lng: defaultLng,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

// Apply document direction automatically when language changes
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    try {
        window.localStorage.setItem(LANG_KEY, lng);
    } catch (_) {
        /* ignore */
    }
});

document.documentElement.dir = 'ltr';
document.documentElement.lang = defaultLng;

export default i18n;
