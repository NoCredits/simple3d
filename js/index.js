/**
 * Vector3D - Helper class voor 3D vector operaties
 * 
 * Een vector in 3D ruimte heeft drie componenten: x, y, z
 * Deze class biedt basale vectoroperaties nodig voor 3D graphics
 */
class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Vector aftrekking: a - b
     * Gebruikt om de richting van b naar a te berekenen
     * Voorbeeld: subtract(pointB, pointA) geeft vector van A naar B
     */
    static subtract(a, b) {
        return new Vector3D(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    /**
     * Cross product (kruisproduct): a × b
     * 
     * Levert een vector loodrecht op beide invoervectoren
     * Gebruikt voor het berekenen van normale vectoren op vlakken
     * 
     * Formule:
     * (a × b).x = a.y * b.z - a.z * b.y
     * (a × b).y = a.z * b.x - a.x * b.z
     * (a × b).z = a.x * b.y - a.y * b.x
     * 
     * Belangrijk: De volgorde bepaalt de richting!
     * cross(b, a) = -cross(a, b)
     */
    static cross(a, b) {
        return new Vector3D(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    /**
     * Dot product (inwendig product): a · b
     * 
     * Levert een scalair (getal) op dat aangeeft hoe parallel twee vectoren zijn:
     * - dot = 0: vectoren staan loodrecht
     * - dot > 0: vectoren wijzen dezelfde richting
     * - dot < 0: vectoren wijzen tegengestelde richtingen
     * 
     * Formule: a · b = a.x*b.x + a.y*b.y + a.z*b.z
     * 
     * Gebruikt voor:
     * - Bepalen of een vlak naar licht wijst (shading)
     * - Back-face culling (bepalen welke vlakken zichtbaar zijn)
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    /**
     * Magnitude (lengte) van vector: |v|
     * 
     * Berekent de afstand van oorsprong (0,0,0) tot het eindpunt van de vector
     * 
     * Formule (Pythagoras): |v| = √(x² + y² + z²)
     * 
     * Gebruikt voor:
     * - Normalisatie (vector omzetten naar eenheid lengte)
     * - Afstandsberekeningen
     */
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    /**
     * Normalisatie: v / |v|
     * 
     * Zet vector om naar eenheid lengte (magnitude = 1)
     * Behoudt richting maar verandert grootte
     * 
     * Formule: v_normalized = v / |v|
     * 
     * Voordeel: Genormaliseerde vectoren zijn gemakkelijker voor berekeningen
     * Voorbeeld: een genormaliseerde normale vector is makkelijker voor shading
     */
    normalize() {
        const mag = this.magnitude();
        return new Vector3D(this.x / mag, this.y / mag, this.z / mag);
    }
}

/**
 * Transformatie - 3D transformaties (rotatie, translatie)
 * 
 * Transformaties zijn operaties die de positie en oriëntatie van objecten veranderen
 * Ze zijn essentieel voor 3D graphics
 */
class Transformation {
    /**
     * Rotatie rond X-Z vlak: Rotation matrix voor XZ
     * 
     * We roteren rond de Y-as (verticale as), wat betekent dat X en Z veranderen
     * Y blijft gelijk, want we draaien "horizontaal"
     * 
     * Rotatie matrix (rond Y-as):
     * [cos(θ)   0   sin(θ)]     [x]
     * [0        1   0     ]  ×  [y]
     * [-sin(θ)  0   cos(θ)]     [z]
     * 
     * Dit levert op:
     * x' = x·cos(θ) - z·sin(θ)
     * y' = y
     * z' = x·sin(θ) + z·cos(θ)
     * 
     * θ (theta) = hoek in radialen
     * cos en sin beschrijven de cirkelvormige beweging
     * 
     * Voorbeeld: als je 90 graden (π/2 radialen) roteert:
     * - cos(π/2) = 0
     * - sin(π/2) = 1
     * - Een punt op X-as gaat naar Z-as
     */
    static rotateXZ(v, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Vector3D(
            v.x * c - v.z * s,  // Nieuwe X-coördinaat
            v.y,                 // Y blijft gelijk (rond Y-as)
            v.x * s + v.z * c    // Nieuwe Z-coördinaat
        );
    }

    /**
     * Translatie (verschuiving) in Z-richting
     * 
     * Voeg een offset toe aan Z-coördinaat
     * Dit wordt gebruikt om het object dichter bij of verder van camera af te zetten
     * 
     * Formule:
     * z' = z + dz
     * 
     * dz = afstand om in Z-richting te verplaatsen
     * Positief getal = verder weg van camera
     * Negatief getal = dichter bij camera
     */
    static translateZ(v, dz) {
        return new Vector3D(v.x, v.y, v.z + dz);
    }
}

/**
 * Camera - Beheer cameraposie en projectie
 * 
 * Dit is het "oog" van de 3D wereld
 * Zorgt voor:
 * 1. Perspectief projectie (3D → 2D)
 * 2. Mapping naar schermcoördinaten
 */
class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.distance = 1; // Z-afstand van camera
    }

    /**
     * Perspectief projectie: 3D → 2D
     * 
     * Ons 3D world moet op 2D canvas weergegeven worden
     * We gebruiken perspectief projectie: dichterbij = groter
     * 
     * Vergelijking voor perspectief projectie:
     * x_screen = x_3d / z_3d
     * y_screen = y_3d / z_3d
     * 
     * Hoe werkt dit?
     * - Een punt op afstand z=1 blijft grotendeels gelijk
     * - Een punt op afstand z=2 wordt gehalveerd (half zo groot)
     * - Een punt op afstand z=0.5 wordt verdubbeld (twee keer zo groot)
     * 
     * Dit geeft het illussie van diepte: dichterbij objecten zijn groter
     * 
     * Na deze stap hebben we coördinaten in range ongeveer [-1, 1]
     */
    project(v) {
        return new Vector3D(
            v.x / v.z,  // Perspectief X
            v.y / v.z,  // Perspectief Y
            v.z         // Z behouden voor depth sorting
        );
    }

    /**
     * Normaliseerde coördinaten → Canvas pixels
     * 
     * Na projectie hebben we coördinaten in range [-1, 1]
     * We moeten deze omzetten naar canvas pixels [0, canvasWidth] en [0, canvasHeight]
     * 
     * Voor X-as:
     * x_screen = (x_norm + 1) / 2 * canvasWidth
     * 
     * Stap voor stap:
     * 1. (x + 1) verschuift van [-1, 1] naar [0, 2]
     * 2. / 2 schaalt naar [0, 1] (0% tot 100%)
     * 3. * canvasWidth schaalt naar [0, canvasWidth]
     * 
     * Voor Y-as:
     * y_screen = (1 - (y + 1) / 2) * canvasHeight
     * 
     * Extra stap: (1 - ...) spiegelt Y-as
     * Reden: in 3D is Y omhoog positief, maar op canvas is Y omlaag positief
     * Dit corrigeert dat verschil
     */
    toScreenCoords(v) {
        return {
            x: (v.x + 1) / 2 * this.canvasWidth,
            y: (1 - (v.y + 1) / 2) * this.canvasHeight
        };
    }
}

/**
 * 3DModel - Container voor vertices en faces
 * 
 * Een 3D model bestaat uit:
 * - Vertices (hoekpunten): punten in 3D ruimte
 * - Faces (vlakken): driehoeken of polygonen gemaakt van vertex indices
 */
class Model3D {
    constructor(vertices, faces, cameraDistance = 1) {
        this.vertices = vertices;
        this.faces = faces;
        this.rotation = 0;
        this.position = new Vector3D(0, 0, cameraDistance);
    }

    /**
     * Bereken de normale vector van een vlak
     * 
     * Een normale vector staat loodrecht op het vlak
     * Dit is cruciaal voor:
     * - Back-face culling (bepalen welke kant van het vlak naar ons wijst)
     * - Shading (bepalen hoeveel licht het vlak ontvangt)
     * 
     * Hoe werkt het:
     * 1. Neem twee randen van het vlak (edge1 en edge2)
     *    edge1 = v1 - v0 (vector van vertex 0 naar 1)
     *    edge2 = v2 - v0 (vector van vertex 0 naar 2)
     * 
     * 2. Cross product: n = edge1 × edge2
     *    Dit levert een vector loodrecht op beide randen op
     *    Dus: loodrecht op het vlak zelf!
     * 
     * 3. De richting hangt af van vertex-volgorde (winding order)
     *    Als vertices linksom gaan (counter-clockwise van buiten): normale wijst naar buiten
     *    Als vertices rechtsom gaan (clockwise van buiten): normale wijst naar binnen
     * 
     * Voorbeeld vlak met vertices [0,1,2,3]:
     *        1 --- 2
     *        |     |
     *        0 --- 3
     * 
     * edge1 = v1 - v0 → horizontaal pijltje naar rechts
     * edge2 = v2 - v0 → diagonale pijltje naar rechtsboven
     * cross(edge1, edge2) → wijst naar buiten (van scherm af)
     */
    getFaceNormal(faceIndices) {
        if (faceIndices.length < 3) return null;

        const v0 = this.vertices[faceIndices[0]];
        const v1 = this.vertices[faceIndices[1]];
        const v2 = this.vertices[faceIndices[2]];

        // Bereken twee randen van het vlak
        const edge1 = Vector3D.subtract(v1, v0);
        const edge2 = Vector3D.subtract(v2, v0);
        
        // Cross product geeft normale vector
        return Vector3D.cross(edge1, edge2);
    }

    /**
     * Back-face culling: bepaal of een vlak zichtbaar is
     * 
     * Alleen vlakken die naar de camera wijzen moeten getekend worden
     * Vlakken die van de camera af wijzen zijn "achterkanten" en onzichtbaar
     * 
     * Hoe bepalen we dit?
     * 1. Bereken de normale vector (wijst naar buiten van vlak)
     * 2. Controleer: wijst normale naar camera of van camera af?
     * 
     * In ons geval:
     * - Camera kijkt in negatieve Z-richting (van +Z naar -Z)
     * - Camera staat op positieve Z (verder weg)
     * - Als rotatedNormal.z < 0: normale wijst naar camera → ZICHTBAAR
     * - Als rotatedNormal.z > 0: normale wijst van camera af → VERBORGEN
     * 
     * Dit gebeurt VEEL sneller dan daadwerkelijk tekenen!
     * We sparen dus enorm renderwerk uit door onzichtbare vlakken over te slaan
     */
    isFaceVisible(faceIndices) {
        const normal = this.getFaceNormal(faceIndices);
        if (!normal) return true;

        // Roteer de normale mee met het model
        const rotatedNormal = Transformation.rotateXZ(normal, this.rotation);

        // Zichtbaar als normale naar camera wijst (negatieve Z)
        return rotatedNormal.z < 0;
    }

    /**
     * Bereken gemiddelde Z-diepte van een vlak (painter's algorithm)
     * 
     * Voor correct depth sorting moeten we weten: hoe ver is dit vlak van camera af?
     * 
     * We gebruiken het gemiddelde van alle Z-coördinaten:
     * depth = (z0 + z1 + z2 + ...) / aantal_vertices
     * 
     * Dit is niet 100% wiskundig correct (een beter manier zou centroid zijn),
     * maar het werkt goed genoeg voor de meeste modellen
     * 
     * Painter's algorithm:
     * 1. Bereken depth voor elk vlak
     * 2. Sort op depth (van ver naar dichtbij)
     * 3. Teken in deze volgorde
     * 
     * Resultaat: vlakken die dichterbij zijn worden OVER vlakken die verder weg zijn getekend
     * Dit geeft correct occlusion (verberging) zonder Z-buffer nodig te hebben
     * 
     * Voordeel: simpel en snel voor eenvoudige modellen
     * Nadeel: werkt niet goed met overlappende vlakken die elkaar kruisen
     */
    getAverageDepth(faceIndices) {
        let sumZ = 0;
        for (const idx of faceIndices) {
            const v = this.vertices[idx];
            // Transformeer vertex: eerst roteren, dan translatie
            const rotated = Transformation.rotateXZ(v, this.rotation);
            const translated = Transformation.translateZ(rotated, this.position.z);
            sumZ += translated.z;
        }
        return sumZ / faceIndices.length;
    }

    /**
     * Transformeer een vertex voor rendering
     * 
     * Transformatie-volgorde is belangrijk!
     * We doen altijd: Rotatie DAARNA Translatie
     * 
     * Waarom deze volgorde?
     * - Rotatie rond het object's eigen middelpunt (0,0,0)
     * - Daarna verplaatsen we het gehele object
     * 
     * Omgekeerde volgorde zou fout zijn:
     * - Eerst translatie: object verschuift van oorsprong
     * - Dan rotatie: object draait rond de oorsprong (niet rond zichzelf!)
     */
    transformVertex(v) {
        const rotated = Transformation.rotateXZ(v, this.rotation);
        return Transformation.translateZ(rotated, this.position.z);
    }
}

/**
 * Renderer - Verzorgt het tekenen op canvas
 */
class Renderer {
    constructor(canvasId, colors = { background: "#101010", foreground: "#50FF50" }) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.colors = colors;
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.wireframeMode = false;
        this.lightDirection = new Vector3D(0.5, 0.5, -0.5).normalize();
    }

    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Teken een vlak met shading en wireframe support
     */
    drawFace(model, faceIndices) {
        const screenPoints = faceIndices.map(idx => {
            const transformed = model.transformVertex(model.vertices[idx]);
            const projected = this.camera.project(transformed);
            return this.camera.toScreenCoords(projected);
        });

        if (this.wireframeMode) {
            this.drawWireframe(screenPoints);
        } else {
            this.drawShadedFace(model, faceIndices, screenPoints);
        }
    }

    /**
     * Teken wireframe (alleen randen)
     */
    drawWireframe(screenPoints) {
        this.ctx.strokeStyle = this.colors.foreground;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
            this.ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * Teken vlak met Flat shading (Gouraud shading)
     * 
     * Shading bepaalt hoe licht en donker een vlak is
     * Dit geeft het 3D effect en realisme
     * 
     * We gebruiken FLAT shading: heel vlak heeft één kleur
     * 
     * Hoe werkt shading:
     * 1. Bereken de normale vector van het vlak (wijst naar buiten)
     * 2. Bereken dot product tussen normale en lichtrichting
     * 3. Dit geeft "brightness" tussen -1 en 1:
     *    - dot = 1: vlak wijst recht naar licht → HELDER
     *    - dot = 0: vlak staat loodrecht op licht → GRIJS
     *    - dot = -1: vlak wijst weg van licht → DONKER
     * 
     * 4. Math.max(0, ...) zorgt dat negatieve waarden 0 worden
     *    (we willen geen "negatief licht")
     * 
     * 5. Zet brightness om naar RGB-kleur
     * 
     * In ons geval: groene kleuren met variabele helderheid
     * - Minimale helderheid: 0.3 (30% groen = donkergroen)
     * - Maximale helderheid: 1.0 (100% groen = helder groen)
     * 
     * Formule voor kleur:
     * finalBrightness = minBrightness + brightness * (1 - minBrightness)
     * finalBrightness = 0.3 + brightness * 0.7
     * 
     * Dit geeft:
     * - Als brightness = 0: finalBrightness = 0.3 (donker)
     * - Als brightness = 0.5: finalBrightness = 0.65 (medium)
     * - Als brightness = 1.0: finalBrightness = 1.0 (helder)
     */
    drawShadedFace(model, faceIndices, screenPoints) {
        const normal = model.getFaceNormal(faceIndices);
        const rotatedNormal = Transformation.rotateXZ(normal, model.rotation);
        const normalizedNormal = rotatedNormal.normalize();

        // Bereken brightness: dot product tussen normale en lichtrichting
        // Math.max(0, ...) zorgt dat we geen "negatief" licht krijgen
        const brightness = Math.max(0, Vector3D.dot(normalizedNormal, this.lightDirection));

        // Zet brightness (0-1) om naar groentint (RGB)
        const minBrightness = 0.3;
        const finalBrightness = minBrightness + brightness * (1 - minBrightness);
        const colorValue = Math.floor(255 * finalBrightness);

        this.ctx.fillStyle = `rgb(0, ${colorValue}, 0)`;
        this.ctx.strokeStyle = `rgb(0, ${colorValue * 0.7}, 0)`;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
            this.ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    /**
     * Toon FPS op canvas
     */
    drawFPS(fps) {
        this.ctx.fillStyle = this.colors.foreground;
        this.ctx.font = "16px Arial";
        this.ctx.fillText(`FPS: ${fps}`, 10, 20);
    }
}

/**
 * FPSCounter - Track framerate
 */
class FPSCounter {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.currentFPS = 0;
    }

    update() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastTime;

        if (elapsed >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            console.log(`FPS: ${this.currentFPS}`);
        }

        return this.currentFPS;
    }
}

