import math, random, sys
exec(open('t_penfuzz.py').read().split("def gen(kind)")[0])
random.seed(11)
def head_pts(kind, cx, cy, k):
    rx=random.uniform(4,8)*k; ry=rx*random.uniform(.55,1.0); tilt=random.uniform(-.6,.4)
    if kind=='hollow':
        style=random.choice(['ell','ell','open','round'])
        if style=='round': ry=rx
        turns=random.uniform(.95,1.25) if style!='open' else .8
        return ell(cx,cy,rx,ry,tilt,turns)
    style=random.choice(['zig','zig','spiral','blob','diag'])
    if style=='zig': return fillh(cx,cy,rx,ry,random.randint(3,8),tilt)
    if style=='diag':
        out=[]
        for i in range(random.randint(4,8)):
            f=-1+2*i/6; a=(cx+f*rx-ry*.6,cy-ry*.9) if i%2==0 else (cx+f*rx+ry*.6,cy+ry*.9)
            out.append(a)
        return out
    if style=='spiral':
        out=[]
        for i in range(40):
            t=i/40; a=3.2*2*math.pi*t; r=1-t*.85
            out.append((cx+rx*r*math.cos(a), cy+ry*r*math.sin(a)))
        return out
    return ell(cx,cy,rx*.9,ry*.9,tilt,2.2)
def flagpts(ex,ey,up,kind):
    sg=1 if up else -1; d=random.uniform(.9,1.6)
    if kind=='hook': return [(ex+i*2*d, ey+sg*(i**1.6)*.65*d) for i in range(7)]
    if kind=='diag': return [(ex+i*2.2*d, ey+sg*i*2.4*d) for i in range(6)]
    if kind=='s': return [(ex+7*d*math.sin(i/6*math.pi*1.2)+i*d, ey+sg*i*2.4*d) for i in range(8)]
    if kind=='horiz': return [(ex+i*2.4*d, ey+sg*(i*.5)) for i in range(7)]
    return [(ex+i*1.2*d, ey+sg*(i*2.6*d)) for i in range(6)]
def gen(kind, mode):
    k=random.uniform(.8,1.6); cx,cy=100,100
    hollow=kind in('w','h'); up=random.random()<.6; L=random.uniform(28,55)
    hp=head_pts(('hollow' if hollow else 'filled'),cx,cy,k)
    hb=(min(x for x,y in hp),max(x for x,y in hp))
    sx=hb[1]-1.5 if up else hb[0]+1.5; ey=cy-L if up else cy+L
    nfl={'e':1,'s':2}.get(kind,0)
    stem=[(sx+random.uniform(-1,1)*.3*i/14, cy+(ey-cy)*i/14) for i in range(15)] if kind!='w' else None
    strokes=[]
    if mode=='sep' or kind=='w':
        strokes.append(J(hp,.8))
        if stem: strokes.append(J(stem,.7))
        for i in range(nfl):
            off=i*random.uniform(5,9)*(1 if up else -1)*-1
            fp=flagpts(sx,ey+off, up, random.choice(['hook','diag','s','horiz','curl']))
            strokes.append(J(fp,.6))
    elif mode=='stemflag':
        strokes.append(J(hp,.8))
        pts=list(stem)
        if nfl>=1: pts+=flagpts(sx,ey,up,random.choice(['hook','diag','s','curl']))[1:]
        strokes.append(J(pts,.7))
        if nfl==2: strokes.append(J(flagpts(sx,ey+(6 if not up else -6)*-1,up,'hook'),.6))
    elif mode=='headstem' and kind!='w':
        full=list(hp)+[ (sx,cy) ]+stem
        pts=full
        strokes.append(J(pts,.7))
        for i in range(nfl):
            off=i*random.uniform(5,9)*(1 if up else -1)*-1
            strokes.append(J(flagpts(sx,ey+off,up,random.choice(['hook','diag','curl'])),.6))
    else:
        strokes.append(J(hp,.8)); 
        if stem: strokes.append(J(stem,.7))
        for i in range(nfl):
            off=i*7*(1 if up else -1)*-1
            strokes.append(J(flagpts(sx,ey+off,up,'hook'),.6))
    return strokes
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto('file:///home/claude/armonikus/dist/Editor_Escritura_4_Voces.html')
    for mode in ['sep','stemflag','headstem']:
        tot=ok=0; conf={}
        for kind in ['w','h','q','e','s']:
            for _ in range(80):
                st=gen(kind,mode)
                r=pg.evaluate("s=>{const r=window.__lm3.recognizePen(s);return r.err?'ERR':r.dur}",st)
                tot+=1; ok+=(r==kind)
                if r!=kind: conf[(kind,r)]=conf.get((kind,r),0)+1
        print(mode, ok,'/',tot, conf)
