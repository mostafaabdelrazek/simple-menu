/**
 * Minimal QR Code encoder.
 *
 * Byte mode, error correction level M, versions 1-10. That covers every URL this
 * app generates while keeping the implementation small enough to ship without an
 * extra dependency.
 */

/** Galois field tables for the 0x11d primitive polynomial. */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
    let value = 1;

    for (let i = 0; i < 255; i++) {
        EXP[i] = value;
        LOG[value] = i;
        value <<= 1;

        if (value & 0x100) {
            value ^= 0x11d;
        }
    }

    for (let i = 255; i < 512; i++) {
        EXP[i] = EXP[i - 255];
    }
})();

function multiply(a, b) {
    if (a === 0 || b === 0) {
        return 0;
    }

    return EXP[LOG[a] + LOG[b]];
}

function generatorPolynomial(degree) {
    let poly = [1];

    for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);

        for (let j = 0; j < poly.length; j++) {
            next[j] ^= multiply(poly[j], EXP[i]);
            next[j + 1] ^= poly[j];
        }

        poly = next;
    }

    // Highest degree term first, so generator[0] is always the leading 1.
    return poly.reverse();
}

function errorCorrection(data, ecCount) {
    const generator = generatorPolynomial(ecCount);
    const result = new Array(ecCount).fill(0);

    for (const byte of data) {
        const factor = byte ^ result[0];

        result.shift();
        result.push(0);

        for (let i = 0; i < ecCount; i++) {
            result[i] ^= multiply(generator[i + 1], factor);
        }
    }

    return result;
}

/**
 * Version 1-10 block structure for error correction level M.
 * [total codewords, ec codewords per block, [blocks, data codewords] groups]
 */
const VERSIONS = {
    1: [26, 10, [[1, 16]]],
    2: [44, 16, [[1, 28]]],
    3: [70, 26, [[1, 44]]],
    4: [100, 18, [[2, 32]]],
    5: [134, 24, [[2, 43]]],
    6: [172, 16, [[4, 27]]],
    7: [196, 18, [[4, 31]]],
    8: [242, 22, [[2, 38], [2, 39]]],
    9: [292, 22, [[3, 36], [2, 37]]],
    10: [346, 26, [[4, 43], [1, 44]]],
};

/** Row/column centres of the alignment patterns, per version. */
const ALIGNMENT = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
};

function dataCodewordCount(version) {
    const [, , groups] = VERSIONS[version];

    return groups.reduce((total, [blocks, data]) => total + blocks * data, 0);
}

function pickVersion(byteLength) {
    for (let version = 1; version <= 10; version++) {
        const lengthBits = version < 10 ? 8 : 16;
        const needed = Math.ceil((4 + lengthBits + byteLength * 8) / 8);

        if (needed <= dataCodewordCount(version)) {
            return version;
        }
    }

    return null;
}

function buildCodewords(bytes, version) {
    const [, ecCount, groups] = VERSIONS[version];
    const bits = [];

    const push = (value, length) => {
        for (let i = length - 1; i >= 0; i--) {
            bits.push((value >>> i) & 1);
        }
    };

    push(0b0100, 4);
    push(bytes.length, version < 10 ? 8 : 16);

    for (const byte of bytes) {
        push(byte, 8);
    }

    const capacity = dataCodewordCount(version) * 8;
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - (bits.length % 8)) % 8);

    const data = [];

    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;

        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i + j];
        }

        data.push(byte);
    }

    const padding = [0b11101100, 0b00010001];
    let pad = 0;

    while (data.length < dataCodewordCount(version)) {
        data.push(padding[pad % 2]);
        pad++;
    }

    const blocks = [];
    const ecBlocks = [];
    let offset = 0;

    for (const [blockCount, blockSize] of groups) {
        for (let i = 0; i < blockCount; i++) {
            const block = data.slice(offset, offset + blockSize);

            offset += blockSize;
            blocks.push(block);
            ecBlocks.push(errorCorrection(block, ecCount));
        }
    }

    const result = [];
    const maxData = Math.max(...blocks.map((block) => block.length));

    for (let i = 0; i < maxData; i++) {
        for (const block of blocks) {
            if (i < block.length) {
                result.push(block[i]);
            }
        }
    }

    for (let i = 0; i < ecCount; i++) {
        for (const block of ecBlocks) {
            result.push(block[i]);
        }
    }

    return result;
}