/**
 * Application - Hoofdklasse die alles coördineert
 */
class Application {
    constructor(canvasId, model) {
        this.model = model;
        this.renderer = new Renderer(canvasId);
        this.fpsCounter = new FPSCounter();
        this.targetFPS = 60;
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'w') {
                this.renderer.wireframeMode = !this.renderer.wireframeMode;
                console.log('Wireframe mode:', this.renderer.wireframeMode ? 'ON' : 'OFF');
            }
        });
    }

    /**
     * Render een frame
     */
    render() {
        this.renderer.clear();

        // Sorteer vlakken op diepte (painter's algorithm)
        const facesWithDepth = this.model.faces.map((face, idx) => ({
            face,
            depth: this.model.getAverageDepth(face)
        }));

        facesWithDepth.sort((a, b) => b.depth - a.depth);

        // Teken vlakken van ver naar dichtbij
        for (const { face } of facesWithDepth) {
            // Back-face culling (niet in wireframe mode)
            if (!this.renderer.wireframeMode && !this.model.isFaceVisible(face)) {
                continue;
            }

            this.renderer.drawFace(this.model, face);
        }

        // Update en toon FPS
        const fps = this.fpsCounter.update();
        this.renderer.drawFPS(fps);
    }

    /**
     * Update model staat
     */
    update(dt) {
        this.model.rotation += Math.PI * dt;
    }

    /**
     * Main loop
     */
    start() {
        const frameTime = 1000 / this.targetFPS;
        const dt = 0.5 / this.targetFPS;

        const loop = () => {
            this.update(dt);
            this.render();
            setTimeout(loop, frameTime);
        };

        loop();
    }
}

// Initialize met penger model - camera afstand aanpassen voor grotere weergave
const app = new Application('game', new Model3D(vs, fs, 2.5));
app.start();