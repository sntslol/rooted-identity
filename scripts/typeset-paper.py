"""Academic edition of the Rooted whitepaper; requires only ReportLab.

The web manuscript remains the underlying technical source. This edition uses
formal section titles, numbered references, vector figures, and a review appendix.
"""
from __future__ import annotations
import html
import json
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, PageBreak, Preformatted, Flowable,
)

DATA = json.load(sys.stdin)
OUT = Path('output/pdf/rooted-whitepaper.pdf')
PAGE_W, PAGE_H = A4
MARGIN = 65
WIDTH = PAGE_W - 2 * MARGIN
INK = colors.HexColor('#111111')
GRAY = colors.HexColor('#555555')
PALE = colors.HexColor('#f4f4f4')
RULE = colors.HexColor('#888888')

STYLES = {
    'body': ParagraphStyle('Body', fontName='Times-Roman', fontSize=11, leading=14.5,
        alignment=TA_JUSTIFY, spaceAfter=6, allowWidows=0, allowOrphans=0),
    'heading': ParagraphStyle('Section', fontName='Times-Bold', fontSize=12.3,
        leading=16, spaceBefore=14, spaceAfter=7, keepWithNext=True),
    'subheading': ParagraphStyle('Subsection', fontName='Times-Bold', fontSize=11,
        leading=14, spaceBefore=8, spaceAfter=5, keepWithNext=True),
    'title': ParagraphStyle('Title', fontName='Times-Bold', fontSize=20, leading=24,
        alignment=TA_CENTER, spaceAfter=9),
    'author': ParagraphStyle('Author', fontName='Times-Roman', fontSize=12,
        leading=17, alignment=TA_CENTER, spaceAfter=2),
    'meta': ParagraphStyle('Meta', fontName='Times-Roman', fontSize=9, leading=13,
        alignment=TA_CENTER, spaceAfter=10, textColor=GRAY),
    'abstract': ParagraphStyle('AbstractBody', fontName='Times-Roman', fontSize=10,
        leading=13, alignment=TA_JUSTIFY, leftIndent=18, rightIndent=18,
        spaceAfter=5, allowWidows=0, allowOrphans=0),
    'abstractlabel': ParagraphStyle('AbstractLabel', fontName='Times-Bold', fontSize=10.5,
        leading=14, alignment=TA_CENTER, spaceBefore=5, spaceAfter=5, keepWithNext=True),
    'caption': ParagraphStyle('Caption', fontName='Times-Roman', fontSize=9.2,
        leading=12, alignment=TA_JUSTIFY, spaceBefore=5, spaceAfter=11,
        leftIndent=8, rightIndent=8),
    'table': ParagraphStyle('TableBody', fontName='Times-Roman', fontSize=9,
        leading=11.5, spaceAfter=0),
    'tablehead': ParagraphStyle('TableHeader', fontName='Times-Bold', fontSize=9,
        leading=11.5, spaceAfter=0),
    'review': ParagraphStyle('ReviewCell', fontName='Times-Roman', fontSize=8.4,
        leading=10.8, spaceAfter=0),
    'reference': ParagraphStyle('Reference', fontName='Times-Roman', fontSize=9.4,
        leading=12.5, leftIndent=20, firstLineIndent=-20, spaceAfter=7,
        splitLongWords=True, allowWidows=0, allowOrphans=0),
    'note': ParagraphStyle('Note', fontName='Times-Italic', fontSize=9.3,
        leading=12, alignment=TA_JUSTIFY, spaceAfter=8),
    'code': ParagraphStyle('Code', fontName='Courier', fontSize=8.4,
        leading=11.5, leftIndent=10, rightIndent=8, spaceBefore=6, spaceAfter=5),
    'figure': ParagraphStyle('FigureText', fontName='Times-Roman', fontSize=10,
        leading=12, alignment=TA_CENTER),
    'figurebold': ParagraphStyle('FigureBold', fontName='Times-Bold', fontSize=10,
        leading=12, alignment=TA_CENTER),
}

