export async function sendWhatsAppOtp(otp: string, phoneNumber: string) {
    await fetch('https://graph.facebook.com/v20.0/391122604089692/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: 'default_otp',
                language: {
                    code: 'id'
                },
                components: [
                    {
                        type: 'body',
                        parameters: [{
                            type: 'text',
                            text: `${otp}`
                        }]
                    },
                    {
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [{
                            type: 'text',
                            text: `${otp}`
                        }]
                    },
                ],
            },

        }),
    });
}