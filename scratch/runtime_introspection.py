import sys
import os

def run_introspection():
    target_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services", "feature-intelligence")
    sys.path.insert(0, target_path)
    
    # Import app
    from app.main import app
    
    print("=== Runtime Introspection for Feature Intelligence ===")
    print(f"app ID (id(app)): {id(app)}")
    print(f"app.title: {app.title}")
    print(f"app.version: {app.version}")
    print(f"app.openapi_url: {app.openapi_url}")
    print(f"app.docs_url: {app.docs_url}")
    print(f"app.redoc_url: {app.redoc_url}")
    
    print("\n=== Registered Routes ===")
    def traverse(routes, prefix=""):
        for r in routes:
            if hasattr(r, "routes"):
                traverse(r.routes, prefix + getattr(r, "path", getattr(r, "prefix", "")))
            elif hasattr(r, "original_router") and hasattr(r, "include_context"):
                traverse(r.original_router.routes, prefix + getattr(r.include_context, "prefix", ""))
            elif hasattr(r, "path"):
                methods = list(r.methods) if hasattr(r, "methods") else ["GET"]
                print(f"Path: {prefix}{r.path:<50} | Methods: {str(methods):<20} | Type: {type(r).__name__}")
            else:
                print(f"Unknown Route Type: {type(r).__name__} -> {r}")

    traverse(app.routes)
        
    print("\n=== OpenAPI Schema Validation ===")
    try:
        schema = app.openapi()
        print(f"app.openapi() generation: SUCCESS (contains {len(schema.get('paths', {}))} paths)")
    except Exception as e:
        print(f"app.openapi() generation: FAILED with error: {e}")

if __name__ == "__main__":
    run_introspection()
