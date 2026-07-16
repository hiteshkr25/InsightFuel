import sys
import os

def audit_routes(app_module_path):
    sys.path.insert(0, app_module_path)
    from app.main import app
    
    print(f"\n=== Route Audit for {os.path.basename(app_module_path)} ===")
    
    def traverse(routes, prefix=""):
        for r in routes:
            # Handle standard Sub-routers
            if hasattr(r, "routes"):
                traverse(r.routes, prefix + getattr(r, "path", ""))
            # Handle _IncludedRouter
            elif hasattr(r, "original_router") and hasattr(r, "include_context"):
                traverse(r.original_router.routes, prefix + getattr(r.include_context, "prefix", ""))
            elif hasattr(r, "path"):
                methods = list(r.methods) if hasattr(r, "methods") else ["GET"]
                print(f"Path: {prefix}{r.path:<50} | Methods: {str(methods):<20} | Name: {r.name}")

    traverse(app.routes)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python route_audit.py <app_module_path>")
        sys.exit(1)
    audit_routes(sys.argv[1])