# Entries intentionally identify primary specifications without inventing
# publication venues, affiliations, peer review, or bibliographic authorship.
SOURCE_TITLES = {
    'https://bips.dev/341/': 'Bitcoin Improvement Proposals. BIP 341: Taproot: SegWit version 1 spending rules.',
    'https://bips.dev/342/': 'Bitcoin Improvement Proposals. BIP 342: Validation of Taproot Scripts.',
    'https://bips.dev/340/': 'Bitcoin Improvement Proposals. BIP 340: Schnorr Signatures for secp256k1.',
    'https://bips.dev/141/': 'Bitcoin Improvement Proposals. BIP 141: Segregated Witness (Consensus layer).',
    'https://bips.dev/65/': 'Bitcoin Improvement Proposals. BIP 65: OP_CHECKLOCKTIMEVERIFY.',
    'https://bips.dev/68/': 'Bitcoin Improvement Proposals. BIP 68: Relative lock-time using consensus-enforced sequence numbers.',
    'https://bips.dev/112/': 'Bitcoin Improvement Proposals. BIP 112: CHECKSEQUENCEVERIFY.',
    'https://bips.dev/327/': 'Bitcoin Improvement Proposals. BIP 327: MuSig2 for BIP340-compatible Multi-Signatures.',
    'https://bips.dev/386/': 'Bitcoin Improvement Proposals. BIP 386: tr() Output Script Descriptors.',
    'https://bitcoincore.org/en/releases/30.0/': 'Bitcoin Core. Bitcoin Core 30.0 release notes.',
    'https://github.com/nostr-protocol/nips/blob/master/01.md': 'Nostr Protocol. NIP-01: Basic protocol flow description.',
    'https://github.com/nostr-protocol/nips/blob/master/05.md': 'Nostr Protocol. NIP-05: Mapping Nostr keys to DNS-based internet identifiers.',
    'https://www.w3.org/TR/did/': 'World Wide Web Consortium. Decentralized Identifiers (DIDs): Core specification.',
    'https://identity.foundation/sidetree/spec/': 'Decentralized Identity Foundation. Sidetree Protocol specification.',
    'https://github.com/dcdpr/did-btcr2': 'did:btcr2 project. Bitcoin-anchored decentralized identifier method specification.',
    'https://www.rfc-editor.org/rfc/rfc9591.html': 'Internet Research Task Force. RFC 9591: The Flexible Round-Optimized Schnorr Threshold (FROST) Protocol for Two-Round Schnorr Signatures.',
}
CITATIONS: dict[str, int] = {}
REF_BY_ID = {entry['id']: entry for entry in DATA['references']}
SUBS = str.maketrans('₀₁₂₃₄₅₆₇₈₉', '0123456789')


def ascii_punctuation(text: str) -> str:
    return text.replace('—', ' - ').replace('–', '-').replace('‑', '-').replace('−', '-') \
        .replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"') \
        .replace('…', '...').replace('·', ';')


def plain(text: str) -> str:
    text = html.escape(ascii_punctuation(text), quote=False)
    return re.sub(r'[₀₁₂₃₄₅₆₇₈₉]+', lambda m: '<sub>' + m.group().translate(SUBS) + '</sub>', text)


def citation(url: str) -> str:
    if url not in SOURCE_TITLES:
        raise ValueError('Unregistered citation: ' + url)
    if url not in CITATIONS:
        CITATIONS[url] = len(CITATIONS) + 1
    number = CITATIONS[url]
    return f'<link href="#ref-{number}" color="#111111">[{number}]</link>'


def inline(text: str) -> str:
    pattern = r'(`[^`]+`|\[[^\]]+\]\(https?://[^)]+\)|\*\*[^*]+\*\*)'
    output = []
    for part in re.split(pattern, text):
        if not part:
            continue
        if part.startswith('`') and part.endswith('`'):
            output.append('<font name="Courier" size="8.5">' + plain(part[1:-1]) + '</font>')
        elif part.startswith('['):
            match = re.fullmatch(r'\[([^\]]+)\]\((https?://[^)]+)\)', part)
            if not match:
                raise ValueError(part)
            output.append(plain(match[1]) + ' ' + citation(match[2]))
        elif part.startswith('**') and part.endswith('**'):
            output.append('<b>' + plain(part[2:-2]) + '</b>')
        else:
            output.append(plain(part))
    return ''.join(output)


def para(text: str, style: str = 'body') -> Paragraph:
    return Paragraph(inline(text), STYLES[style])


def draw_para(canvas, text: str, x: float, y: float, width: float, bold=False):
    p = Paragraph(text, STYLES['figurebold' if bold else 'figure'])
    _, height = p.wrap(width, 100)
    p.drawOn(canvas, x, y - height)


