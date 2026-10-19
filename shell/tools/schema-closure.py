import os, re, sys
ROOT = "/Users/lawrencebi/Projects/box3-local-engine/internals/schema"
SEEDS = [l.strip() for l in open("/tmp/schema_direct.txt") if l.strip()]

def resolve(spec, fromfile):
    """resolve a relative or @box/schema/* import to an abs path (no ext)"""
    if spec.startswith("@box/schema/"):
        base = os.path.join(ROOT, spec[len("@box/schema/"):])
    elif spec.startswith("."):
        base = os.path.normpath(os.path.join(os.path.dirname(fromfile), spec))
    else:
        return None
    for cand in (base + ".ts", os.path.join(base, "index.ts")):
        if os.path.isfile(cand):
            return cand
    return None

IMPORT_RE = re.compile(r"""from\s+['"]([^'"]+)['"]""")
seen, queue, external = set(), [], {}
for s in SEEDS:
    p = resolve("@box/schema/" + s, "")
    if p: queue.append(p)
    else: external.setdefault("MISSING:"+s, 0)

while queue:
    f = queue.pop()
    if f in seen: continue
    seen.add(f)
    src = open(f, encoding="utf8", errors="replace").read()
    for spec in IMPORT_RE.findall(src):
        if spec.startswith("@box/schema/") or spec.startswith("."):
            r = resolve(spec, f)
            if r: queue.append(r)
            else: external[spec] = external.get(spec,0)+1
        else:
            external[spec] = external.get(spec,0)+1

print("=== closure size ===")
print("files:", len(seen))
tot = sum(sum(1 for _ in open(f, encoding='utf8', errors='replace')) for f in seen)
print("lines:", tot)
print()
print("=== external deps of the closure ===")
for k,v in sorted(external.items(), key=lambda x:-x[1]):
    print(f"  {v:4d}  {k}")
print()
print("=== files in closure ===")
for f in sorted(seen):
    print("  " + os.path.relpath(f, ROOT))
