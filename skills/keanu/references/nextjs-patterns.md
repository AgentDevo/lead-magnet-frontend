# Next.js Patterns & Architecture

## Server Components (Default in App Router)

Server Components run on the server, never ship JavaScript to the client, and have full access to backend resources.

```typescript
// ✅ Good: Server Component with database access
export default async function ModList() {
  const { data: mods } = await supabase.from('mods').select('*')
  
  return (
    <div>
      {mods?.map(mod => (
        <ModCard key={mod.id} mod={mod} />
      ))}
    </div>
  )
}

// ❌ Bad: Trying to use useState in Server Component
export default async function ModList() {
  const [mods, setMods] = useState([])  // ❌ Error
  // ...
}
```

## Client Components ('use client')

Use Client Components only for interactivity (state, event listeners, browser APIs).

```typescript
'use client'

import { useState } from 'react'

export function ModUploader() {
  const [file, setFile] = useState<File | null>(null)
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/mods/upload', { method: 'POST', body: formData })
    const data = await res.json()
    
    console.log('Uploaded:', data)
  }
  
  return (
    <form onSubmit={handleUpload}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Upload</button>
    </form>
  )
}
```

## API Routes (Dynamic Route Handlers)

API routes handle requests without needing a separate backend server.

```typescript
// app/api/mods/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  
  const { data: mods } = await supabase
    .from('mods')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)
  
  return Response.json({ mods })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('mods')
    .insert([body])
    .select()
    .single()
  
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ mod: data })
}
```

## Server Actions

Server Actions let you call async functions directly from forms and components.

```typescript
// app/actions/mods.ts
'use server'

import { supabase } from '@/lib/supabase'

export async function createMod(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  
  const { data, error } = await supabase
    .from('mods')
    .insert([{ name, description }])
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

// app/mods/new/page.tsx
import { createMod } from '@/app/actions/mods'

export default function NewMod() {
  return (
    <form action={createMod}>
      <input name="name" placeholder="Mod name" required />
      <textarea name="description" placeholder="Description" />
      <button type="submit">Create Mod</button>
    </form>
  )
}
```

## Middleware & Request Routing

Protect routes and handle cross-cutting concerns.

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check auth token
  const token = request.cookies.get('auth_token')?.value
  
  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

## Caching & ISR (Incremental Static Regeneration)

Optimize performance with smart caching.

```typescript
// Cache for 1 hour, revalidate in background
export const revalidate = 3600

export default async function ModPage({ params }: { params: { id: string } }) {
  const { data: mod } = await supabase
    .from('mods')
    .select('*')
    .eq('id', params.id)
    .single()
  
  return <ModDetail mod={mod} />
}

// On-demand revalidation
export async function POST(request: Request) {
  const id = await request.json()
  
  revalidatePath(`/mods/${id}`)
  return Response.json({ revalidated: true })
}
```

## Type-Safe Database Queries

Use TypeScript with Supabase types.

```typescript
// types/database.ts
export interface Mod {
  id: string
  name: string
  version: string
  author_id: string
  created_at: string
  updated_at: string
  downloads: number
}

// lib/supabase.ts
import { Database } from '@/types/database'

export const supabase = createClient<Database>(url, key)

// Usage: fully typed
export async function getMod(id: string) {
  const { data } = await supabase
    .from('mods')
    .select('*')
    .eq('id', id)
    .single()
  
  // data is Mod | null, with full autocomplete
  return data
}
```
