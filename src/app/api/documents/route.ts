import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock document repository - in production, use your actual document storage
let documents: any[] = []
let nextId = 1

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return all documents (in production, filter by user permissions)
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, type, category, tags, metadata } = body

    // Create new document
    const newDocument = {
      id: nextId++,
      title,
      content,
      type,
      category: category || 'HR Documents',
      tags: tags || [],
      metadata: metadata || {},
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: 'active'
    }

    // Add to mock document repository
    documents.push(newDocument)

    return NextResponse.json({ 
      success: true, 
      document: newDocument,
      message: 'Document saved to repository successfully'
    })
  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, content, tags, metadata } = body

    // Find and update document
    const documentIndex = documents.findIndex(doc => doc.id === id)
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const existingDocument = documents[documentIndex]
    
    // Update document
    const updatedDocument = {
      ...existingDocument,
      title: title || existingDocument.title,
      content: content || existingDocument.content,
      tags: tags || existingDocument.tags,
      metadata: { ...existingDocument.metadata, ...metadata },
      updatedAt: new Date().toISOString(),
      version: existingDocument.version + 1,
      updatedBy: session.user.email
    }

    documents[documentIndex] = updatedDocument

    return NextResponse.json({ 
      success: true, 
      document: updatedDocument,
      message: 'Document updated successfully'
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Find and soft delete document
    const documentIndex = documents.findIndex(doc => doc.id === parseInt(id))
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Soft delete by updating status
    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedBy: session.user.email
    }

    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
