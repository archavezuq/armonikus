# Genera el bloque HTML/SVG del «Mapa de progresiones» y lo inserta en src/template.html
import re, sys
from pathlib import Path

C = {
    'gray':  dict(fill='#f1f2f4', stroke='#cdd2d9', text='#6a7280', arrow='#6b7380'),
    'pred':  dict(fill='#e9f5ed', stroke='#3f9460', text='#1d3c2a', arrow='#2f8f4f'),
    'dom':   dict(fill='#fdf0da', stroke='#c8892b', text='#5e3a0b', arrow='#8a5a1c'),
    'ton':   dict(fill='#e6eefb', stroke='#2a5db0', text='#1c2430', arrow='#2a5db0'),
}
RED = '#a33a3a'

def diagram(pfx, nodes, arrows, curves, labels, W, H, collabels, caption):
    o = []
    o.append('<svg class="flow" viewBox="0 0 %d %d" role="img" aria-label="%s" xmlns="http://www.w3.org/2000/svg">' % (W, H, caption[0]))
    o.append('<defs>')
    for name, col in [('gray', '#6b7380'), ('green', '#2f8f4f'), ('brown', '#8a5a1c'), ('blue', '#2a5db0'), ('red', RED)]:
        o.append('<marker id="%s-%s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker>' % (pfx, name, col))
    o.append('</defs>')
    # curvas (detrás de los nodos)
    for c in curves:
        o.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#%s-%s)"/>' % (c['d'], c['col'], pfx, c['mk']))
    # flechas
    for a in arrows:
        dash = ' stroke-dasharray="6 5"' if a.get('dash') else ''
        o.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s"%s marker-end="url(#%s-%s)"/>' % (a['x1'], a['y1'], a['x2'], a['y2'], a['col'], a.get('w', 2), dash, pfx, a['mk']))
    # nodos
    for n in nodes:
        k = C[n['k']]
        w, h = n.get('w', 70), 44
        o.append('<rect x="%s" y="%s" width="%s" height="%s" rx="9" fill="%s" stroke="%s" stroke-width="2"/>' % (n['x'] - w / 2, n['y'] - h / 2, w, h, k['fill'], k['stroke']))
        o.append('<text x="%s" y="%s" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-weight="700" font-size="23" fill="%s">%s</text>' % (n['x'], n['y'] + 8, k['text'], n['t']))
    for l in labels:
        o.append('<text x="%s" y="%s" text-anchor="middle" font-size="%s" font-style="italic" fill="%s" paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">%s</text>' % (l['x'], l['y'], l.get('s', 13), l['col'], l['t']))
    for x, y, t in collabels:
        o.append('<text x="%s" y="%s" text-anchor="middle" font-size="13" font-weight="700" fill="#5b6472" letter-spacing=".02em" paint-order="stroke" stroke="#fff" stroke-width="6" stroke-linejoin="round">%s</text>' % (x, y, t))
    o.append('</svg>')
    return '\n'.join(o)

# ---------------- MAYOR ----------------
g, p, d, b = '#6b7380', '#2f8f4f', '#8a5a1c', '#2a5db0'
major_nodes = [
    dict(t='iii', x=70, y=180, k='gray'), dict(t='vi', x=190, y=180, k='gray'),
    dict(t='IV', x=370, y=110, k='pred'), dict(t='ii', x=370, y=250, k='pred'),
    dict(t='V', x=590, y=110, k='dom'), dict(t='vii°', x=590, y=250, k='dom', w=76),
    dict(t='I', x=800, y=180, k='ton'),
]
major_arrows = [
    dict(x1=106, y1=180, x2=152, y2=180, col=g, mk='gray'),
    dict(x1=224, y1=168, x2=334, y2=126, col=g, mk='gray'),
    dict(x1=224, y1=192, x2=334, y2=234, col=g, mk='gray'),
    dict(x1=406, y1=110, x2=552, y2=110, col=p, mk='green'),
    dict(x1=370, y1=134, x2=370, y2=225, col=p, mk='green'),
    dict(x1=406, y1=250, x2=550, y2=250, col=p, mk='green'),
    dict(x1=406, y1=236, x2=558, y2=130, col=g, mk='gray', dash=1, w=1.6),
    dict(x1=590, y1=134, x2=590, y2=225, col=d, mk='brown'),
    dict(x1=626, y1=118, x2=762, y2=165, col=b, mk='blue'),
    dict(x1=630, y1=242, x2=762, y2=196, col=b, mk='blue'),
]
major_curves = [
    dict(d='M 805,157 C 805,18 96,-6 70,156', col='#7b8494', mk='gray'),
    dict(d='M 392,87 C 440,48 740,50 788,157', col=p, mk='green'),
]
major_labels = [
    dict(x=450, y=22, t='el I puede dirigirse a cualquier grado', col='#6b7380'),
    dict(x=590, y=70, t='cadencia plagal: IV → I', col=p, s=12),
]
major = diagram('fm', major_nodes, major_arrows, major_curves, major_labels, 900, 345,
                [(130, 300, 'CÍRCULO DE QUINTAS'), (370, 300, 'PREDOMINANTE'), (590, 300, 'DOMINANTE'), (800, 300, 'TÓNICA')],
                ('Progresiones armónicas en tonalidad mayor',))

# ---------------- MENOR ----------------
minor_nodes = [
    dict(t='VII', x=62, y=180, k='gray', w=66), dict(t='III', x=162, y=180, k='gray', w=66), dict(t='VI', x=262, y=180, k='gray', w=66),
    dict(t='iv', x=440, y=110, k='pred', w=66), dict(t='ii°', x=440, y=250, k='pred', w=66),
    dict(t='V', x=660, y=110, k='dom', w=66), dict(t='vii°', x=660, y=250, k='dom', w=76),
    dict(t='i', x=830, y=180, k='ton', w=66),
]
minor_arrows = [
    dict(x1=96, y1=180, x2=126, y2=180, col=g, mk='gray'),
    dict(x1=196, y1=180, x2=226, y2=180, col=g, mk='gray'),
    dict(x1=294, y1=168, x2=403, y2=126, col=g, mk='gray'),
    dict(x1=294, y1=192, x2=403, y2=234, col=g, mk='gray'),
    dict(x1=474, y1=110, x2=624, y2=110, col=p, mk='green'),
    dict(x1=440, y1=134, x2=440, y2=225, col=p, mk='green'),
    dict(x1=474, y1=250, x2=620, y2=250, col=p, mk='green'),
    dict(x1=474, y1=236, x2=628, y2=130, col=g, mk='gray', dash=1, w=1.6),
    dict(x1=660, y1=134, x2=660, y2=225, col=d, mk='brown'),
    dict(x1=694, y1=118, x2=796, y2=165, col=b, mk='blue'),
    dict(x1=700, y1=242, x2=796, y2=196, col=b, mk='blue'),
]
minor_curves = [
    dict(d='M 662,87 C 662,-14 276,-18 262,156', col=RED, mk='red'),
    dict(d='M 456,87 C 500,52 800,54 826,157', col=p, mk='green'),
    dict(d='M 830,204 C 830,345 90,360 62,205', col='#7b8494', mk='gray'),
]
minor_labels = [
    dict(x=450, y=13, t='cadencia rota: V → VI', col=RED),
    dict(x=650, y=66, t='cadencia plagal: iv → i', col=p, s=12),
    dict(x=450, y=358, t='el i puede dirigirse a cualquier grado', col='#6b7380'),
]
minor = diagram('fn', minor_nodes, minor_arrows, minor_curves, minor_labels, 900, 372,
                [(162, 300, 'CÍRCULO DE QUINTAS'), (440, 300, 'PREDOMINANTE'), (660, 300, 'DOMINANTE'), (830, 300, 'TÓNICA')],
                ('Progresiones armónicas en tonalidad menor',))

html = '''  <details class="panel" id="mapa" open>
    <summary>Mapa de progresiones armónicas</summary>
    <p>Qué grado suele seguir a cuál. Sirve para elegir los acordes de tu ejercicio y comprobar tus progresiones.</p>
    <h4>En tonalidad mayor</h4>
    <div class="flowbox">
%s
      <p class="flowcap">La línea punteada indica un movimiento posible pero menos frecuente.</p>
    </div>
    <h4>En tonalidad menor</h4>
    <p>La lógica es la misma, pero aparecen más opciones porque el sexto y el séptimo grado son variables. El diagrama recoge los grados de uso más frecuente.</p>
    <div class="flowbox">
%s
      <p class="flowcap">La línea punteada indica un movimiento posible pero menos frecuente.</p>
    </div>
  </details>
''' % (major, minor)

t = Path('src/template.html')
s = t.read_text(encoding='utf-8')
s = re.sub(r'  <details class="panel" id="mapa" open>.*?</details>\n', '', s, flags=re.S)
marker = '  <footer id="cite">'
assert marker in s
s = s.replace(marker, html + marker, 1)
t.write_text(s, encoding='utf-8')
print('ok', len(html))
