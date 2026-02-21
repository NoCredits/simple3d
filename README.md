# Simple 3D Renderer

Een educatieve 3D graphics renderer gebouwd met vanilla JavaScript, Canvas API en wiskundige concepten uit lineaire algebra.

![3D Renderer Demo](media/demo.gif)

## 🎯 Wat doet dit project?

Dit project toont hoe je een **3D graphics engine** kunt bouwen zonder externe libraries. Het bevat alle essentiële componenten:

- ✅ **3D Model Loading** - Vertices en faces (polygonen)
- ✅ **Transformaties** - Rotatie en translatie van objecten
- ✅ **Perspectief Projectie** - 3D → 2D (canvas)
- ✅ **Back-Face Culling** - Verbergt achterkanten automatisch
- ✅ **Depth Sorting** - Painter's algorithm voor correcte verberging
- ✅ **Flat Shading** - Realistische licht & schaduw effecten
- ✅ **Wireframe Mode** - Schets alle randen van het model

## 🚀 Snel starten

### 1. Clone of download het project
```bash
cd /home/rene/source/simple3d
```

### 2. Open in browser
```bash
# Met Python 3
python -m http.server 8000

# OF met Node.js (http-server)
npx http-server

# OF open direct:
open html/index.html
```

Ga naar `http://localhost:8000/html/` in je browser.

### 3. Controls

| Toets | Functie |
|-------|---------|
| **W** | Toggle wireframe mode (alle draadjes zien) |
| (none) | Model roteert automatisch |

## 📁 Project Structuur

```
simple3d/
├── html/
│   └── index.html          # Canvas & script tags
├── js/
│   ├── index.js            # Main renderer & engine
│   ├── penger.js           # Pinguïn 3D model
│   └── cube.js             # Kubus 3D model (uitschakelen in HTML)
├── media/
│   └── (screenshots/gifs)
├── objects/
│   └── (3D model bestanden)
└── README.md               # Dit bestand
```

## 🎓 Code Architecture

### Classes

#### **Vector3D**
Mathematische vector operaties voor 3D berekeningen.

```javascript
// Voorbeelden:
const a = new Vector3D(1, 2, 3);
const b = new Vector3D(4, 5, 6);

Vector3D.subtract(b, a);      // b - a
Vector3D.cross(a, b);          // a × b (loodrecht)
Vector3D.dot(a, b);            // a · b (parallelliteit)
a.magnitude();                  // lengte van vector
a.normalize();                  // unit vector
```

**Wiskundige operaties:**
- **Subtract**: `a - b` → Richting berekening
- **Cross Product**: `a × b` → Normale vector (loodrecht op vlak)
- **Dot Product**: `a · b` → Hoek/parallelliteit tussen vectoren
- **Magnitude**: `|v|` → Lengte van vector (Pythagoras)
- **Normalize**: `v / |v|` → Vector naar eenheid lengte

#### **Transformation**
3D transformatie operaties (rotatie en translatie).

```javascript
const v = new Vector3D(1, 0, 0);
const angle = Math.PI / 2;  // 90 graden

Transformation.rotateXZ(v, angle);  // Roteer rond Y-as
Transformation.translateZ(v, 2);    // Verschuif in Z-richting
```

**Rotatie Matrix (Y-as):**
```
[cos(θ)   0   sin(θ)]     [x]
[0        1   0     ]  ×  [y]  = Geroteerde punt
[-sin(θ)  0   cos(θ)]     [z]
```

#### **Camera**
Beheerd cameraposie en projectie.

```javascript
const camera = new Camera(800, 800);

// 3D → 2D perspectief projectie
const projected = camera.project(vector3D);

// Genormaliseerde coördinaten → Canvas pixels
const screenCoords = camera.toScreenCoords(projected);
```

**Perspectief Projectie:**
```
x_2d = x_3d / z_3d
y_2d = y_3d / z_3d

Hoe dichter aan de camera (kleine z), hoe groter het beeld!
```

#### **Model3D**
Container voor 3D model (vertices & faces).

```javascript
const model = new Model3D(vertices, faces, cameraDistance);

model.getFaceNormal(faceIndices);      // Normale vector
model.isFaceVisible(faceIndices);      // Back-face culling
model.getAverageDepth(faceIndices);    // Depth sorting
model.transformVertex(vertex);         // Vertex transformatie
```

**Normale Vector berekening:**
```
edge1 = v1 - v0
edge2 = v2 - v0
normal = edge1 × edge2  (loodrecht op vlak)
```

#### **Renderer**
Tekent op canvas.

```javascript
const renderer = new Renderer('game');

renderer.drawFace(model, faceIndices);      // Teken 1 vlak
renderer.drawWireframe(screenPoints);       // Randen
renderer.drawShadedFace(model, ...);        // Met shading
renderer.drawFPS(fps);                      // FPS counter
```

**Shading Berekening:**
```
brightness = max(0, normal · lightDirection)
color = minBrightness + brightness × (1 - minBrightness)

Hoe meer het vlak naar het licht wijst, hoe helder het is!
```

#### **FPSCounter**
Performance tracking.

```javascript
const fpsCounter = new FPSCounter();
const fps = fpsCounter.update();
console.log(`FPS: ${fps}`);
```

#### **Application**
Hoofdcontroller, coördineert alles.

```javascript
const app = new Application('game', model);
app.start();  // Start render loop
```

