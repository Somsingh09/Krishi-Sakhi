const fs = require('fs');

let botReply = \    function getBotReply(rawText) {
        const text = rawText.toLowerCase();
        if (/weather|mausam|temperature|rain|मौसम/.test(text)) return 'आप होमपेज पर मौसम अनुभाग में लाइव मौसम देख सकते हैं। क्या मैं आपको वहां ले चलूं?';
        if (/mandi|price|rate|भाव|मंडी/.test(text)) return 'आज के मंडी भाव इस प्रकार हैं — गेहूं ₹2420, चावल ₹2300, मक्का ₹2100, दालें ₹5650, सरसों ₹6000 प्रति क्विंटल।';
        if (/disease|pest|leaf|bimari|बीमारी|रोग/.test(text)) return 'फसल रोग पहचान अनुभाग में प्रभावित पत्ते की एक फोटो अपलोड करें, और मैं आपको बीमारी और बचाव के उपाय बताऊंगी।';
        if (/scheme|yojana|loan|subsidy|योजना/.test(text)) return 'मुख्य सरकारी योजनाएं हैं: पीएम किसान सम्मान निधि, किसान क्रेडिट कार्ड (आसान ऋण), और पीएम फसल बीमा योजना (फसल बीमा)।';
        if (/hi|hello|hey|namaste|नमस्ते|हेलो/.test(text)) return 'नमस्ते! 🙏 मैं कृषि सखी हूँ। मैं मौसम, मंडी भाव, फसल की बीमारियों या सरकारी योजनाओं में आपकी मदद कर सकती हूँ। बताइए, आपको क्या जानकारी चाहिए?';
        if (/thank|धन्यवाद|शुक्रिया/.test(text)) return 'आपकी मदद करके मुझे बहुत खुशी हुई! 🌾 क्या मैं आपकी कुछ और मदद कर सकती हूँ?';
        return 'मैं अभी एक डेमो असिस्टेंट हूँ। कृपया मौसम, मंडी भाव, फसल की बीमारी, या सरकारी योजनाओं के बारे में सवाल पूछें।';
    }\;

let speakText = \    function speakText(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN'; // Explicitly set to Hindi
        window.speechSynthesis.speak(utterance);
    }\;

let recogRepl = \            chatMicBtn.addEventListener('click', () => {
                recognition.lang = 'hi-IN'; // Explicitly set to Hindi
                chatMicBtn.classList.add('recording');
                chatInput.placeholder = 'Listening...';
                recognition.start();
            });\;

let d = fs.readFileSync('dashboard.js', 'latin1');

d = d.replace(/    function getBotReply[\s\S]*?    \}/, botReply);
d = d.replace(/    function speakText[\s\S]*?    \}/, speakText);
d = d.replace(/            chatMicBtn\.addEventListener\('click', \(\) => \{[\s\S]*?            \}\);/, recogRepl);

fs.writeFileSync('dashboard.js', d, 'utf8');
