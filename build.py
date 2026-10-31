"""Genera dist/Editor_Escritura_4_Voces.html (un solo archivo autocontenido).

Requisito: npm install   (descarga VexFlow 4.2.5)
Uso:       python3 build.py
"""
import re
from pathlib import Path

root = Path(__file__).parent
tpl = (root / "src/template.html").read_text(encoding="utf-8")
css = (root / "src/style.css").read_text(encoding="utf-8")
app = (root / "src/app.js").read_text(encoding="utf-8").replace("/*I18N*/", (root / "src/i18n.js").read_text(encoding="utf-8"))
vf = (root / "node_modules/vexflow/build/cjs/vexflow-bravura.js").read_text(encoding="utf-8")
vf = re.sub(r"//# sourceMappingURL=.*", "", vf).replace("</script", "<\\/script")

out = tpl.replace("/*CSS*/", css).replace("/*VEXFLOW*/", vf).replace("/*APP*/", app)
dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "Editor_Escritura_4_Voces.html").write_text(out, encoding="utf-8")
docs = root / "docs"
docs.mkdir(exist_ok=True)
(docs / "index.html").write_text(out, encoding="utf-8")
print("OK:", len(out), "bytes")
