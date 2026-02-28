/**
 * Stateless captcha system using HMAC signatures.
 * The captcha ID is a signed token containing the answer — no server-side storage needed.
 */

import crypto from "crypto";

const SECRET = process.env.CAPTCHA_SECRET || "bengyixia-captcha-secret-key-2024";

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor(): string {
    const r = randomInt(30, 130);
    const g = randomInt(30, 130);
    const b = randomInt(30, 130);
    return `rgb(${r},${g},${b})`;
}

function sign(data: string): string {
    return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function generateSvg(text: string): string {
    const width = 150;
    const height = 48;

    let lines = "";
    for (let i = 0; i < 5; i++) {
        const x1 = randomInt(0, width);
        const y1 = randomInt(0, height);
        const x2 = randomInt(0, width);
        const y2 = randomInt(0, height);
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${randomColor()}" stroke-width="1" opacity="0.4"/>`;
    }

    let dots = "";
    for (let i = 0; i < 30; i++) {
        const cx = randomInt(0, width);
        const cy = randomInt(0, height);
        dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="${randomColor()}" opacity="0.3"/>`;
    }

    let textElements = "";
    const chars = text.split("");
    const charWidth = width / (chars.length + 1);
    chars.forEach((char, i) => {
        const x = charWidth * (i + 0.5);
        const y = height / 2 + randomInt(-3, 3);
        const rotate = randomInt(-15, 15);
        const fontSize = randomInt(20, 26);
        textElements += `<text x="${x}" y="${y}" font-family="monospace" font-size="${fontSize}" font-weight="bold" fill="${randomColor()}" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotate},${x},${y})">${char}</text>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#f5f5f5"/>
${lines}${dots}${textElements}
</svg>`;
}

export function createCaptcha(): { id: string; svg: string } {
    const a = randomInt(1, 20);
    const b = randomInt(1, 20);
    const ops = ["+", "-"] as const;
    const op = ops[randomInt(0, 1)];

    let answer: number;
    let displayA = a;
    let displayB = b;

    if (op === "+") {
        answer = a + b;
    } else {
        displayA = Math.max(a, b);
        displayB = Math.min(a, b);
        answer = displayA - displayB;
    }

    const text = `${displayA} ${op} ${displayB} = ?`;

    // Create a signed token: timestamp.answer.signature
    const timestamp = Date.now().toString();
    const payload = `${timestamp}:${answer}`;
    const signature = sign(payload);
    const id = `${timestamp}.${signature}`;

    return { id, svg: generateSvg(text) };
}

export function verifyCaptcha(id: string, userAnswer: string): boolean {
    if (!id || !userAnswer) return false;

    const dotIndex = id.indexOf(".");
    if (dotIndex === -1) return false;

    const timestamp = id.slice(0, dotIndex);
    const providedSignature = id.slice(dotIndex + 1);

    // Check expiry (5 minutes)
    const age = Date.now() - parseInt(timestamp);
    if (isNaN(age) || age > 5 * 60 * 1000 || age < 0) return false;

    // Verify signature with user's answer
    const payload = `${timestamp}:${userAnswer.trim()}`;
    const expectedSignature = sign(payload);

    return providedSignature === expectedSignature;
}
