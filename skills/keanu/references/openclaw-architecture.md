# OpenClaw Engine Architecture

## Core Engine Systems

### Entity-Component System (ECS)

OpenClaw uses an ECS architecture for efficient game object management.

```cpp
// Base component interface
class IComponent {
public:
  virtual ~IComponent() = default;
  virtual void Update(float deltaTime) = 0;
};

// Transform component
class TransformComponent : public IComponent {
private:
  glm::vec3 position, rotation, scale;
public:
  void SetPosition(const glm::vec3& pos) { position = pos; }
  glm::vec3 GetPosition() const { return position; }
  void Update(float deltaTime) override {}
};

// Physics component
class PhysicsComponent : public IComponent {
private:
  glm::vec3 velocity, acceleration;
  float mass;
public:
  void ApplyForce(const glm::vec3& force) {
    acceleration = force / mass;
  }
  void Update(float deltaTime) override {
    velocity += acceleration * deltaTime;
    auto* transform = GetComponent<TransformComponent>();
    transform->SetPosition(transform->GetPosition() + velocity * deltaTime);
  }
};

// Game entity
class Entity {
private:
  std::unordered_map<std::type_index, std::unique_ptr<IComponent>> components;
public:
  template<typename T>
  T* GetComponent() {
    auto it = components.find(std::type_index(typeid(T)));
    return it != components.end() ? static_cast<T*>(it->second.get()) : nullptr;
  }
  
  template<typename T, typename... Args>
  T* AddComponent(Args&&... args) {
    auto component = std::make_unique<T>(std::forward<Args>(args)...);
    auto ptr = component.get();
    components[std::type_index(typeid(T))] = std::move(component);
    return ptr;
  }
};
```

### Rendering Pipeline

```cpp
class RenderPipeline {
private:
  std::vector<Entity*> renderQueue;
  ShaderProgram* currentShader;
public:
  void Submit(Entity* entity) {
    renderQueue.push_back(entity);
  }
  
  void Render() {
    // Sort by depth for correct z-ordering
    std::sort(renderQueue.begin(), renderQueue.end(),
      [](Entity* a, Entity* b) {
        return a->GetComponent<TransformComponent>()->GetPosition().z >
               b->GetComponent<TransformComponent>()->GetPosition().z;
      });
    
    for (auto entity : renderQueue) {
      auto* render = entity->GetComponent<RenderComponent>();
      auto* transform = entity->GetComponent<TransformComponent>();
      
      currentShader->Bind();
      currentShader->SetUniformMat4("model", transform->GetModelMatrix());
      render->GetMesh()->Draw();
    }
    
    renderQueue.clear();
  }
};
```

### Asset Management

```cpp
class AssetManager {
private:
  std::unordered_map<std::string, std::shared_ptr<Texture>> textureCache;
  std::unordered_map<std::string, std::shared_ptr<Mesh>> meshCache;
public:
  std::shared_ptr<Texture> LoadTexture(const std::string& path) {
    if (textureCache.count(path)) {
      return textureCache[path];
    }
    
    auto texture = std::make_shared<Texture>();
    if (texture->Load(path)) {
      textureCache[path] = texture;
      return texture;
    }
    return nullptr;
  }
  
  void UnloadUnused() {
    // Remove assets with only one reference (cache)
    for (auto it = textureCache.begin(); it != textureCache.end();) {
      if (it->second.use_count() == 1) {
        it = textureCache.erase(it);
      } else {
        ++it;
      }
    }
  }
};
```

## Scripting System (Lua Integration)

```cpp
class ScriptComponent : public IComponent {
private:
  lua_State* luaState;
  std::string scriptPath;
public:
  ScriptComponent(const std::string& path) : scriptPath(path) {
    luaState = luaL_newstate();
    luaL_openlibs(luaState);
    
    if (luaL_loadfile(luaState, path.c_str()) != LUA_OK) {
      throw std::runtime_error(lua_tostring(luaState, -1));
    }
    lua_pcall(luaState, 0, 0, 0);
  }
  
  void Update(float deltaTime) override {
    // Call Lua update function
    lua_getglobal(luaState, "update");
    lua_pushnumber(luaState, deltaTime);
    lua_pcall(luaState, 1, 0, 0);
  }
  
  ~ScriptComponent() {
    lua_close(luaState);
  }
};
```

## Event System

```cpp
class EventDispatcher {
private:
  using EventHandler = std::function<void(const Event&)>;
  std::unordered_map<std::type_index, std::vector<EventHandler>> handlers;
public:
  template<typename T>
  void Subscribe(EventHandler handler) {
    handlers[std::type_index(typeid(T))].push_back(handler);
  }
  
  template<typename T>
  void Dispatch(const T& event) {
    auto it = handlers.find(std::type_index(typeid(T)));
    if (it != handlers.end()) {
      for (auto& handler : it->second) {
        handler(event);
      }
    }
  }
};

// Usage
EventDispatcher dispatcher;
dispatcher.Subscribe<CollisionEvent>([](const CollisionEvent& e) {
  std::cout << "Collision between " << e.entityA << " and " << e.entityB << std::endl;
});
```

## Level Format (JSON-based)

```json
{
  "name": "Level 1",
  "version": "1.0",
  "entities": [
    {
      "id": "player",
      "type": "Character",
      "components": {
        "transform": {
          "position": [0, 0, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "physics": {
          "mass": 1.0,
          "velocity": [0, 0, 0]
        },
        "script": {
          "path": "scripts/player_controller.lua"
        }
      }
    },
    {
      "id": "platform1",
      "type": "StaticObject",
      "components": {
        "transform": {
          "position": [5, -2, 0],
          "scale": [10, 1, 1]
        },
        "render": {
          "mesh": "meshes/platform.obj",
          "material": "materials/stone.mat"
        }
      }
    }
  ]
}
```

## Performance Optimization Tips

### Memory

- Use object pooling for frequently-created entities (bullets, particles)
- Lazy-load assets and unload unused ones
- Use move semantics and smart pointers (avoid raw pointers)
- Profile memory with Valgrind or Address Sanitizer

### CPU

- Batch render calls (group by shader/texture)
- Use spatial partitioning for physics queries (octree/quadtree)
- Async load assets on background threads
- Profile with perf or Instruments

### GPU

- Use texture atlases to reduce state changes
- Implement LOD (Level of Detail) for distant objects
- Use instancing for repetitive geometry
- Profile with RenderDoc or NVIDIA NSight

## Modding Infrastructure

OpenClaw supports modding via:

1. **Lua Scripts** — Entities and systems behavior
2. **Custom Assets** — Textures, meshes, audio
3. **JSON Levels** — Level data and entity configuration
4. **Plugin API** — C++ runtime modules

```cpp
// Plugin interface
class IPlugin {
public:
  virtual ~IPlugin() = default;
  virtual const char* GetName() = 0;
  virtual const char* GetVersion() = 0;
  virtual bool Initialize(Engine* engine) = 0;
  virtual void Shutdown() = 0;
};

// Usage
#define OPENCLAW_PLUGIN extern "C"

OPENCLAW_PLUGIN IPlugin* CreatePlugin() {
  return new MyModPlugin();
}

OPENCLAW_PLUGIN void DestroyPlugin(IPlugin* plugin) {
  delete plugin;
}
```