def arrow(canvas, x1, y1, x2, y2):
    from math import atan2, cos, sin
    canvas.line(x1, y1, x2, y2)
    angle = atan2(y2 - y1, x2 - x1)
    path = canvas.beginPath()
    path.moveTo(x2, y2)
    path.lineTo(x2 - 5 * cos(angle - .45), y2 - 5 * sin(angle - .45))
    path.moveTo(x2, y2)
    path.lineTo(x2 - 5 * cos(angle + .45), y2 - 5 * sin(angle + .45))
    canvas.drawPath(path)


class Diagram(Flowable):
    def __init__(self, kind: str):
        super().__init__()
        self.kind = kind
        self.width = WIDTH
        self.height = {'transaction': 179, 'lifecycle': 140, 'policy': 146}[kind]

    def draw(self):
        c = self.canv
        c.setStrokeColor(INK)
        c.setFillColor(INK)
        c.setLineWidth(.65)
        w = self.width
        if self.kind == 'transaction':
            left_x, left_w, right_x, right_w = 5, 118, 184, w - 189
            c.rect(left_x, 57, left_w, 58)
            draw_para(c, 'Funding inputs', left_x + 5, 99, left_w - 10, True)
            draw_para(c, 'Balance and fee', left_x + 7, 81, left_w - 14)
            c.line(123, 86, 151, 86)
            c.line(151, 28, 151, 146)
            boxes = [(122, 'Output 0: P2TR control U<sub>0</sub>', 'Spending policy and retained balance'),
                     (63, 'Output 1: OP_RETURN record', 'Application key K<sub>0</sub>; successor index 0'),
                     (4, 'Optional change output', 'Outside the identity state')]
            for y, title, description in boxes:
                arrow(c, 151, y + 24, right_x, y + 24)
                c.rect(right_x, y, right_w, 48)
                draw_para(c, title, right_x + 5, y + 36, right_w - 10, True)
                draw_para(c, description, right_x + 5, y + 20, right_w - 10)
        elif self.kind == 'lifecycle':
            box_w = 87
            gap = (w - 4 * box_w) / 3
            origin_w = 240
            c.rect((w - origin_w) / 2, 101, origin_w, 32)
            draw_para(c, 'Stable reference I = (N, txid<sub>0</sub>, vout<sub>0</sub>)', (w - origin_w) / 2 + 5, 124, origin_w - 10)
            c.setDash(2, 3)
            c.line(w / 2, 101, w / 2, 86)
            c.line(box_w / 2, 86, 2 * (box_w + gap) + box_w / 2, 86)
            for i in range(3):
                x = i * (box_w + gap)
                c.line(x + box_w / 2, 86, x + box_w / 2, 65)
            c.setDash()
            for i, (title, label) in enumerate([
                ('U<sub>0</sub>, K<sub>0</sub>', 'Sequence 0'),
                ('U<sub>1</sub>, K<sub>1</sub>', 'Sequence 1'),
                ('U<sub>2</sub>, K<sub>2</sub>', 'Sequence 2'),
                ('Revoked', 'No successor'),
            ]):
                x = i * (box_w + gap)
                c.rect(x, 14, box_w, 49)
                draw_para(c, title, x + 3, 49, box_w - 6, True)
                draw_para(c, label, x + 3, 31, box_w - 6)
                if i < 3:
                    arrow(c, x + box_w, 38, x + box_w + gap, 38)
                    c.setFont('Times-Roman', 7.5)
                    c.drawCentredString(x + box_w + gap / 2, 50, ['Rotate', 'Recover', 'Revoke'][i])
        elif self.kind == 'policy':
            c.rect(40, 99, w - 80, 40)
            draw_para(c, 'Taproot control output', 45, 129, w - 90, True)
            draw_para(c, 'Verifiable NUMS internal point and script-tree commitment', 45, 113, w - 90)
            branch_w = (w - 28) / 2
            c.line(w / 2, 99, w / 2, 84)
            c.line(branch_w / 2, 84, w - branch_w / 2, 84)
            for x, title, detail in [
                (0, 'Owner branch', 'Dedicated control-key signature'),
                (w - branch_w, 'Guardian branch', 'Two-of-three CHECKSIGADD policy'),
            ]:
                c.line(x + branch_w / 2, 84, x + branch_w / 2, 66)
                c.rect(x, 9, branch_w, 57)
                draw_para(c, title, x + 5, 51, branch_w - 10, True)
                draw_para(c, detail, x + 5, 32, branch_w - 10)
            c.setFont('Times-Italic', 8)
            c.drawCentredString(w / 2, 39, 'or')


