import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreatorVideo, CreateVideoInput, VideoFilters } from '@/lib/types/creator-videos'

// GET /api/creator/videos - Get all videos for authenticated user
export async function GET(request: Request) {
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

    // Parse query params for filters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const is_favorite = searchParams.get('is_favorite')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('creator_videos')
      .select('*', { count: 'exact' })
      .eq('creator_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (is_favorite === 'true') {
      query = query.eq('is_favorite', true)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: videos, error, count } = await query

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json(
        { error: 'Failed to fetch videos', details: error.message },
        { status: 500 }
      )
    }

    // Calculate stats
    const { data: statsData } = await supabase
      .from('creator_videos')
      .select('status')
      .eq('creator_id', user.id)
      .is('deleted_at', null)

    const stats = {
      total: statsData?.length || 0,
      generating: statsData?.filter(v => v.status === 'generating').length || 0,
      ready: statsData?.filter(v => v.status === 'ready').length || 0,
      failed: statsData?.filter(v => v.status === 'failed').length || 0,
      published: statsData?.filter(v => v.status === 'published').length || 0,
    }

    return NextResponse.json({
      videos: videos || [],
      count: count || 0,
      stats,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error: any) {
    console.error('Error in GET /api/creator/videos:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/creator/videos - Create new video entry
export async function POST(request: Request) {
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
    const body: CreateVideoInput = await request.json()

    // Validate required fields
    if (!body.title || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, prompt' },
        { status: 400 }
      )
    }

    // Create video entry
    const videoData = {
      creator_id: user.id,
      title: body.title,
      description: body.description || null,
      prompt: body.prompt,
      style: body.style || null,
      duration: body.duration || null,
      task_id: body.task_id || null,
      status: body.status || 'generating',
    }

    const { data: video, error } = await supabase
      .from('creator_videos')
      .insert(videoData)
      .select()
      .single()

    if (error) {
      console.error('Error creating video:', error)
      return NextResponse.json(
        { error: 'Failed to create video', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Video created: ${video.id} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      video
    })

  } catch (error: any) {
    console.error('Error in POST /api/creator/videos:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
