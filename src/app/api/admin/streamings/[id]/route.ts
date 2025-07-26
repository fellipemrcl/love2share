import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    
    const { id } = await context.params
    const body = await request.json()
    const { isActive } = body

    console.log('PATCH streaming:', { id, isActive })

    const updatedStreaming = await prisma.streaming.update({
      where: { id },
      data: { isActive }
    })

    console.log('Streaming updated successfully:', updatedStreaming)

    return NextResponse.json(updatedStreaming)
  } catch (error) {
    console.error('Error updating streaming status:', error)
    return NextResponse.json(
      { error: 'Failed to update streaming status' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    
    const { id } = await context.params
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

    console.log('PUT streaming:', { id, ...body })

    const updatedStreaming = await prisma.streaming.update({
      where: { id },
      data: {
        name,
        platform,
        description: description || null,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
        maxUsers: parseInt(maxUsers) || 1,
        maxSimultaneousScreens: parseInt(maxSimultaneousScreens) || 1,
      }
    })

    console.log('Streaming edited successfully:', updatedStreaming)

    return NextResponse.json(updatedStreaming)
  } catch (error) {
    console.error('Error updating streaming data:', error)
    return NextResponse.json(
      { error: 'Failed to update streaming data' },
      { status: 500 }
    )
  }
}
