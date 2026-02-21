// Simple OBJ parser: parses vertices (v) and faces (f) from a string
// Returns { vertices: [{x,y,z}, ...], faces: [[i,i,i], ...] }
function parseOBJ(text) {
    const vertices = [];
    const faces = [];

    const lines = text.split(/\r?\n/);
    for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        if (parts[0] === 'v') {
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
                vertices.push({ x, y, z });
            }
        } else if (parts[0] === 'f') {
            const idxs = parts.slice(1).map(p => {
                const first = p.split('/')[0];
                return parseInt(first, 10) - 1; // OBJ indices are 1-based
            }).filter(n => !Number.isNaN(n));
            // Triangulate: quads and n-gons → fan triangulation
            if (idxs.length >= 3) {
                for (let i = 1; i < idxs.length - 1; i++) {
                    faces.push([idxs[0], idxs[i], idxs[i + 1]]);
                }
            }
        }
    }

    // Clean: keep only vertices used in faces, remap indices
    const usedSet = new Set();
    for (const face of faces) {
        for (const idx of face) {
            usedSet.add(idx);
        }
    }

    const usedIndices = Array.from(usedSet).sort((a, b) => a - b);
    const oldToNew = new Map();
    const cleanVerts = [];
    
    for (let newIdx = 0; newIdx < usedIndices.length; newIdx++) {
        const oldIdx = usedIndices[newIdx];
        oldToNew.set(oldIdx, newIdx);
        cleanVerts.push(vertices[oldIdx]);
    }

    const cleanFaces = faces.map(f => f.map(oldIdx => oldToNew.get(oldIdx)));

    console.log(`OBJ parsed: ${vertices.length} raw vertices → ${cleanVerts.length} used vertices, ${cleanFaces.length} triangles`);
    
    return { vertices: cleanVerts, faces: cleanFaces };
}

// load OBJ from URL using fetch, then parse
async function loadOBJ(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch OBJ: ${res.status} ${res.statusText}`);
    const text = await res.text();
    return parseOBJ(text);
}

// expose globally for older script ordering
window.parseOBJ = parseOBJ;
window.loadOBJ = loadOBJ;
