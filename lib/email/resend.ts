// Resend email client configuration
// Install: npm install resend
// Docs: https://resend.com/docs/send-with-nextjs

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set. Email notifications will be logged to console.')
}

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Default sender email
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AdMarket <noreply@admarket.com>'

// Email sending wrapper with fallback to console.log
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  // If Resend is not configured, log to console
  if (!resend) {
    console.log('📧 Email notification (RESEND_API_KEY not set):', {
      to,
      subject,
      preview: text || html.substring(0, 200),
    })
    return { success: true, id: 'console-log', provider: 'console' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    console.log('✅ Email sent successfully:', { to, subject, id: data.id })
    
    return { success: true, id: data.id, provider: 'resend' }
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    
    // Fallback to console log
    console.log('📧 Email notification (fallback):', {
      to,
      subject,
      preview: text || html.substring(0, 200),
      error: error.message,
    })
    
    return { success: false, error: error.message, provider: 'console' }
  }
}
