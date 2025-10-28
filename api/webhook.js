// api/webhook.js
const axios = require("axios"); // Usando require para evitar problemas de ESM

const VERIFY_TOKEN = "teste123"; // Token de verificação do Meta

module.exports = async function handler(req, res) {
  // Verificação do webhook (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado com sucesso!");
      return res.status(200).send(challenge);
    } else {
      console.log("Falha na verificação do webhook");
      return res.status(403).send("Token inválido");
    }
  }

  // Recebendo mensagens do WhatsApp (POST)
  if (req.method === "POST") {
    try {
      const body = req.body;

      if (!body) {
        console.log("Corpo vazio recebido no webhook");
        return res.status(400).send("Bad Request");
      }

      console.log("Mensagem recebida:", JSON.stringify(body, null, 2));

      // Aqui você pode adicionar lógica para responder usando a Cloud API
      // Exemplo:
      // await axios.post("https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages", {
      //   messaging_product: "whatsapp",
      //   to: body.entry[0].changes[0].value.messages[0].from,
      //   text: { body: "Mensagem recebida!" }
      // }, {
      //   headers: {
      //     "Authorization": `Bearer YOUR_ACCESS_TOKEN`,
      //     "Content-Type": "application/json"
      //   }
      // });

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
      console.error("Erro ao processar POST:", err);
      return res.status(500).send("Erro interno");
    }
  }

  // Métodos não suportados
  return res.status(405).send("Método não permitido");
};