def figure(kind: str, number: int, caption: str):
    return KeepTogether([Spacer(1, 8), Diagram(kind),
        Paragraph(f'<b>Figure {number}.</b> ' + inline(caption), STYLES['caption'])])


def record_table(lines: list[str]):
    rows = [line.strip().strip('|').split('|') for line in lines]
    rows = [[cell.strip() for cell in row] for row in rows]
    rows = [row for row in rows if not all(re.fullmatch(r'[:\- ]+', cell) for cell in row)]
    data = [[para(cell, 'tablehead' if i == 0 else 'table') for cell in row] for i, row in enumerate(rows)]
    table = Table(data, colWidths=[40, 98, 35, WIDTH - 173], hAlign='LEFT', repeatRows=1)
    table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEABOVE', (0, 0), (-1, 0), .8, INK),
        ('LINEBELOW', (0, 0), (-1, 0), .5, INK),
        ('LINEBELOW', (0, -1), (-1, -1), .8, INK),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    return KeepTogether([Paragraph('<b>Table 1.</b> Candidate version 1 transaction-record encoding. Integer fields use unsigned little-endian encoding; the payload totals 78 bytes.', STYLES['caption']), table, Spacer(1, 10)])


def markdown_blocks(text: str):
    """Parse the deliberately limited, audited Markdown used by this manuscript."""
    lines = text.strip().splitlines()
    output = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code.append(ascii_punctuation(lines[i]).translate(SUBS))
                i += 1
            label = 'Listing 1. Illustrative two-of-three Tapscript authorization leaf.' if any('CHECKSIGADD' in v for v in code) else 'Algorithm 1. Resolution over a complete, validated chain view.'
            output.append(KeepTogether([Preformatted('\n'.join(code), STYLES['code']), Paragraph(label, STYLES['caption'])]))
            i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append(lines[i]); i += 1
            output.append(record_table(rows))
        elif line.startswith('- '):
            while i < len(lines) and lines[i].strip().startswith('- '):
                bullet_style = ParagraphStyle('BulletBody', parent=STYLES['body'], leftIndent=12, firstLineIndent=-10, spaceAfter=4)
                output.append(Paragraph('- ' + inline(lines[i].strip()[2:]), bullet_style))
                i += 1
            output.append(Spacer(1, 3))
        elif line.startswith('>'):
            quote = line.lstrip('> ').replace('**', '')
            output.append(para(quote, 'note'))
            i += 1
        else:
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(('```', '|', '- ', '>')):
                paragraph.append(lines[i].strip()); i += 1
            output.append(para(' '.join(paragraph)))
    return output


class PaperDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == 'Section':
            title = flowable.getPlainText()
            key = 'section-' + str(self.seq.nextf('outline'))
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0, closed=False)


def page_frame(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GRAY)
    if doc.page > 1:
        canvas.setFont('Times-Roman', 8)
        canvas.drawString(MARGIN, PAGE_H - 35, 'ROOTED: BITCOIN-ANCHORED IDENTITY AND KEY CONTINUITY')
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 35, 'Michael Tidwell')
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(.35)
        canvas.line(MARGIN, PAGE_H - 42, PAGE_W - MARGIN, PAGE_H - 42)
    canvas.setFont('Times-Roman', 9)
    canvas.drawCentredString(PAGE_W / 2, 33, str(doc.page))
    canvas.restoreState()