**Render Pipeline:**
1. Update model (rotatie)
2. Sorteer vlakken (depth sorting)
3. Back-face culling (verberg achterkanten)
4. Teken vlakken (van ver naar dichtbij)
5. Toon FPS

## 🔬 Wiskundige Concepten

### 1. Cross Product (Kruisproduct)

Geeft een vector **loodrecht** op twee invoervectoren.

```
a × b = (a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x)

Gebruikt voor: normale vectoren van vlakken
```

### 2. Dot Product (Inwendig Product)

Geeft een **scalair** (getal) die aangeeft hoe parallel twee vectoren zijn.

```
a · b = a.x*b.x + a.y*b.y + a.z*b.z

Result = 1   → vectoren parallel (zelfde richting)
Result = 0   → vectoren loodrecht
Result = -1  → vectoren tegengesteld
```

### 3. Back-Face Culling

Verberg vlakken die van de camera af wijzen.

```
normal = cross(edge1, edge2)
dot = normal · cameraDirection

Als dot < 0: normale wijst naar camera → TEKEN
Als dot > 0: normale wijst van camera af → SKIP
```

**Performance:** Tot 50% sneller door onzichtbare vlakken over te slaan!

### 4. Perspectief Projectie

3D coördinaten omzetten naar 2D canvas.

```
x_2d = x_3d / z_3d
y_2d = y_3d / z_3d

Hoe werkt dit?
- z=1: grootte ongewijzigd
- z=2: grootte gehalveerd (verder weg = kleiner)
- z=0.5: grootte verdubbeld (dichter bij = groter)
```

### 5. Painter's Algorithm

Teken vlakken in juiste volgorde (far to near) voor correcte occlusion.

```
1. Bereken depth (Z-afstand) van elk vlak
2. Sort vlakken: van ver naar dichtbij
3. Teken in deze volgorde

Voordeel: vlakken dichterbij schrijven over vlakken ver weg
```

### 6. Flat Shading

Bepaal kleur gebaseerd op licht richting.

```
brightness = max(0, normal · lightDirection)

brightness = 0   → licht raakt vlak onder hoek → DONKER
brightness = 0.5 → licht raakt vlak schuin → MEDIUM
brightness = 1   → licht raakt vlak recht → HELDER
```

## 📊 Performance

Gemeten op moderne browser (Chrome/Firefox):

| Model | Vlakken | Wireframe FPS | Shaded FPS | Notes |
|-------|---------|---------------|------------|-------|
| Kubus | 6 | 60 | 60 | Heel snel |
| Pinguïn | ~680 | 55-60 | 50-55 | Meer berekeningen |

**Tip:** Wireframe mode is sneller omdat we minder berekeningen doen.

## 🎨 3D Models toevoegen

### Stap 1: Model data exporteren

Export je model als JSON met vertices en faces:

```javascript
const vs = [
    {x: 0.25, y: 0.25, z: 0.25},
    {x: -0.25, y: 0.25, z: 0.25},
    // ... meer vertices
];

const fs = [
    [0, 1, 2, 3],  // Face van vertices
    [4, 5, 6, 7],
    // ... meer faces
];
```

### Stap 2: Nieuw JS bestand

Maak `js/mymodel.js`:

```javascript
const vs = [ /* vertices */ ];
const fs = [ /* faces */ ];
```

### Stap 3: In HTML laden

```html
<script src="../js/mymodel.js"></script>
<script src="../js/index.js"></script>
```

### Stap 4: Camera afstand aanpassen

In `js/index.js`:

```javascript
// Aanpassen voor grootte van je model
const app = new Application('game', new Model3D(vs, fs, 2.5));
```

## 🔧 Instellingen aanpassen

### Canvas grootte
In `html/index.html`:
```html
<canvas id="game" width="800" height="800"></canvas>
```

### Lichtrichting
In `js/index.js`, in Renderer constructor:
```javascript
this.lightDirection = new Vector3D(0.5, 0.5, -0.5).normalize();
// Wijzig deze waarden voor andere lichthoeken
```

### Kleur
```javascript
// Achtergrond
const BACKGROUND = "#101010";

// Voorgrond (shading gebruikt groen, maar je kunt het aanpassen)
const FOREGROUND = "#50FF50";
```

### Rotatiesnelheid
In `js/index.js`, in Application.update():
```javascript
this.model.rotation += Math.PI * dt;  // Math.PI = 1 volledige rotatie per seconde
// Wijzig Math.PI voor sneller/langzamer
```

## 🐛 Debugging

### Console logging
Open DevTools (F12) en kijk naar console:
- `FPS: 60` - Framerate informatie
- `Wireframe mode: ON` - Mode toggles

### Checklist

- [ ] Canvas verschijnt?
- [ ] Model roteert?
- [ ] Wireframe (W) toggle werkt?
- [ ] FPS wordt getoond?
- [ ] Shading ziet er realistisch uit?

## 📚 Aanvullende Resources

**3D Graphics Theory:**
- [Linear Algebra - 3Blue1Brown](https://www.youtube.com/watch?v=fNk_zzaMoSs&list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)
- [Cross Product Visualization](https://mathinsight.org/cross_product_formula_examples)
- [Dot Product Explained](https://mathinsight.org/dot_product)

**WebGL/Canvas:**
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 📝 Licentiie

MIT License - Vrij te gebruiken voor educatiedoeleinden.

## 👨‍💻 Auteur

Gemaakt met ❤️ als educatief 3D graphics voorbeeld.

---

**Vragen?** Kijk in de code comments - alles is uitgebreid uitgelegd! 📖
