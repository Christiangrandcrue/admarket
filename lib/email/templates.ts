// Email templates for AdMarket notifications

interface PlacementAcceptedEmailProps {
  advertiserName: string
  channelTitle: string
  campaignTitle: string
  campaignUrl: string
}

export function placementAcceptedEmail({
  advertiserName,
  channelTitle,
  campaignTitle,
  campaignUrl,
}: PlacementAcceptedEmailProps) {
  const subject = `✅ Заявка принята: ${channelTitle}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AdMarket</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">✅</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Заявка принята!
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${advertiserName}!
              </p>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Отличные новости! Блогер <strong>${channelTitle}</strong> принял ваше предложение по кампании <strong>"${campaignTitle}"</strong>.
              </p>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Теперь блогер начнёт работу над контентом согласно вашему брифу. Вы получите уведомление, когда контент будет готов к проверке.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${campaignUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Перейти к кампании
                </a>
              </div>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  <strong>Что дальше?</strong><br>
                  • Блогер создаст контент согласно брифу<br>
                  • Вы получите уведомление для проверки<br>
                  • После одобрения контент будет опубликован<br>
                  • Средства будут переведены блогеру автоматически
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                С уважением,<br>
                <strong>Команда AdMarket</strong>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                Это автоматическое уведомление, отвечать на него не нужно.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Заявка принята!

Привет, ${advertiserName}!

Отличные новости! Блогер ${channelTitle} принял ваше предложение по кампании "${campaignTitle}".

Теперь блогер начнёт работу над контентом согласно вашему брифу. Вы получите уведомление, когда контент будет готов к проверке.

Перейти к кампании: ${campaignUrl}

Что дальше?
• Блогер создаст контент согласно брифу
• Вы получите уведомление для проверки
• После одобрения контент будет опубликован
• Средства будут переведены блогеру автоматически

С уважением,
Команда AdMarket

Это автоматическое уведомление, отвечать на него не нужно.
  `.trim()

  return { subject, html, text }
}

interface PlacementRejectedEmailProps {
  advertiserName: string
  channelTitle: string
  campaignTitle: string
  rejectionReason?: string
  campaignUrl: string
}

export function placementRejectedEmail({
  advertiserName,
  channelTitle,
  campaignTitle,
  rejectionReason,
  campaignUrl,
}: PlacementRejectedEmailProps) {
  const subject = `❌ Заявка отклонена: ${channelTitle}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AdMarket</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">❌</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Заявка отклонена
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${advertiserName}!
              </p>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                К сожалению, блогер <strong>${channelTitle}</strong> отклонил ваше предложение по кампании <strong>"${campaignTitle}"</strong>.
              </p>
              
              ${rejectionReason ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                  <strong>Причина отклонения:</strong><br>
                  ${rejectionReason}
                </p>
              </div>
              ` : ''}
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Не расстраивайтесь! В каталоге есть множество других блогеров, которые могут подойти для вашей кампании.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${campaignUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Выбрать другого блогера
                </a>
              </div>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  <strong>Рекомендации:</strong><br>
                  • Проверьте, подходит ли ваш продукт аудитории блогера<br>
                  • Убедитесь, что бюджет соответствует прайсу канала<br>
                  • Уточните бриф и требования к контенту<br>
                  • Рассмотрите другие каналы из каталога
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                С уважением,<br>
                <strong>Команда AdMarket</strong>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                Это автоматическое уведомление, отвечать на него не нужно.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Заявка отклонена

Привет, ${advertiserName}!

К сожалению, блогер ${channelTitle} отклонил ваше предложение по кампании "${campaignTitle}".

${rejectionReason ? `Причина отклонения: ${rejectionReason}` : ''}

Не расстраивайтесь! В каталоге есть множество других блогеров, которые могут подойти для вашей кампании.

Выбрать другого блогера: ${campaignUrl}

Рекомендации:
• Проверьте, подходит ли ваш продукт аудитории блогера
• Убедитесь, что бюджет соответствует прайсу канала
• Уточните бриф и требования к контенту
• Рассмотрите другие каналы из каталога

С уважением,
Команда AdMarket

Это автоматическое уведомление, отвечать на него не нужно.
  `.trim()

  return { subject, html, text }
}

interface NewPlacementRequestEmailProps {
  creatorName: string
  advertiserName: string
  campaignTitle: string
  budget: number
  requestUrl: string
}

export function newPlacementRequestEmail({
  creatorName,
  advertiserName,
  campaignTitle,
  budget,
  requestUrl,
}: NewPlacementRequestEmailProps) {
  const subject = `🎯 Новая заявка: ${campaignTitle}`
  
  const formattedBudget = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(budget)
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AdMarket</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">🎯</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Новая заявка на размещение!
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${creatorName}!
              </p>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Рекламодатель <strong>${advertiserName}</strong> отправил вам заявку на размещение по кампании <strong>"${campaignTitle}"</strong>.
              </p>
              
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-size: 18px; text-align: center;">
                  <strong>Вознаграждение: ${formattedBudget}</strong>
                </p>
              </div>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Просмотрите детали кампании и примите решение. Не забудьте ознакомиться с брифом и требованиями к контенту.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${requestUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Просмотреть заявку
                </a>
              </div>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  <strong>Важно:</strong><br>
                  • Ознакомьтесь с брифом и требованиями<br>
                  • Убедитесь, что продукт подходит вашей аудитории<br>
                  • Ответьте в течение 48 часов<br>
                  • При отклонении укажите причину
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                С уважением,<br>
                <strong>Команда AdMarket</strong>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                Это автоматическое уведомление, отвечать на него не нужно.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Новая заявка на размещение!

Привет, ${creatorName}!

Рекламодатель ${advertiserName} отправил вам заявку на размещение по кампании "${campaignTitle}".

Вознаграждение: ${formattedBudget}

Просмотрите детали кампании и примите решение. Не забудьте ознакомиться с брифом и требованиями к контенту.

Просмотреть заявку: ${requestUrl}

Важно:
• Ознакомьтесь с брифом и требованиями
• Убедитесь, что продукт подходит вашей аудитории
• Ответьте в течение 48 часов
• При отклонении укажите причину

С уважением,
Команда AdMarket

Это автоматическое уведомление, отвечать на него не нужно.
  `.trim()

  return { subject, html, text }
}
