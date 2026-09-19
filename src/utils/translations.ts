import { Screen, AppLanguage } from "../types";

export interface ScreenAudioDescription {
  title: string;
  speechText: string;
  summary: string;
}

export const SCREEN_AUDIO_DESCRIPTIONS: Record<
  AppLanguage,
  Record<Screen, ScreenAudioDescription>
> = {
  en: {
    home: {
      title: "Home Screen",
      speechText:
        "You are on the Home screen. At the top right, you can trigger an emergency alert, check documents, or toggle text size. Below are six main cards: Scam and Fraud Checker, Brain and Memory Games, Talk to Companion, Medicine and Reminders, Read This for Me, and Important Documents. Tap any card to begin.",
      summary: "Overview of your daily companion tools and reminders.",
    },
    "scam-checker": {
      title: "Scam & Fraud Checker",
      speechText:
        "You are on the Scam and Fraud Checker screen. You can paste a suspicious message or upload a screenshot. Our system will analyze it and clearly tell you whether it is safe or a scam, with zero confusing words.",
      summary: "Check text messages and letters for safety.",
    },
    games: {
      title: "Brain & Memory Games",
      speechText:
        "You are on Brain and Memory Games. At the top you can choose between Word Unscramble, Memory Card Matching, and Daily Real-World Trivia Quiz with endless interesting questions powered by Gemini AI.",
      summary: "Gentle puzzles and infinite real-world trivia quizzes.",
    },
    companion: {
      title: "Talk to Companion",
      speechText:
        "You are on Talk to Companion. You can type or tap the microphone to speak with a friendly, patient daily companion who answers your questions warmly.",
      summary: "Voice and chat with your daily companion.",
    },
    reminders: {
      title: "Medicine & Reminders",
      speechText:
        "You are on Medicine and Reminders. Here is your daily checklist for morning, afternoon, and evening medicines and hydration.",
      summary: "Daily medication and health checklist.",
    },
    simplify: {
      title: "Read This for Me",
      speechText:
        "You are on Read This for Me. Paste any confusing letter, bill, or hospital notice. We will explain it in three simple points.",
      summary: "Translate complex documents into plain words.",
    },
    documents: {
      title: "Important Documents",
      speechText:
        "You are on Important Documents. Here you can keep your Medicare card, insurance papers, prescriptions, and IDs securely.",
      summary: "Keep insurance and medical cards organized.",
    },
    emergency: {
      title: "Emergency & Helplines",
      speechText:
        "You are on Emergency and Helplines. You can call Police 112, Senior Citizen Helpline 14567, or your primary family contact with one tap.",
      summary: "Direct dial emergency and senior helpline numbers.",
    },
    tasks: {
      title: "Step by Step Digital Guides",
      speechText:
        "You are on Digital Guides. Simple step-by-step instructions for everyday phone apps like WhatsApp, video calling, and taking photos.",
      summary: "Easy phone and app guidance.",
    },
    nearby: {
      title: "Nearby Hospitals & Medicine Stores",
      speechText:
        "You are on Nearby Hospitals and Medicine Stores. Here you can find nearby clinics, emergency hospitals, and pharmacies using Google Maps, see directions, and call them directly.",
      summary: "Search nearby hospitals and pharmacies with Google Maps.",
    },
  },
  hi: {
    home: {
      title: "मुख्य पृष्ठ (होम)",
      speechText:
        "आप मुख्य पृष्ठ पर हैं। ऊपर दाईं ओर इमरजेंसी बटन, दस्तावेज़, भाषा और ऑडियो विवरण मौजूद हैं। नीचे छह मुख्य विकल्प हैं: फ्रॉड और स्कैम चेकर, दिमाग की कसरत और क्विज़, साथी से बातचीत, दवाई के रिमाइंडर, दस्तावेज़ समझना और ज़रूरी कागज़ात। किसी भी कार्ड को दबाकर शुरू करें।",
      summary: "दैनिक साथी टूल्स और दवाइयों की सूची।",
    },
    "scam-checker": {
      title: "स्कैम और फ्रॉड संदेश चेकर",
      speechText:
        "आप स्कैम चेकर पर हैं। कोई भी संदिग्ध एसएमएस या लेटर यहाँ पेस्ट करें या फोटो अपलोड करें। हमारा सिस्टम आपको सरल भाषा में बताएगा कि क्या यह सुरक्षित है या धोखा।",
      summary: "संदिग्ध संदेशों की सुरक्षा जाँच करें।",
    },
    games: {
      title: "दिमागी खेल और दैनिक क्विज़",
      speechText:
        "आप दिमागी खेल और क्विज़ स्क्रीन पर हैं। यहाँ आप शब्दों की पहेली, मेमोरी कार्ड और रोचक वास्तविक दुनिया के दैनिक क्विज़ खेल सकते हैं, जो कभी खत्म नहीं होते।",
      summary: "शब्द पहेली, कार्ड मैच और असीमित रोचक क्विज़।",
    },
    companion: {
      title: "साथी से बातचीत",
      speechText:
        "आप साथी से बातचीत स्क्रीन पर हैं। यहाँ आप बोलकर या लिखकर एक शांत और दयालु साथी से बात कर सकते हैं।",
      summary: "अपने साथी से आवाज या चैट द्वारा बात करें।",
    },
    reminders: {
      title: "दवाई और दैनिक रिमाइंडर",
      speechText:
        "आप दवाई और रिमाइंडर स्क्रीन पर हैं। यहाँ सुबह, दोपहर और शाम की दवाई और पानी पीने की सूची है।",
      summary: "दवाई और स्वास्थ्य से जुड़े आवश्यक रिमाइंडर।",
    },
    simplify: {
      title: "यह मेरे लिए सरल करें",
      speechText:
        "आप दस्तावेज समझने की स्क्रीन पर हैं। कोई भी कठिन पत्र, बिजली का बिल या सरकारी नोटिस यहाँ डालें, हम उसे तीन आसान वाक्यों में समझाएँगे।",
      summary: "कठिन पत्रों को आसान हिंदी में समझें।",
    },
    documents: {
      title: "ज़रूरी दस्तावेज़",
      speechText:
        "आप ज़रूरी दस्तावेज़ स्क्रीन पर हैं। यहाँ आप आयुष्मान कार्ड, इंश्योरेंस, डॉक्टर की पर्ची और पहचान पत्र सुरक्षित रख सकते हैं।",
      summary: "स्वास्थ्य कार्ड और महत्वपूर्ण कागजात सुरक्षित रखें।",
    },
    emergency: {
      title: "आपातकालीन नंबर और हेल्पलाइन",
      speechText:
        "आप आपातकालीन स्क्रीन पर हैं। यहाँ पुलिस 112, सीनियर सिटीजन हेल्पलाइन 14567 और परिवार के संपर्क नंबर तुरंत उपलब्ध हैं।",
      summary: "आपातकालीन सहायता और वरिष्ठ नागरिक हेल्पलाइन।",
    },
    tasks: {
      title: "डिजिटल सहायता मार्गदर्शिका",
      speechText:
        "आप डिजिटल सहायता स्क्रीन पर हैं। व्हाट्सएप पर फोटो भेजने और वीडियो कॉल करने के सरल चरण यहाँ बताए गए हैं।",
      summary: "मोबाइल फोन इस्तेमाल करने की आसान गाइड।",
    },
    nearby: {
      title: "नज़दीकी अस्पताल और दवा की दुकानें",
      speechText:
        "आप नज़दीकी अस्पताल और दवाई की दुकान स्क्रीन पर हैं। यहाँ आप गूगल मैप्स की सहायता से अपने पास के क्लिनिक, इमरजेंसी अस्पताल और मेडिकल स्टोर खोज सकते हैं और सीधे कॉल कर सकते हैं।",
      summary: "गूगल मैप्स से नज़दीकी अस्पताल और मेडिकल स्टोर खोजें।",
    },
  },
  hinglish: {
    home: {
      title: "Home Screen",
      speechText:
        "Aap Home screen par hain. Top right par Emergency button, Documents, aur Audio Description hai. Neeche Scam Checker, Brain Games aur Quiz, Companion Chat, Medicine Reminders aur Documents hain. Kisi bhi card par tap karke shuru karein.",
      summary: "Aapke daily companion tools aur reminders ka overview.",
    },
    "scam-checker": {
      title: "Scam aur Fraud Checker",
      speechText:
        "Aap Scam Checker screen par hain. Koi bhi suspicious WhatsApp ya SMS yahan paste karein ya photo upload karein. Hum aasan shabdon mein batayenge ki ye safe hai ya fraud.",
      summary: "Suspicious messages ko verify karein.",
    },
    games: {
      title: "Brain Games aur Daily Quiz",
      speechText:
        "Aap Brain Games aur Quiz screen par hain. Yahan Word Puzzle, Memory Cards, aur real world ke mazedaar endless quizzes khel sakte hain jo Gemini AI se connected hain.",
      summary: "Puzzles aur infinite real-world trivia quizzes.",
    },
    companion: {
      title: "Companion se Baat Karein",
      speechText:
        "Aap Companion chat screen par hain. Yahan bolkar ya type karke apne pyare companion se baat kar sakte hain.",
      summary: "Apne daily companion ke sath aasan voice aur chat.",
    },
    reminders: {
      title: "Medicine aur Reminders",
      speechText:
        "Aap Medicine aur Reminders screen par hain. Yahan subah, dopahar aur raat ki dawai aur paani ka checklist hai.",
      summary: "Daily medication aur health checklist.",
    },
    simplify: {
      title: "Read This for Me (Aasan Shabdon Mein)",
      speechText:
        "Aap Read This for Me screen par hain. Koi bhi confusing letter ya bill paste karein, hum uske 3 clear points batayenge.",
      summary: "Confusing letters ko aasan Hinglish mein samjhein.",
    },
    documents: {
      title: "Important Documents",
      speechText:
        "Aap Documents screen par hain. Yahan Medicare card, insurance aur prescriptions safe rehte hain.",
      summary: "Insurance aur doctor ke kagaz safe rakhein.",
    },
    emergency: {
      title: "Emergency aur Helplines",
      speechText:
        "Aap Emergency screen par hain. Police 112, Senior Citizen Helpline 14567, aur family emergency numbers ek tap par ready hain.",
      summary: "Emergency numbers aur family contacts.",
    },
    tasks: {
      title: "Step-by-Step Phone Guides",
      speechText:
        "Aap Digital Guides screen par hain. WhatsApp, video call, aur photo bhejne ke easy steps yahan hain.",
      summary: "Phone apps chalane ki easy guides.",
    },
    nearby: {
      title: "Nearby Hospitals aur Medical Stores",
      speechText:
        "Aap Nearby Hospitals aur Medical Stores screen par hain. Yahan Google Maps ki madad se pass ke clinics, emergency hospitals aur medical stores search karke direct call kar sakte hain.",
      summary: "Google Maps se nearby hospitals aur pharmacies search karein.",
    },
  },
};

