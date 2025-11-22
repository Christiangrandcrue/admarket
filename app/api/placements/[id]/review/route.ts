import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

export async function PATCH(
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
    const { action, review_notes } = body

    // Validate action
    if (!action || !['approve', 'request_revision'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "request_revision".' },
        { status: 400 }
      )
    }

    // Get placement to verify ownership
    const { data: placement, error: fetchError } = await supabase
      .from('placements')
      .select(`
        *,
        channel:channels!placements_channel_id_fkey(
          creator_id,
          creator:users!channels_creator_id_fkey(email, full_name)
        ),
        campaign:campaigns(
          id,
          title,
          advertiser_id
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

    // Verify user owns the campaign
    const campaign = placement.campaign as any
    if (campaign?.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You do not own this campaign.' },
        { status: 403 }
      )
    }

    // Check if content has been uploaded
    if (!placement.content_url || placement.content_status !== 'pending_review') {
      return NextResponse.json(
        { error: 'No content available for review or already reviewed' },
        { status: 400 }
      )
    }

    // Determine new status based on action
    const newStatus = action === 'approve' ? 'approved' : 'revision_requested'
    
    // Update placement
    const { data: updatedPlacement, error: updateError } = await supabase
      .from('placements')
      .update({
        content_status: newStatus,
        content_review_notes: review_notes || null,
        content_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Send email notification to creator
    const channel = placement.channel as any
    const creator = channel?.creator as unknown as { email: string; full_name: string } | null

    if (creator?.email) {
      try {
        const creatorName = creator.full_name || 'Блогер'
        const placementUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/creator/placements/${id}/upload`

        if (action === 'approve') {
          // Send approval email
          const emailContent = {
            subject: `✅ Контент одобрен: ${campaign.title}`,
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
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #dcfce7; border-radius: 50%; line-height: 80px;">
                  <span style="font-size: 40px;">✅</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Контент одобрен!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${creatorName}!
              </p>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Рекламодатель одобрил ваш контент для кампании <strong>"${campaign.title}"</strong>. Поздравляем! 🎉
              </p>
              
              ${review_notes ? `
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">Комментарий от рекламодателя:</h3>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${review_notes}</p>
              </div>
              ` : ''}
              
              <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <strong>Следующий шаг:</strong> Теперь вы можете опубликовать контент на своём канале согласно договорённостям.
                </p>
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
            text: `Контент одобрен!\n\nПривет, ${creatorName}!\n\nРекламодатель одобрил ваш контент для кампании "${campaign.title}". Поздравляем!\n${review_notes ? `\nКомментарий: ${review_notes}\n` : ''}\nТеперь вы можете опубликовать контент на своём канале.\n\nС уважением,\nКоманда AdMarket`,
          }

          await sendEmail({
            to: creator.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          })
        } else {
          // Send revision request email
          const emailContent = {
            subject: `🔄 Требуются изменения: ${campaign.title}`,
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
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #fef3c7; border-radius: 50%; line-height: 80px;">
                  <span style="font-size: 40px;">🔄</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold; text-align: center;">
                Требуются изменения
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Привет, ${creatorName}!
              </p>
              
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Рекламодатель просмотрел ваш контент для кампании <strong>"${campaign.title}"</strong> и запросил некоторые изменения.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #eab308; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #854d0e; font-size: 16px; font-weight: 600;">Комментарий от рекламодателя:</h3>
                <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${review_notes || 'Пожалуйста, внесите коррективы.'}</p>
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>Следующий шаг:</strong> Внесите необходимые изменения и загрузите контент повторно.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${placementUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Загрузить новую версию
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
            text: `Требуются изменения\n\nПривет, ${creatorName}!\n\nРекламодатель просмотрел ваш контент для кампании "${campaign.title}" и запросил изменения.\n\nКомментарий: ${review_notes || 'Пожалуйста, внесите коррективы.'}\n\nВнесите необходимые изменения и загрузите контент повторно: ${placementUrl}\n\nС уважением,\nКоманда AdMarket`,
          }

          await sendEmail({
            to: creator.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          })
        }

        console.log(`✅ Content review email sent to: ${creator.email}`)

        // Create in-app notification
        const { createNotification } = await import('@/lib/notifications/create-notification')
        await createNotification({
          userId: channel.owner_user_id,
          type: action === 'approve' ? 'content_approved' : 'content_revision_requested',
          title: action === 'approve' ? 'Контент одобрен' : 'Требуются изменения',
          message: action === 'approve'
            ? `Рекламодатель одобрил ваш контент для кампании "${campaign.title}". Поздравляем!${review_notes ? ` Комментарий: ${review_notes}` : ''}`
            : `Рекламодатель запросил изменения контента для кампании "${campaign.title}". ${review_notes || 'Пожалуйста, внесите коррективы.'}`,
          campaignId: campaign.id,
          placementId: id,
          actionUrl: placementUrl,
        })

        console.log(`✅ Notification created for creator`)
      } catch (emailError) {
        console.error('❌ Error sending notification:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      placement: updatedPlacement,
      message: action === 'approve' 
        ? 'Content approved successfully. Creator has been notified.' 
        : 'Revision requested. Creator has been notified.',
    })
  } catch (error: any) {
    console.error('Error reviewing content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to review content' },
      { status: 500 }
    )
  }
}
