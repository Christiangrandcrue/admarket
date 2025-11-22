import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content_url, content_description } = body

    // Validate required fields
    if (!content_url || content_url.trim() === '') {
      return NextResponse.json(
        { error: 'Content URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(content_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Get placement to verify ownership
    const { data: placement, error: fetchError } = await supabase
      .from('placements')
      .select(`
        *,
        channel:channels!placements_channel_id_fkey(creator_id),
        campaign:campaigns(
          id,
          title,
          advertiser_id,
          advertiser:users!campaigns_advertiser_id_fkey(email, full_name)
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      )
    }

    // Verify user owns the channel
    const channel = placement.channel as any
    if (channel?.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this channel.' },
        { status: 403 }
      )
    }

    // Check if placement is in accepted status
    if (placement.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Only accepted placements can upload content' },
        { status: 400 }
      )
    }

    // Update placement with content
    const { data: updatedPlacement, error: updateError } = await supabase
      .from('placements')
      .update({
        content_url,
        content_description: content_description || null,
        content_status: 'pending_review',
        content_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Send email notification to advertiser
    const campaign = placement.campaign as any
    const advertiser = campaign?.advertiser as unknown as { email: string; full_name: string } | null

    if (advertiser?.email) {
      try {
        const advertiserName = advertiser.full_name || 'Рекламодатель'
        const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/campaigns/${campaign.id}`

        const emailContent = {
          subject: `📤 Контент загружен: ${placement.channel_title}`,
          html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
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
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #dbeafe; border-radius: 50%; line-height: 80px;">
                  <span style="font-size: 40px;">📤</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Контент загружен!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${advertiserName}!
              </p>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Блогер <strong>${placement.channel_title}</strong> загрузил контент для вашей кампании <strong>"${campaign.title}"</strong>.
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">Детали контента:</h3>
                <div style="margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Канал:</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 600; margin-left: 8px;">${placement.channel_title}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Ссылка на контент:</span>
                  <a href="${content_url}" style="color: #7c3aed; font-size: 14px; font-weight: 600; margin-left: 8px; text-decoration: none;">${content_url}</a>
                </div>
                ${content_description ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 8px;">Описание от блогера:</span>
                  <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.6;">${content_description}</p>
                </div>
                ` : ''}
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>Следующий шаг:</strong> Просмотрите контент и подтвердите его или запросите изменения.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${campaignUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Просмотреть контент
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                С уважением,<br>
                Команда AdMarket
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Это автоматическое уведомление от платформы AdMarket
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
          text: `Контент загружен!\n\nПривет, ${advertiserName}!\n\nБлогер ${placement.channel_title} загрузил контент для вашей кампании "${campaign.title}".\n\nСсылка на контент: ${content_url}\n${content_description ? `\nОписание: ${content_description}\n` : ''}\nПросмотрите контент в вашем личном кабинете: ${campaignUrl}\n\nС уважением,\nКоманда AdMarket`,
        }

        await sendEmail({
          to: advertiser.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })

        console.log(`✅ Content upload email sent to: ${advertiser.email}`)
      } catch (emailError) {
        console.error('❌ Error sending content upload email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      placement: updatedPlacement,
      message: 'Content uploaded successfully. Advertiser has been notified.',
    })
  } catch (error: any) {
    console.error('Error uploading content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload content' },
      { status: 500 }
    )
  }
}
