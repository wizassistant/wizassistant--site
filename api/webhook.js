export default async function handler(req, res) {
  // ✅ Vérification du webhook (GET)
  if (req.method === 'GET') {
    const VERIFY_TOKEN = 'wiz123'; // <-- choisis le token que tu mets aussi dans Meta

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook vérifié par Meta');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('❌ Erreur de vérification du token');
    }
  }

  // ✅ Réception de message (POST)
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

  if (!message) {
    console.log('❌ Aucun message trouvé dans la requête.');
    return res.status(400).json({ success: false, error: 'No message received' });
  }

  console.log('📩 Message reçu sur WhatsApp :', message);

  // ✅ Envoi à Chatbase
  try {
    const chatbaseRes = await fetch('https://www.chatbase.co/api/v1/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1cac0499-66bd-40f7-9f3c-ddf39e2bb250', // ⛔️ Ne jamais exposer ta vraie clé publiquement !
      },
      body: JSON.stringify({
        agentId: 'G27xBX0vckUkWAR_tdr-M',
        message: message,
        chatId: req.body.entry?.[0]?.id || 'whatsapp-user'
      })
    });

    const data = await chatbaseRes.json();
    console.log('✅ Réponse de Chatbase :', data);

    res.status(200).json({ success: true, chatbase: data });
  } catch (error) {
    console.error('❌ Erreur lors de l’appel à Chatbase :', error);
    res.status(500).json({ success: false, error: 'Failed to call Chatbase' });
  }
}
