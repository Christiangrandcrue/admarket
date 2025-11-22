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

// ============================================
// WELCOME EMAILS
// ============================================

interface WelcomeAdvertiserEmailProps {
  userName: string
  userEmail: string
  dashboardUrl: string
}

export function welcomeAdvertiserEmail({
  userName,
  userEmail,
  dashboardUrl,
}: WelcomeAdvertiserEmailProps) {
  const subject = `🎉 Добро пожаловать в AdMarket, ${userName}!`
  
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
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Платформа инфлюенс-маркетинга
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">🎉</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Добро пожаловать, ${userName}!
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Рады видеть вас на AdMarket — платформе, где рекламодатели находят идеальных блогеров для своих кампаний.
              </p>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Вы зарегистрированы как <strong>рекламодатель</strong> с email: <strong>${userEmail}</strong>
              </p>
              
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #166534; font-size: 18px; font-weight: bold;">
                  🚀 Как начать работу:
                </h3>
                <ul style="margin: 0; padding-left: 24px; color: #166534; font-size: 15px; line-height: 1.8;">
                  <li><strong>Создайте кампанию</strong> — опишите ваш продукт, цели и бриф</li>
                  <li><strong>Найдите блогеров</strong> — используйте каталог с фильтрами по охвату и нишам</li>
                  <li><strong>Отправьте заявки</strong> — выберите подходящие каналы</li>
                  <li><strong>Контролируйте процесс</strong> — отслеживайте статусы и проверяйте контент</li>
                  <li><strong>Анализируйте результаты</strong> — получайте детальную аналитику по каждой кампании</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Создать первую кампанию
                </a>
              </div>
              
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0 0 12px; color: #1e3a8a; font-size: 14px; font-weight: bold;">
                  💡 Преимущества AdMarket:
                </p>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  ✓ Проверенные блогеры с реальной статистикой<br>
                  ✓ Защита сделок через эскроу-систему<br>
                  ✓ Прозрачная аналитика по всем кампаниям<br>
                  ✓ Поддержка 5 платформ: TikTok, YouTube, Instagram, Telegram, VK
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Остались вопросы? Свяжитесь с нами:<br>
                <strong>support@admarket.com</strong>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                С уважением, команда AdMarket
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
Добро пожаловать в AdMarket, ${userName}!

Рады видеть вас на AdMarket — платформе, где рекламодатели находят идеальных блогеров для своих кампаний.

Вы зарегистрированы как рекламодатель с email: ${userEmail}

🚀 Как начать работу:

• Создайте кампанию — опишите ваш продукт, цели и бриф
• Найдите блогеров — используйте каталог с фильтрами по охвату и нишам
• Отправьте заявки — выберите подходящие каналы
• Контролируйте процесс — отслеживайте статусы и проверяйте контент
• Анализируйте результаты — получайте детальную аналитику по каждой кампании

Создать первую кампанию: ${dashboardUrl}

💡 Преимущества AdMarket:
✓ Проверенные блогеры с реальной статистикой
✓ Защита сделок через эскроу-систему
✓ Прозрачная аналитика по всем кампаниям
✓ Поддержка 5 платформ: TikTok, YouTube, Instagram, Telegram, VK

Остались вопросы? Свяжитесь с нами: support@admarket.com

С уважением, команда AdMarket
  `.trim()

  return { subject, html, text }
}

interface WelcomeCreatorEmailProps {
  userName: string
  userEmail: string
  dashboardUrl: string
}

export function welcomeCreatorEmail({
  userName,
  userEmail,
  dashboardUrl,
}: WelcomeCreatorEmailProps) {
  const subject = `👋 Добро пожаловать в AdMarket, ${userName}!`
  
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
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Платформа инфлюенс-маркетинга
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">👋</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Добро пожаловать, ${userName}!
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Рады видеть вас на AdMarket — платформе, где блогеры монетизируют свою аудиторию через качественные рекламные интеграции.
              </p>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                Вы зарегистрированы как <strong>блогер/креатор</strong> с email: <strong>${userEmail}</strong>
              </p>
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #92400e; font-size: 18px; font-weight: bold;">
                  🎬 Как начать зарабатывать:
                </h3>
                <ul style="margin: 0; padding-left: 24px; color: #92400e; font-size: 15px; line-height: 1.8;">
                  <li><strong>Добавьте каналы</strong> — подключите свои аккаунты на TikTok, YouTube, Instagram, Telegram или VK</li>
                  <li><strong>Заполните статистику</strong> — укажите охват, вовлечённость и прайс</li>
                  <li><strong>Получайте заявки</strong> — рекламодатели будут находить вас через каталог</li>
                  <li><strong>Создавайте контент</strong> — работайте по брифам и загружайте материалы</li>
                  <li><strong>Получайте вознаграждение</strong> — средства переводятся автоматически после одобрения контента</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Добавить первый канал
                </a>
              </div>
              
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: bold;">
                  💰 Преимущества AdMarket:
                </p>
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  ✓ Прямой доступ к проверенным рекламодателям<br>
                  ✓ Гарантия оплаты через эскроу-систему<br>
                  ✓ Прозрачные условия работы с брифами<br>
                  ✓ Никаких комиссий за получение заявок<br>
                  ✓ Поддержка 5 платформ
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Остались вопросы? Свяжитесь с нами:<br>
                <strong>support@admarket.com</strong>
              </p>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                С уважением, команда AdMarket
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
Добро пожаловать в AdMarket, ${userName}!

Рады видеть вас на AdMarket — платформе, где блогеры монетизируют свою аудиторию через качественные рекламные интеграции.

Вы зарегистрированы как блогер/креатор с email: ${userEmail}

🎬 Как начать зарабатывать:

• Добавьте каналы — подключите свои аккаунты на TikTok, YouTube, Instagram, Telegram или VK
• Заполните статистику — укажите охват, вовлечённость и прайс
• Получайте заявки — рекламодатели будут находить вас через каталог
• Создавайте контент — работайте по брифам и загружайте материалы
• Получайте вознаграждение — средства переводятся автоматически после одобрения контента

Добавить первый канал: ${dashboardUrl}

💰 Преимущества AdMarket:
✓ Прямой доступ к проверенным рекламодателям
✓ Гарантия оплаты через эскроу-систему
✓ Прозрачные условия работы с брифами
✓ Никаких комиссий за получение заявок
✓ Поддержка 5 платформ

Остались вопросы? Свяжитесь с нами: support@admarket.com

С уважением, команда AdMarket
  `.trim()

  return { subject, html, text }
}
