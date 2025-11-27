import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateVideoInput, PublishVideoInput } from '@/lib/types/creator-videos'

// GET /api/creator/videos/[id] - Get single video
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: video, error } = await supabase
      .from('creator_videos')
      .select('*')
      .eq('id', params.id)
      .eq('creator_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })

  } catch (error: any) {
    console.error('Error in GET /api/creator/videos/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/creator/videos/[id] - Update video
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: UpdateVideoInput = await request.json()

    // Check ownership
    const { data: existingVideo, error: checkError } = await supabase
      .from('creator_videos')
      .select('id')
      .eq('id', params.id)
      .eq('creator_id', user.id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingVideo) {
      return NextResponse.json(
        { error: 'Video not found or access denied' },
        { status: 404 }
      )
    }

    // Update video
    const { data: video, error } = await supabase
      .from('creator_videos')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating video:', error)
      return NextResponse.json(
        { error: 'Failed to update video', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Video updated: ${params.id}`)

    return NextResponse.json({
      success: true,
      video
    })

  } catch (error: any) {
    console.error('Error in PATCH /api/creator/videos/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/creator/videos/[id] - Soft delete video
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const { data: existingVideo, error: checkError } = await supabase
      .from('creator_videos')
      .select('id')
      .eq('id', params.id)
      .eq('creator_id', user.id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingVideo) {
      return NextResponse.json(
        { error: 'Video not found or access denied' },
        { status: 404 }
      )
    }

    // Soft delete (set deleted_at timestamp)
    const { error } = await supabase
      .from('creator_videos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting video:', error)
      return NextResponse.json(
        { error: 'Failed to delete video', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Video deleted: ${params.id}`)

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })

  } catch (error: any) {
    console.error('Error in DELETE /api/creator/videos/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