# PDF-only editorial adjustments remove web-interface wording and conversational
# prompts. No protocol rules, measurements, or security properties are changed.
text = DATA['markdown']
text = text.replace('Imagine a player who has spent years building a reputation in a game. Their account is a public key. They want to replace a laptop, recover from losing a device, or retire a leaked signing key without starting from zero.', 'Public-key accounts provide a persistent signing identity, but key replacement is not inherently equivalent to account continuity. A user may need to replace a device, recover lost signing material, or retire a compromised key while preserving application history and reputation.')
text = text.replace('To make the idea reviewable, this paper proposes a deliberately narrow, fixed-width v1 record.', 'The proposed baseline uses a fixed-width version 1 transaction record.')
text = text.replace('Never describe the output as consensus-enforcing the full identity state machine.', 'Accordingly, the output does not enforce the complete identity state machine at the consensus layer.')
text = text.replace('“Validated” does substantial work here.', 'The validation assumption is essential.')
text = text.replace('This site’s fee calculator uses an **illustrative 250-vbyte transaction**, not a measured benchmark or live fee quote.', 'The cost illustration assumes a **250-vbyte transaction**; this is an analytical example rather than a measured benchmark or a live fee estimate.')
text = text.replace('The displayed shorthand in this site is illustrative;', 'Any shortened identifier notation used in the diagrams is illustrative;')
text = text.replace('This paper should be compared with that work', 'The proposal should be compared with that work')
text = text.replace('The website includes a tested educational state-machine model and record codec.', 'The accompanying repository includes a tested educational state-machine model and record codec.')
text = text.replace('The viable next step is an executable regtest prototype, not a claim of production readiness.', 'An executable regtest prototype and independent protocol review are prerequisites for evaluating production suitability.')
text = text.replace('The defensible claim:', 'Scope of the claim:')
text = text.replace('Valid BIP 340 x-only public key', 'Valid [BIP 340](https://bips.dev/340/) x-only public key')

chunks = re.split(r'^## ', text, flags=re.M)[1:]
sections = []
for chunk in chunks:
    title, body = chunk.split('\n', 1)
    sections.append((title, body.strip()))
if len(sections) != 10 or sections[0][0] != 'Abstract':
    raise ValueError('Unexpected manuscript structure; update the academic edition explicitly.')

story = [
    Spacer(1, 10),
    Paragraph('Rooted: Bitcoin-Anchored Identity<br/>and Key Continuity', STYLES['title']),
    Paragraph('Michael Tidwell', STYLES['author']),
    Paragraph('Original idea and concept', STYLES['meta']),
    Paragraph('October 19, 2026 &nbsp; | &nbsp; Version 0.1 &nbsp; | &nbsp; Research draft', STYLES['meta']),
    Paragraph('Abstract', STYLES['abstractlabel']),
]
abstract = [
    'Public-key systems establish signing authority but do not inherently define identity continuity after key loss, replacement, or compromise. This paper presents Rooted, a proposed Bitcoin-anchored construction in which a stable genesis reference identifies a succession of application keys and Taproot control outputs.',
    'A compact OP_RETURN record binds an application key to a control output. A confirmed spend of that output either advances the recognized state, explicitly revokes the identity, or terminates continuity when no valid continuation is provided. Taproot spending conditions authorize owner and guardian actions; client-side rules interpret those actions as identity transitions.',
    'The construction uses existing Bitcoin primitives and proposes no consensus modification. It provides a candidate transaction encoding, a resolver model, and an analysis of recovery, compromise, privacy, and data-availability assumptions. Its claim is limited to verifiable authorized key succession: it does not establish personhood, prevent Sybil identities, guarantee recovery after control-key theft, or provide irreversible finality. The proposal remains a research draft; no production wallet, node-backed resolver, or independent security audit is presented.',
]
for paragraph in abstract:
    story.append(para(paragraph, 'abstract'))
story.append(Paragraph('<i>Keywords:</i> Bitcoin; Taproot; decentralized identity; key rotation; guardian recovery; revocation.', STYLES['abstract']))
story.append(Spacer(1, 8))

headings = [
    'Introduction', 'System Model and Notation', 'Identity State Transitions',
    'Transaction Record Encoding', 'Taproot Authorization Policies',
    'Verification and Chain-State Resolution', 'Security and Trust Assumptions',
    'Applications and Related Work', 'Costs, Limitations, and Implementation Requirements',
]
for number, ((_, body), heading) in enumerate(zip(sections[1:], headings), 1):
    story.append(Paragraph(f'{number}. {heading}', STYLES['heading']))
    if number == 2:
        story.append(Paragraph('Let <i>I</i> denote the stable identity reference, <i>K</i><sub>t</sub> the application public key at state <i>t</i>, <i>U</i><sub>t</sub> its current control outpoint, and <i>q</i><sub>t</sub> the state sequence. The active state is represented by <i>S</i><sub>t</sub> = (<i>I</i>, <i>U</i><sub>t</sub>, <i>K</i><sub>t</sub>, <i>q</i><sub>t</sub>). The network component <i>N</i> of <i>I</i> is the network genesis-block hash. Rotation changes the state while preserving <i>I</i>.', STYLES['body']))
    story.extend(markdown_blocks(body))
    if number == 2:
        story.append(figure('transaction', 1, 'Creation transaction structure. The stable reference identifies the designated P2TR control output; the OP_RETURN record binds the application key to that output. Funding inputs and wallet change do not constitute identity state.'))
    elif number == 3:
        story.append(figure('lifecycle', 2, 'Illustrative identity-state succession. Rotation and guardian recovery replace the application key and control output while preserving the genesis reference. Dashed connections denote the unchanged reference. Explicit revocation creates no successor. Each transition is conditional on validation within the selected chain view.'))
    elif number == 5:
        story.append(figure('policy', 3, 'Alternative script-path authorization conditions for a control output. The NUMS construction must be verifiable. Either branch authorizes spending, but neither branch enforces publication of a valid identity record or inheritance of the recovery policy by a successor.'))

