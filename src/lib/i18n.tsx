import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "hi" | "en";

const hi = {
  appName: "कॉफ़ी हेल्पलाइन",
  english: "English",
  hindi: "हिंदी",
  back: "पीछे",
  next: "आगे",
  listen: "सुनें",
  stepOf: (a: number, b: number) => `कदम ${a} / ${b}`,
  welcome: "फ़ोन करें, अपनी फ़सल की समस्या बताएं, और सलाह यहाँ देखें।",
  start: "शुरू करें",
  yourPrivacy: "आपकी जानकारी की सुरक्षा",
  phoneQ: "आपका फ़ोन नंबर क्या है?",
  phoneHint: "हेल्पलाइन पर इसी नंबर से फ़ोन करें, ताकि हम आपको पहचान सकें।",
  phoneBad: "10 अंक का सही नंबर डालें।",
  delete: "मिटाएं",
  locQ: "आपका खेत कहाँ है?",
  useLoc: "मेरी जगह लें",
  locWait: "जगह ढूंढ रहे हैं…",
  locGot: "जगह मिल गई।",
  locFail: "जगह नहीं मिली। अपने गाँव या शहर का नाम लिखें।",
  village: "गाँव या शहर का नाम",
  cropQ: "आप क्या उगाते हैं?",
  crops: { coffee: "कॉफ़ी", maize: "मक्का", beans: "बीन्स", other: "दूसरा" },
  areaQ: "आपका खेत कितना बड़ा है?",
  acres: "एकड़",
  more: "बढ़ाएं",
  less: "घटाएं",
  consentQ: "आपकी जानकारी",
  summary: [
    "हम आपका फ़ोन नंबर, गाँव का इलाका, फ़सल और खेत का आकार रखते हैं।",
    "हम इसे सिर्फ़ आपकी फ़सल की सलाह देने के लिए इस्तेमाल करते हैं।",
    "हम आपकी जानकारी नहीं बेचते और कोई विज्ञापन नहीं दिखाते।",
    "आप कभी भी सब कुछ मिटा सकते हैं।",
  ],
  agree: "मैं सहमत हूँ",
  fullPolicy: "पूरी जानकारी पढ़ें",
  save: "सेव करें",
  saving: "सेव हो रहा है…",
  savedOffline: "इस फ़ोन पर सेव हो गया। सिग्नल आने पर भेज दिया जाएगा।",
  saveFail: "सेव नहीं हुआ। थोड़ी देर बाद फिर कोशिश करें।",
  doneTitle: "हो गया!",
  callFrom: "जिस नंबर से रजिस्टर किया, उसी से फ़ोन करें।",
  callNow: "अभी फ़ोन करें",
  goHome: "मेरी सलाह देखें",
  homeTitle: "आपकी सलाह",
  noCalls: "अभी कोई कॉल नहीं। हेल्पलाइन पर फ़ोन करें।",
  callHelpline: "हेल्पलाइन पर फ़ोन करें",
  answered: "जवाब मिल गया",
  inReview: "अधिकारी आपको फ़ोन करेंगे",
  refresh: "नया देखें",
  pullHint: "नया देखने के लिए नीचे खींचें",
  loadFail: "नई सलाह नहीं आई। इंटरनेट देखें, पुरानी सलाह नीचे है।",
  offlineNote: "इंटरनेट नहीं है। पुरानी सलाह दिख रही है।",
  pendingNote: "आपकी जानकारी अभी भेजी नहीं गई। सिग्नल आने पर भेज देंगे।",
  weather: "मौसम",
  advice: "सलाह",
  settings: "सेटिंग",
  changeDetails: "अपनी जानकारी बदलें",
  readPolicy: "जानकारी की सुरक्षा पढ़ें",
  deleteData: "मेरी जानकारी मिटाएं",
  confirmDelete: "क्या सच में सब कुछ मिटाना है? यह वापस नहीं आएगा।",
  yesDelete: "हाँ, मिटाएं",
  cancel: "रहने दें",
  deleteFail: "मिटा नहीं पाए। इंटरनेट चालू करके फिर कोशिश करें।",
  updated: "आपकी जानकारी बदल दी गई।",
  close: "बंद करें",
};

type Dict = typeof hi;

const en: Dict = {
  appName: "Coffee Helpline",
  english: "English",
  hindi: "हिंदी",
  back: "Back",
  next: "Next",
  listen: "Listen",
  stepOf: (a, b) => `Step ${a} of ${b}`,
  welcome: "Call us, tell us your crop problem, and see the advice here.",
  start: "Start",
  yourPrivacy: "Your privacy",
  phoneQ: "What is your phone number?",
  phoneHint: "Call the helpline from this number so we know it is you.",
  phoneBad: "Enter a correct 10-digit number.",
  delete: "Delete",
  locQ: "Where is your farm?",
  useLoc: "Use my location",
  locWait: "Finding your place…",
  locGot: "Place found.",
  locFail: "Could not find your place. Type your village or town name.",
  village: "Village or town name",
  cropQ: "What do you grow?",
  crops: { coffee: "Coffee", maize: "Maize", beans: "Beans", other: "Other" },
  areaQ: "How big is your field?",
  acres: "acres",
  more: "More",
  less: "Less",
  consentQ: "Your details",
  summary: [
    "We save your phone number, your village area, your crops and your field size.",
    "We use them only to give you advice about your crop.",
    "We do not sell your details and we show no advertisements.",
    "You can delete everything at any time.",
  ],
  agree: "I agree",
  fullPolicy: "Read the full policy",
  save: "Save",
  saving: "Saving…",
  savedOffline: "Saved on this phone. It will be sent when there is a signal.",
  saveFail: "Could not save. Please try again in a little while.",
  doneTitle: "All done!",
  callFrom: "Call from the number you registered.",
  callNow: "Call now",
  goHome: "See my advice",
  homeTitle: "Your advice",
  noCalls: "No calls yet. Call the helpline.",
  callHelpline: "Call helpline",
  answered: "Answer given",
  inReview: "Officer will call you",
  refresh: "Check for new",
  pullHint: "Pull down to check for new",
  loadFail: "New advice did not load. Check your internet. Old advice is below.",
  offlineNote: "No internet. Showing saved advice.",
  pendingNote: "Your details are not sent yet. We will send them when there is a signal.",
  weather: "Weather",
  advice: "Advice",
  settings: "Settings",
  changeDetails: "Change my details",
  readPolicy: "Read the privacy policy",
  deleteData: "Delete my data",
  confirmDelete: "Really delete everything? This cannot be undone.",
  yesDelete: "Yes, delete",
  cancel: "Cancel",
  deleteFail: "Could not delete. Turn on internet and try again.",
  updated: "Your details were changed.",
  close: "Close",
};

const dicts = { hi, en };
const LangCtx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({
  lang: "hi",
  t: hi,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");
  useEffect(() => {
    if (localStorage.getItem("ch_lang") === "en") setLangState("en");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("ch_lang", l);
    setLangState(l);
  };
  return <LangCtx.Provider value={{ lang, t: dicts[lang], setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
