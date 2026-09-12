from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#777"/></svg>'''

def html():
    return f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>{(PUBLIC/'styles.css').read_text()}</style></head><body><main id="app" class="app-shell"></main><script>{(PUBLIC/'bundle.js').read_text()}</script></body></html>'''

def run(page, mobile=False):
    page.set_content(html(), wait_until='load')
    page.locator('#room-photo-input').set_input_files({'name':'raum.svg','mimeType':'image/svg+xml','buffer':SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Raum neu denken').click()
    page.get_by_role('button', name='Küche', exact=True).click()
    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    page.get_by_role('heading', name='Kitchen, Reframed', exact=True).first.wait_for()
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText: async t => window.__copiedPlan=t}, configurable:true})")
    page.get_by_role('button', name='Konzept kopieren').click()
    page.get_by_text('Konzept kopiert – bereit zum Teilen oder Speichern.').wait_for()
    copied = page.evaluate('window.__copiedPlan')
    assert 'Oum Wonder – Kitchen, Reframed' in copied
    assert 'Prioritäten' in copied
    assert 'Erste Schritte' in copied
    if mobile:
        assert page.evaluate('document.body.scrollWidth <= window.innerWidth')

with sync_playwright() as p:
    local = Path('/usr/bin/chromium')
    args = {'headless': True, 'args': ['--no-sandbox']}
    if local.exists() and not os.getenv('GITHUB_ACTIONS'):
        args['executable_path'] = str(local)
    browser = p.chromium.launch(**args)
    desktop = browser.new_context(viewport={'width':1280,'height':900})
    run(desktop.new_page())
    desktop.close()
    mobile = browser.new_context(**p.devices['Pixel 7'])
    run(mobile.new_page(), mobile=True)
    mobile.close()
    browser.close()

print('Export browser tests passed on desktop and mobile.')