story.append(Paragraph('10. Conclusion', STYLES['heading']))
story.append(para('Rooted separates the stable identity reference, the application signing key, and the Bitcoin policy governing changes in control. This separation provides a model for application-level key continuity using confirmed Bitcoin spends and explicit resolver rules. Its security depends on those rules, complete and current chain data, sound Taproot policies, and recoverable signing material. The next research milestone is a regtest implementation with interoperable transaction vectors, measured costs, and independently reviewed wallet and resolver behavior.'))
story.append(para('The idea and concept are entirely Michael Tidwell\'s. "Rooted" remains a working title. This paper does not assert novelty, standards compliance, peer review, or institutional endorsement.', 'note'))

# Prepare the appendix now so all referenced sources are registered before the
# bibliography is emitted. The table itself follows the references.
review_rows = [[Paragraph(label, STYLES['tablehead']) for label in ['Claim examined', 'Assessment', 'Technical finding and primary references']]]
for row in DATA['review']:
    citations = []
    for key in row['sources']:
        citations.append(citation(REF_BY_ID[key]['url']))
    finding = plain(row['finding'])
    if citations:
        finding += ' ' + ', '.join(citations)
    review_rows.append([
        Paragraph(plain(row['claim']), STYLES['review']),
        Paragraph(plain(row['verdict']), STYLES['review']),
        Paragraph(finding, STYLES['review']),
    ])

story.extend([PageBreak(), Paragraph('References', STYLES['heading'])])
for url, number in CITATIONS.items():
    title = plain(SOURCE_TITLES[url])
    address = html.escape(url, quote=True)
    story.append(Paragraph(f'<a name="ref-{number}"/>[{number}] {title} <link href="{address}" color="#111111">{address}</link> (accessed October 19, 2026).', STYLES['reference']))

story.extend([PageBreak(), Paragraph('Appendix A. Review of Technical Assumptions', STYLES['heading'])])
story.append(para('Table A1 summarizes the source-based design review. "Supported" identifies a supported building block; "Qualified" denotes a claim requiring additional assumptions; "Corrected" identifies an interpretation that must not be treated as a property of the construction; and "Open" identifies unresolved implementation work. This analysis is not an independent security audit.', 'note'))
story.append(Paragraph('<b>Table A1.</b> Assessment of technical claims and limitations.', STYLES['caption']))
review_table = Table(review_rows, colWidths=[112, 57, WIDTH - 169], hAlign='LEFT', repeatRows=1)
review_table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LINEABOVE', (0, 0), (-1, 0), .8, INK),
    ('LINEBELOW', (0, 0), (-1, 0), .5, INK),
    ('LINEBELOW', (0, 1), (-1, -1), .25, colors.HexColor('#cccccc')),
    ('LINEBELOW', (0, -1), (-1, -1), .8, INK),
    ('TOPPADDING', (0, 0), (-1, -1), 7),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
]))
story.append(review_table)

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = PaperDoc(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=58, bottomMargin=55,
    title='Rooted: Bitcoin-Anchored Identity and Key Continuity',
    author='Michael Tidwell',
    subject='A research proposal for Bitcoin-anchored key continuity, recovery, and revocation',
    creator='Rooted academic whitepaper typesetter',
)
frame = Frame(MARGIN, 55, WIDTH, PAGE_H - 113, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates(PageTemplate(id='paper', frames=frame, onPage=page_frame))
doc.build(story)
print(f'Typeset {OUT}; {len(CITATIONS)} numbered primary references.')
