import { NextResponse } from 'next/server'

interface TeamStatusRequest {
  agentId: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  location: string
  status: string
}

interface TeamStatusResponse {
  success: boolean
  teamLeader: {
    id: string
    name: string
    location: string
    status: string
  }
  subAgents: TeamMember[]
  teamSize: number
  efficiency: string
  coResidents: string[]
  timestamp: string
}

// Mock team data
const teamData: Record<string, {
  teamLeader: string
  members: Array<{ id: string; name: string; role: string; location: string }>
}> = {
  '5': {
    teamLeader: 'Agent Zero',
    members: [
      {
        id: '6',
        name: 'Tony',
        role: 'Security Specialist',
        location: '192.168.1.174'
      }
    ]
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId parameter' },
        { status: 400 }
      )
    }

    const team = teamData[agentId]

    if (!team) {
      return NextResponse.json(
        {
          success: true,
          teamLeader: {
            id: agentId,
            name: 'Unknown Agent',
            location: 'Unknown',
            status: 'offline'
          },
          subAgents: [],
          teamSize: 0,
          efficiency: 'N/A',
          coResidents: [],
          timestamp: new Date().toISOString()
        }
      )
    }

    // Build response for team leader
    const response: TeamStatusResponse = {
      success: true,
      teamLeader: {
        id: agentId,
        name: team.teamLeader,
        location: agentId === '5' ? '192.168.1.174' : 'Unknown',
        status: 'active'
      },
      subAgents: team.members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        location: member.location,
        status: 'active'
      })),
      teamSize: team.members.length + 1, // +1 for leader
      efficiency: team.members.length > 0 && team.members[0]?.location === '192.168.1.174' ? '100% (co-resident)' : 'Standard (remote)',
      coResidents: team.members
        .filter(m => m.location === '192.168.1.174')
        .map(m => m.name),
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching team status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team status' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: TeamStatusRequest = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId' },
        { status: 400 }
      )
    }

    const team = teamData[agentId]

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: 'Agent is not a team leader',
          agentId,
          timestamp: new Date().toISOString()
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${team.teamLeader} has ${team.members.length} sub-agent(s) on board`,
      teamLeader: team.teamLeader,
      subAgents: team.members.map(m => m.name).join(', '),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in team status check:', error)
    return NextResponse.json(
      { error: 'Failed to process team status check' },
      { status: 500 }
    )
  }
}