function createGrid(version) {
    return Array.from({ length: version * 4 + 17 }, () => new Array(version * 4 + 17).fill(null));
}

/** Function patterns must never be masked, so they are tracked separately. */
function createReserved(size) {
    return Array.from({ length: size }, () => new Array(size).fill(false));
}

function reserve(reserved, row, col) {
    reserved[row][col] = true;
}

function placeFinder(grid, reserved, row, col) {
    for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
            const inside = row + r >= 0 && row + r < grid.length && col + c >= 0 && col + c < grid.length;

            if (!inside) {
                continue;
            }

            const distance = Math.max(Math.abs(r - 3), Math.abs(c - 3));

            grid[row + r][col + c] = distance !== 2 && distance <= 3;
            reserve(reserved, row + r, col + c);
        }
    }
}

function placeFunctionPatterns(grid, reserved, version) {
    const size = grid.length;

    placeFinder(grid, reserved, 0, 0);
    placeFinder(grid, reserved, 0, size - 7);
    placeFinder(grid, reserved, size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
        grid[6][i] = i % 2 === 0;
        grid[i][6] = i % 2 === 0;
        reserve(reserved, 6, i);
        reserve(reserved, i, 6);
    }

    const centres = ALIGNMENT[version];

    for (const row of centres) {
        for (const col of centres) {
            const isFinderCorner =
                (row <= 8 && col <= 8) || (row <= 8 && col >= size - 9) || (row >= size - 9 && col <= 8);

            if (isFinderCorner) {
                continue;
            }

            for (let r = -2; r <= 2; r++) {
                for (let c = -2; c <= 2; c++) {
                    grid[row + r][col + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
                    reserve(reserved, row + r, col + c);
                }
            }
        }
    }

    grid[size - 8][8] = true;
    reserve(reserved, size - 8, 8);

    if (version >= 7) {
        let remaining = version;

        for (let i = 0; i < 12; i++) {
            remaining = (remaining << 1) ^ ((remaining >>> 11) * 0x1f25);
        }

        const bits = (version << 12) | remaining;

        for (let i = 0; i < 18; i++) {
            const bit = ((bits >>> i) & 1) === 1;
            const row = Math.floor(i / 3);
            const col = size - 11 + (i % 3);

            grid[row][col] = bit;
            grid[col][row] = bit;
            reserve(reserved, row, col);
            reserve(reserved, col, row);
        }
    }

    // The format information is written after masking, but the cells must be
    // kept out of the data stream.
    for (const [row, col] of formatPositions(size)) {
        reserve(reserved, row, col);
    }
}

/** Both copies of the 15 format bits, in bit order. */
function formatPositions(size) {
    const positions = [];

    for (let i = 0; i <= 5; i++) {
        positions.push([i, 8]);
    }

    positions.push([7, 8], [8, 8], [8, 7]);

    for (let i = 9; i <= 14; i++) {
        positions.push([8, 14 - i]);
    }

    for (let i = 0; i <= 7; i++) {
        positions.push([8, size - 1 - i]);
    }

    for (let i = 8; i <= 14; i++) {
        positions.push([size - 15 + i, 8]);
    }

    return positions;
}

function placeData(grid, reserved, codewords) {
    const size = grid.length;
    let index = 0;
    let bit = 7;

    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) {
            right = 5;
        }

        for (let step = 0; step < size; step++) {
            for (let column = 0; column < 2; column++) {
                const col = right - column;
                const upward = ((right + 1) & 2) === 0;
                const row = upward ? size - 1 - step : step;

                if (reserved[row][col]) {
                    continue;
                }

                grid[row][col] = index < codewords.length && ((codewords[index] >>> bit) & 1) === 1;

                bit--;

                if (bit < 0) {
                    bit = 7;
                    index++;
                }
            }
        }
    }
}

