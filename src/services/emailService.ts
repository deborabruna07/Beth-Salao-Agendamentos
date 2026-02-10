const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL;

export const sendConfirmationEmail = async (
  clientData: { name: string; email: string },
  appointmentData: { serviceName: string; date: string; time: string }
) => {
  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    console.error("Configurações da Brevo ausentes no arquivo .env");
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: "Beth Salão", email: SENDER_EMAIL },
        to: [{ email: clientData.email, name: clientData.name }],
        subject: "Agendamento Confirmado - Beth Salão",
        htmlContent: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #db2777; text-align: center;">Olá, ${clientData.name}!</h1>
            <p style="text-align: center; font-size: 16px;">Seu agendamento foi realizado com sucesso.</p>
            
            <div style="background: #fdf2f8; padding: 20px; border-radius: 10px; border: 1px solid #fbcfe8; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>✂️ Serviço:</strong> ${appointmentData.serviceName}</p>
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${appointmentData.date}</p>
              <p style="margin: 5px 0;"><strong>🕐 Horário:</strong> ${appointmentData.time}</p>
            </div>
            
            <p style="text-align: center; font-weight: bold; color: #db2777;">Aguardamos você no nosso salão!</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              ⚠️ <strong>Aviso importante:</strong> Em caso de cancelamento ou necessidade de reagendamento, por favor, nos avise com pelo menos <strong>2 dias de antecedência</strong>.
            </p>
          </div>
        `
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao conectar com a Brevo:", error);
    return false;
  }
};