import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Document interface
interface Document {
  id: number;
  title: string;
  content: string;
  author: string;
  created: string;
  modified: string;
  tags: string[];
  metadata: Record<string, unknown>;
  version: number;
  type: string;
  size: string;
}

// Mock document repository - in production, use your actual document storage
const documents: Document[] = [
  {
    id: 1,
    title: "Annual Report 2024",
    content: "This is the annual report for 2024...",
    author: "admin@sirtis.com",
    created: "2024-01-15T10:00:00Z",
    modified: "2024-01-15T10:00:00Z",
    tags: ["report", "annual", "financial"],
    metadata: { department: "Finance", confidential: true },
    version: 1,
    type: "pdf",
    size: "2.3MB"
  }
]

let nextId = 2

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filter documents based on user permissions
    const userDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      author: doc.author,
      created: doc.created,
      modified: doc.modified,
      tags: doc.tags,
      metadata: doc.metadata,
      version: doc.version,
      type: doc.type,
      size: doc.size
    }))

    return NextResponse.json(userDocuments)
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, tags, metadata } = await request.json()
    
    const newDocument: Document = {
      id: nextId++,
      title,
      content,
      author: session.user.email,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tags: tags || [],
      metadata: metadata || {},
      version: 1,
      type: "document",
      size: "1KB"
    }

    documents.push(newDocument)

    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, content, tags, metadata } = await request.json()
    
    const documentIndex = documents.findIndex(doc => doc.id === id)
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const existingDocument = documents[documentIndex]
    
    const updatedDocument: Document = {
      ...existingDocument,
      title: title || existingDocument.title,
      content: content || existingDocument.content,
      tags: tags || existingDocument.tags,
      metadata: { ...existingDocument.metadata, ...metadata },
      modified: new Date().toISOString(),
      version: existingDocument.version + 1,
    }

    documents[documentIndex] = updatedDocument

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const documentIndex = documents.findIndex(doc => doc.id === parseInt(id))
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const deletedDocument = documents.splice(documentIndex, 1)[0]

    return NextResponse.json({ 
      message: 'Document deleted successfully',
      document: deletedDocument
    })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