const MASKS = [
    (row, col) => (row + col) % 2 === 0,
    (row) => row % 2 === 0,
    (row, col) => col % 3 === 0,
    (row, col) => (row + col) % 3 === 0,
    (row, col) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
    (row, col) => ((row * col) % 2) + ((row * col) % 3) === 0,
    (row, col) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
    (row, col) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];

function applyMask(grid, reserved, mask) {
    const size = grid.length;
    const test = MASKS[mask];
    const output = grid.map((row) => [...row]);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col] === null || reserved[row][col]) {
                continue;
            }

            if (test(row, col)) {
                output[row][col] = !output[row][col];
            }
        }
    }

    return output;
}

function placeFormat(grid, mask) {
    const size = grid.length;
    const data = (0b00 << 3) | mask;
    let remaining = data;

    for (let i = 0; i < 10; i++) {
        remaining = (remaining << 1) ^ ((remaining >>> 9) * 0x537);
    }

    const bits = ((data << 10) | remaining) ^ 0b101010000010010;

    formatPositions(size).forEach(([row, col], index) => {
        grid[row][col] = ((bits >>> index) & 1) === 1;
    });
}

function penalty(grid) {
    const size = grid.length;
    let score = 0;

    // Rule 1 — runs of five or more modules of the same colour.
    for (let i = 0; i < size; i++) {
        let run = 1;

        for (let j = 1; j < size; j++) {
            const same = i < size
                ? grid[i][j] === grid[i][j - 1]
                : grid[j][i] === grid[j - 1][i];

            if (same) {
                run++;
            } else {
                score += run >= 5 ? 3 + (run - 5) : 0;
                run = 1;
            }
        }

        score += run >= 5 ? 3 + (run - 5) : 0;
    }

    // Rule 2 — 2x2 blocks of one colour.
    for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
            const value = grid[row][col];

            if (value === grid[row][col + 1] && value === grid[row + 1][col] && value === grid[row + 1][col + 1]) {
                score += 3;
            }
        }
    }

    // Rule 3 — finder-like 1:1:3:1:1 patterns with four light modules beside them.
    const pattern = [true, false, true, true, true, false, true];

    const matches = (get, start) => {
        for (let k = 0; k < 7; k++) {
            if (get(start + k) !== pattern[k]) {
                return false;
            }
        }

        const before = [start - 4, start - 3, start - 2, start - 1].every((i) => i < 0 || get(i) === false);
        const after = [start + 7, start + 8, start + 9, start + 10].every((i) => i >= size || get(i) === false);

        return before || after;
    };

    for (let i = 0; i < size; i++) {
        for (let j = 0; j + 7 <= size; j++) {
            if (matches((index) => grid[i][index], j)) {
                score += 40;
            }
        }

        for (let j = 0; j + 7 <= size; j++) {
            if (matches((index) => grid[index][i], j)) {
                score += 40;
            }
        }
    }

    // Rule 4 — deviation from an even balance of dark and light.
    let dark = 0;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col]) {
                dark++;
            }
        }
    }

    const percent = (dark * 100) / (size * size);

    return score + Math.floor(Math.abs(percent - 50) / 5) * 10;
}

/**
 * Encode text as a QR code matrix.
 *
 * @param  string  text
 * @return {{ size: number, modules: boolean[][] }|null}  null when the text is too long.
 */
export function encodeQr(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = pickVersion(bytes.length);

    if (version === null) {
        return null;
    }

    const codewords = buildCodewords(bytes, version);
    const base = createGrid(version);
    const reserved = createReserved(base.length);

    placeFunctionPatterns(base, reserved, version);
    placeData(base, reserved, codewords);

    let best = null;
    let bestScore = Infinity;

    for (let mask = 0; mask < MASKS.length; mask++) {
        const candidate = applyMask(base, reserved, mask);

        placeFormat(candidate, mask);

        const score = penalty(candidate);

        if (score < bestScore) {
            bestScore = score;
            best = candidate;
        }
    }

    return { size: best.length, modules: best };
}
