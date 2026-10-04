import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { TEAM_CONTACT } from "@/lib/config";
import { TopBar, SpeakButton } from "@/components/ui-kit";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "आपकी जानकारी की सुरक्षा — Coffee Helpline privacy" },
      { name: "description", content: "Coffee Helpline privacy policy: what we save, why, and how to delete it." },
      { property: "og:title", content: "Coffee Helpline — Privacy policy" },
      { property: "og:description", content: "What we save, why, who sees it and how to delete it." },
    ],
  }),
  component: Privacy,
});

const policy = {
  hi: {
    title: "आपकी जानकारी की सुरक्षा",
    items: [
      ["हम कौन हैं", `${TEAM_CONTACT}. यह छात्रों का बनाया हुआ एक नमूना है।`],
      ["हम क्या रखते हैं", "आपका फ़ोन नंबर, आपके गाँव का इलाका (आपके घर की सही जगह नहीं), आपकी फ़सल, खेत का आकार, और फ़ोन पर बताई गई समस्याएं।"],
      ["क्यों", "यह जानने के लिए कि कौन सा खेत फ़ोन कर रहा है, आपके खेत के पास का हाल का मौसम देखने के लिए, और आपको सलाह देने के लिए।"],
      ["आपकी आवाज़", "फ़ोन पर आपकी बात लिखाई में बदली जाती है। आपकी आवाज़ की रिकॉर्डिंग तुरंत मिटा दी जाती है, जब तक आप फ़ोन पर 1 दबाकर उसे सेवा सुधारने के लिए रखने की इजाज़त न दें।"],
      ["कौन देख सकता है", "सिर्फ़ हेल्पलाइन टीम और खेती अधिकारी, जो आपको वापस फ़ोन कर सकते हैं। आपका फ़ोन नंबर सुरक्षित तरीके से रखा जाता है।"],
      ["दूसरों को क्या दिया जाता है", "मौसम जानने के लिए आपके गाँव का इलाका एक मौसम सेवा को भेजा जाता है। उसे आपका नाम या फ़ोन नंबर नहीं मिलता। इसके अलावा हम कुछ नहीं देते।"],
      ["कितने समय तक", "हम 12 महीने बाद आपकी जानकारी मिटा देते हैं।"],
      ["आपकी मर्ज़ी", "आप इस ऐप में अपनी जानकारी देख, बदल या मिटा सकते हैं, या फ़ोन पर 9 दबाकर सब कुछ मिटा सकते हैं।"],
      ["ध्यान दें", "सलाह एक संभावित जवाब है, पक्का नहीं। अगर हेल्पलाइन को पक्का पता नहीं, तो खेती अधिकारी आपको फ़ोन करेंगे। आख़िरी फ़ैसला आपका है।"],
    ],
  },
  en: {
    title: "Privacy policy",
    items: [
      ["Who we are", `${TEAM_CONTACT}. This is a student prototype.`],
      ["What we save", "Your phone number, the area of your village (not your exact house), your crops, your field size, and the problems you describe when you call."],
      ["Why", "To know which farm is calling, to check the recent weather near your farm, and to give you advice."],
      ["Your voice", "When you call, your words are turned into text. Your voice recording is deleted straight after, unless you press 1 on the call to let us keep it to improve the service."],
      ["Who can see it", "Only the helpline team and the farming officer who may call you back. Your phone number is stored in a protected form."],
      ["Shared with others", "The area of your village is sent to a weather service to get the weather. It does not get your name or phone number. We share nothing else."],
      ["How long", "We delete your details after 12 months."],
      ["Your choices", "You can see, change or delete your details in this app, or press 9 during a call to delete everything."],
      ["Limits", "The advice is a likely answer, not a certain one. If the helpline is not sure, a farming officer will call you. You make the final decision."],
    ],
  },
};

function Privacy() {
  const { lang } = useLang();
  const router = useRouter();
  const p = policy[lang];
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar onBack={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))} />
      <article className="flex flex-col gap-5 px-5 pb-10 pt-4">
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <SpeakButton text={p.items.map(([h, b]) => `${h}. ${b}`).join(" ")} />
        {p.items.map(([h, b]) => (
          <section key={h}>
            <h2 className="text-xl font-bold">{h}</h2>
            <p className="text-lg leading-relaxed">{b}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
