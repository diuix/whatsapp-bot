import axios from "axios";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const VERIFY_TOKEN = "teste123";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado com sucesso!");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  if (req.method === "POST") {
    const body = req.body;
    if (!body.object) return res.sendStatus(404);

    const clientes = JSON.parse(fs.readFileSync("clientes.json"));

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value.messages || [];
        for (const message of messages) {
          const from = message.from;
          const text = message.text?.body || "";
          const phone_id = change.value.metadata?.phone_number_id;

          const cliente = clientes.find(c => c.phone_number_id === phone_id);
          if (!cliente) continue;

          console.log(`Mensagem recebida de ${from} para ${cliente.nome}: ${text}`);

          for (const vendedor of cliente.vendedores) {
            await axios.post(
              `https://graph.facebook.com/v21.0/${cliente.phone_number_id}/messages`,
              {
                messaging_product: "whatsapp",
                to: vendedor,
                type: "text",
                text: { body: `Mensagem de ${from}: ${text}` }
              },
              {
                headers: { Authorization: `Bearer ${cliente.access_token}` }
              }
            );
            console.log(`Mensagem enviada para ${vendedor}`);
          }
        }
      }
    }

    return res.sendStatus(200);
  }

  res.sendStatus(405);
}
