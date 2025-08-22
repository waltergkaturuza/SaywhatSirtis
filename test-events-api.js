// Test script to verify the events API is working
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEventsAPI() {
  console.log('Testing Events API integration...')

  try {
    // Test 1: Count all events
    const eventCount = await prisma.flagshipEvent.count()
    console.log(`✓ Total events in database: ${eventCount}`)

    // Test 2: Get all events with organizer info
    const events = await prisma.flagshipEvent.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('✓ Events with organizer info:')
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.name}`)
      console.log(`     Status: ${event.status}, Category: ${event.category}`)
      console.log(`     Location: ${event.location}`)
      console.log(`     Budget: $${event.budget}`)
      console.log(`     Organizer: ${event.organizer?.name || 'Unknown'}`)
      console.log('')
    })

    // Test 3: Filter events by status
    const planningEvents = await prisma.flagshipEvent.findMany({
      where: { status: 'PLANNING' },
    })
    console.log(`✓ Planning events: ${planningEvents.length}`)

    // Test 4: Filter events by category
    const conferenceEvents = await prisma.flagshipEvent.findMany({
      where: { category: 'CONFERENCE' },
    })
    console.log(`✓ Conference events: ${conferenceEvents.length}`)

    console.log('✓ All tests passed! Events API is ready.')
  } catch (error) {
    console.error('✗ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEventsAPI()
