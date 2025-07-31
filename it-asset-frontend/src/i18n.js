import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 1. Import ไฟล์คำแปลที่เราสร้างไว้
import translationEN from './locales/en/translation.json';
import translationTH from './locales/th/translation.json';

// 2. สร้าง object 'resources' เพื่อเก็บคำแปลทั้งหมด
const resources = {
  en: {
    translation: translationEN
  },
  th: {
    translation: translationTH
  }
};

i18n
  // 3. เปิดใช้งาน LanguageDetector เพื่อตรวจจับภาษาจากเบราว์เซอร์
  .use(LanguageDetector) 
  // 4. เชื่อมต่อ i18next เข้ากับ React
  .use(initReactI18next) 
  // 5. เริ่มต้นการตั้งค่า
  .init({
    resources,
    fallbackLng: 'en', // ภาษาเริ่มต้นถ้าหาภาษาที่ตั้งค่าไม่เจอ หรือภาษาที่ผู้ใช้ตั้งค่าไว้ไม่มีในระบบ
    interpolation: {
      escapeValue: false // React ป้องกัน XSS ให้เราอยู่แล้ว
    }
  });

export default i18n;
