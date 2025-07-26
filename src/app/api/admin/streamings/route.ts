import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const streamings = await prisma.streaming.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(streamings)
  } catch (error) {
    console.error('Error fetching streamings:', error)
    return NextResponse.json(
      { error: 'Access denied or internal error' },
      { status: 403 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { 
      name, 
      platform, 
      description, 
      logoUrl, 
      websiteUrl, 
      monthlyPrice, 
      maxUsers, 
      maxSimultaneousScreens 
    } = body

    console.log('POST streaming:', body)

    const newStreaming = await prisma.streaming.create({
      data: {
        name,
        platform,
        description: description || null,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
        maxUsers: parseInt(maxUsers) || 1,
        maxSimultaneousScreens: parseInt(maxSimultaneousScreens) || 1,
        isActive: true
      }
    })

    console.log('Streaming created successfully:', newStreaming)

    return NextResponse.json(newStreaming)
  } catch (error) {
    console.error('Error creating streaming:', error)
    return NextResponse.json(
      { error: 'Failed to create streaming' },
      { status: 500 }
    )
  }
}
