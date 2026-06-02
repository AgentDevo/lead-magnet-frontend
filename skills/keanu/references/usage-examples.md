# Keanu — Usage Examples

## Example 1: Build a Mod Marketplace

**Request:**
```
Keanu, design a web platform where players can upload OpenClaw mods using 
Next.js, Shadcn UI, and Supabase. Include user authentication, version 
management, and download tracking.
```

**Expected Output:**
1. System architecture diagram
2. Supabase database schema (see `references/supabase-schemas.md`)
3. Next.js API routes for uploads, searches, downloads
4. Shadcn UI component examples (mod card, upload form, search)
5. Authentication flow with Supabase Auth
6. Real-time subscription setup for download notifications
7. Deployment strategy

---

## Example 2: Debug OpenClaw Rendering Issue

**Request:**
```
Keanu, I'm seeing z-fighting artifacts on overlapping sprites in my 
OpenClaw game. Depth ordering looks correct in the level JSON, but 
rendering is broken. How do I diagnose this?
```

**Expected Output:**
1. Common causes (sprite depth calculation, batch sorting, precision issues)
2. Diagnostic checklist
3. Code fix examples
4. Performance profiling approach
5. Prevention strategies

---

## Example 3: Optimize Next.js Dashboard Performance

**Request:**
```
Keanu, our Mission Control dashboard at localhost:3000 is slow. We're 
showing 13 tabs (Office, Tasks, Projects, etc.) with real-time updates. 
What's the fastest way to improve performance?
```

**Expected Output:**
1. Performance audit approach (bundle size, SSR caching, DB queries)
2. Server Component optimization (move logic server-side)
3. Incremental Static Regeneration (ISR) setup
4. API endpoint caching strategies
5. Real-time subscription performance tuning
6. Code-splitting recommendations

---

## Example 4: Design an OpenClaw Plugin System

**Request:**
```
Keanu, design a plugin system for OpenClaw that allows modders to write 
C++ modules that hook into the engine at runtime. Include loading, 
unloading, and inter-plugin communication.
```

**Expected Output:**
1. Plugin interface definition (see `references/openclaw-architecture.md`)
2. Dynamic loading mechanism (dlopen/dlsym)
3. Plugin versioning strategy
4. Inter-plugin API
5. Sandbox/security considerations
6. Example plugin implementation

---

## Example 5: Create an OpenClaw Asset Converter

**Request:**
```
Keanu, write a Node.js CLI tool that converts common 3D formats 
(FBX, OBJ, glTF) to OpenClaw's native mesh format. Include validation 
and error reporting.
```

**Expected Output:**
1. Architecture (streaming parser, converter, validator)
2. Node.js/C++ FFI setup (if using native libraries)
3. CLI argument parsing and help
4. Error handling and logging
5. Example usage
6. Package.json and build scripts

---

## Example 6: Full-Stack Mod Review System

**Request:**
```
Keanu, extend the mod marketplace with a review system. Users should 
rate mods (1-5 stars) and leave comments. Show average rating on mod 
cards. Send email notifications to authors when reviewed.
```

**Expected Output:**
1. Supabase schema additions (mod_reviews table, RLS policies)
2. Next.js API routes (POST reviews, GET reviews by mod)
3. Email trigger via Edge Function
4. Rating calculation and display in UI
5. Comment moderation strategy

---

## Keanu's Strengths

✅ **Engine Development** — ECS design, performance profiling, asset pipelines  
✅ **Full-Stack Web** — Next.js, Supabase, real-time systems  
✅ **Type-Safe Code** — TypeScript strict mode, C++17+ modern patterns  
✅ **Production Quality** — Error handling, validation, security (RLS)  
✅ **Architecture Design** — Scalable systems, modular design  
✅ **Debugging** — Root cause analysis, profiling, diagnostics  

## When to Call Keanu

- **Engine architecture** questions
- **Full-stack web platform** design
- **Game developer tooling** needs
- **Complex debugging** scenarios
- **Performance optimization** challenges
- **Large system design** decisions
- **Code quality** reviews
- **Security architecture** for games/mods

## When NOT to Call Keanu

- Quick syntax questions (use general knowledge)
- Simple CRUD apps (Keanu is overkill)
- Non-game development work
- Theoretical computer science
- Unrelated to OpenClaw or game dev
