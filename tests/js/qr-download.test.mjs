import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { QR_FORMATS, qrPathData, qrSvgDocument } from '../../resources/js/lib/qrSvg.js';
import { qrFileName } from '../../resources/js/lib/qrDownload.js';
import { encodeQr } from '../../resources/js/lib/qrcode.js';

const URL = 'https://simplemenu.test/m/golden-cairo-grill';

describe('qrSvgDocument', () => {
    it('offers exactly the three formats the download menu offers', () => {
        assert.deepEqual(QR_FORMATS, ['png', 'svg', 'jpeg']);
    });

    it('returns a standalone svg sized for download, not for the page', () => {
        const document = qrSvgDocument(URL, { size: 1024 });

        assert.match(document.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
        assert.match(document.svg, /width="1024" height="1024"/);
        // The viewBox counts the quiet zone, so a scanned code keeps its margin.
        assert.equal(document.svg.includes(`viewBox="0 0 ${document.width} ${document.width}"`), true);
        assert.match(document.svg, /<rect width="\d+" height="\d+" fill="#ffffff"\/>/);
        assert.match(document.svg, /<path d="M/);
    });

    it('declines empty values instead of rendering a broken code', () => {
        assert.equal(qrSvgDocument(''), null);
        assert.equal(qrSvgDocument(null), null);
    });

    it('keeps the payload in the modules, never in the markup', () => {
        const hostile = 'https://simplemenu.test/m/\"><script>alert(1)</script>';
        const document = qrSvgDocument(hostile, { size: 256 });

        // The URL only reaches the encoder, so no attribute can be broken open.
        assert.ok(!document.svg.includes('script'));
        assert.ok(!document.svg.includes(URL));
    });

    it('escapes a label that is interpolated into an attribute', () => {
        const document = qrSvgDocument(URL, { label: 'Menu "1" & more' });

        assert.match(document.svg, /aria-label="Menu &quot;1&quot; &amp; more"/);
    });

    it('encodes different links into different modules', () => {
        const first = qrSvgDocument('https://simplemenu.test/r/golden-cairo-grill');
        const second = qrSvgDocument('https://simplemenu.test/m/golden-cairo-grill');

        // Restaurant and menu codes must never render the same pattern.
        assert.notEqual(first.svg, second.svg);
        assert.equal(qrSvgDocument('https://simplemenu.test/m/golden-cairo-grill').svg, second.svg);
    });

    it('collapses dark modules into runs', () => {
        const code = encodeQr(URL);
        const path = qrPathData(code);

        assert.match(path, /^M2 2h7v1h-7z/);
        assert.ok(!path.includes('v2'), 'vertical runs should not appear');
        assert.equal(qrPathData(null), '');
    });
});

describe('qrFileName', () => {
    it('prefers the menu slug and leaves the extension to the caller', () => {
        // The dropdown appends the format, so one base name serves all three.
        for (const format of QR_FORMATS) {
            assert.equal(`${qrFileName(URL, 'golden-cairo-grill')}.${format}`, `golden-cairo-grill-qr.${format}`);
        }
    });

    it('derives a name from the url when no label is given', () => {
        assert.equal(qrFileName(URL), 'simplemenu-test-m-golden-cairo-grill-qr');
    });

    it('strips characters that would escape the downloads folder', () => {
        for (const name of ['../../etc/passwd', 'Summer / specials!', '  ', '', null, undefined]) {
            const slug = qrFileName(URL, name);

            assert.ok(!slug.includes('/'), slug);
            assert.ok(!slug.includes('..'), slug);
            assert.match(slug, /^[a-z0-9-]*-qr$/, slug);
        }
    });
});