export const UI_TRANSLATIONS = {
  en: {
    emergency: "Emergency",
    documents: "Documents",
    audioDesc: "Audio Description",
    audioDescOn: "Audio Description ON",
    audioDescOff: "Audio Description OFF",
    readScreenDesc: "Listen to Screen Description",
    language: "Language",
    textSize: "Text Size",
    settings: "Settings",
    signIn: "Sign In",
    myProfile: "My Profile",
    stopVoice: "Stop Voice",
    returnHome: "Return to Home Screen",
    dailyThought: "Today's Friendly Thought",
    readToMe: "Read to Me",
    reading: "Reading...",
    scamCardTitle: "Scam & Fraud Checker",
    scamCardDesc: "Check any suspicious SMS, message, or letter to see if it is safe.",
    gamesCardTitle: "Brain & Memory Games",
    gamesCardDesc: "Gentle word puzzles, soothing card matching, and endless real-world quiz.",
    companionCardTitle: "Talk to My Companion",
    companionCardDesc: "Ask questions or enjoy a friendly, reassuring chat anytime.",
    remindersCardTitle: "Medicine & Reminders",
    remindersCardDesc: "Medicine checklist, daily hydration, and appointment notes.",
    simplifyCardTitle: "Read This for Me",
    simplifyCardDesc: "Confusing letter or bill? We summarize it into 3 clear points.",
    documentsCardTitle: "Important Documents",
    documentsCardDesc: "Keep Medicare cards, insurance papers, prescriptions, and IDs handy.",
    guidesTitle: "Explain Step by Step (Digital Guides)",
    guidesDesc: "WhatsApp, video calls, and everyday phone guides.",
    viewGuides: "View Guides",
    checkMessage: "Check a Message",
    playGames: "Play Games",
    openChat: "Open Chat",
    viewReminders: "View Reminders",
    readSimplify: "Read & Simplify",
    openDocuments: "Open Documents",
  },
  hi: {
    emergency: "इमरजेंसी",
    documents: "दस्तावेज़",
    audioDesc: "ऑडियो विवरण",
    audioDescOn: "ऑडियो विवरण चालू",
    audioDescOff: "ऑडियो विवरण बंद",
    readScreenDesc: "स्क्रीन का विवरण सुनें",
    language: "भाषा",
    textSize: "फॉन्ट आकार",
    settings: "सेटिंग्स",
    signIn: "लॉगिन",
    myProfile: "मेरी प्रोफाइल",
    stopVoice: "आवाज़ रोकें",
    returnHome: "मुख्य पृष्ठ पर लौटें",
    dailyThought: "आज का प्रेरक विचार",
    readToMe: "पढ़कर सुनाएं",
    reading: "पढ़ रहे हैं...",
    scamCardTitle: "स्कैम और फ्रॉड चेकर",
    scamCardDesc: "संदिग्ध एसएमएस या संदेश को तुरंत चेक करें कि क्या यह सुरक्षित है।",
    gamesCardTitle: "दिमागी खेल और क्विज़",
    gamesCardDesc: "शब्द पहेली, मेमोरी कार्ड, और वास्तविक दुनिया के असीमित रोचक क्विज़।",
    companionCardTitle: "साथी से बातचीत",
    companionCardDesc: "कोई भी प्रश्न पूछें या अपने साथी से स्नेहपूर्वक बात करें।",
    remindersCardTitle: "दवाई और रिमाइंडर",
    remindersCardDesc: "दवाइयों की सूची, पानी पीने की याद, और डॉक्टर के अपॉइंटमेंट।",
    simplifyCardTitle: "यह मेरे लिए सरल करें",
    simplifyCardDesc: "कठिन पत्र या बिल? हम इसे 3 आसान बिंदुओं में समझाएंगे।",
    documentsCardTitle: "ज़रूरी दस्तावेज़",
    documentsCardDesc: "स्वास्थ्य कार्ड, इंश्योरेंस और डॉक्टर की पर्चियां हमेशा साथ रखें।",
    guidesTitle: "कदम दर कदम डिजिटल मदद",
    guidesDesc: "व्हाट्सएप, वीडियो कॉल और मोबाइल फोन गाइड।",
    viewGuides: "गाइड देखें",
    checkMessage: "संदेश की जाँच करें",
    playGames: "खेल खेलें",
    openChat: "बातचीत शुरू करें",
    viewReminders: "रिमाइंडर देखें",
    readSimplify: "सरल भाषा में समझें",
    openDocuments: "दस्तावेज़ खोलें",
  },
  hinglish: {
    emergency: "Emergency",
    documents: "Documents",
    audioDesc: "Audio Description",
    audioDescOn: "Audio Description ON",
    audioDescOff: "Audio Description OFF",
    readScreenDesc: "Screen Description Suniye",
    language: "Language",
    textSize: "Text Size",
    settings: "Settings",
    signIn: "Sign In",
    myProfile: "My Profile",
    stopVoice: "Aawaz Rokein",
    returnHome: "Home Screen par wapas jayein",
    dailyThought: "Aaj Ka Pyara Vichar",
    readToMe: "Bolkar Sunayein",
    reading: "Sun rahe hain...",
    scamCardTitle: "Scam & Fraud Checker",
    scamCardDesc: "Koi bhi SMS ya WhatsApp forward check karein ki safe hai ya fraud.",
    gamesCardTitle: "Brain Games & Real Quiz",
    gamesCardDesc: "Word puzzle, memory match aur endless real-world interesting quiz.",
    companionCardTitle: "Companion se Baat Karein",
    companionCardDesc: "Sawaal poochein ya tasalli bhari baat karein kabhi bhi.",
    remindersCardTitle: "Medicine & Reminders",
    remindersCardDesc: "Subah sham ki dawai, hydration aur appointments.",
    simplifyCardTitle: "Read This for Me",
    simplifyCardDesc: "Confusing letter ya bill? 3 aasan points mein samjhein.",
    documentsCardTitle: "Important Documents",
    documentsCardDesc: "Health card, insurance papers aur prescriptions handy rakhein.",
    guidesTitle: "Step-by-Step Phone Guides",
    guidesDesc: "WhatsApp, video calls aur phone use karne ke aasan steps.",
    viewGuides: "Guides Dekhein",
    checkMessage: "Message Check Karein",
    playGames: "Games Khele",
    openChat: "Chat Kholein",
    viewReminders: "Reminders Dekhein",
    readSimplify: "Aasan Shabdon Mein Samjhein",
    openDocuments: "Documents Kholein",
  },
};
