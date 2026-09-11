from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#554b42"/><rect x="70" y="80" width="320" height="430" fill="#655a51"/><rect x="470" y="100" width="350" height="260" fill="#b89f7a"/><rect x="110" y="520" width="680" height="100" fill="#413a34"/></svg>'''


def production_html():
    css = (PUBLIC / 'styles.css').read_text()
    js = (PUBLIC / 'bundle.js').read_text()
    return f'''<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body><main id="app" class="app-shell" aria-live="polite"></main><script>{js}</script></body></html>'''


def load(page):
    page.set_content(production_html(), wait_until='load')


def run_flow(page, mobile=False):
    load(page)
    page.get_by_text('Ich sehe, was möglich ist.').wait_for()
    assert page.get_by_role('button', name='Raum neu denken').is_disabled()
    page.locator('#room-photo-input').set_input_files({'name': 'raum.svg', 'mimeType': 'image/svg+xml', 'buffer': SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Raum neu denken').click()
    page.get_by_text('Gib mir nur den Rahmen.').wait_for()
    if mobile:
        assert page.evaluate('document.body.scrollWidth <= window.innerWidth')
    page.get_by_role('button', name='Küche', exact=True).click()
    page.get_by_role('button', name='Neu gedacht auch größere Eingriffe').click()
    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    page.get_by_text('Kitchen, Reframed').wait_for()
    page.get_by_text('Der Oum-Wonder-Move').wait_for()
    page.get_by_text('So würdest du anfangen').wait_for()
    if mobile:
        assert page.evaluate('window.innerWidth') <= 430
        assert page.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth')


def run_targeted(page):
    load(page)
    page.locator('#room-photo-input').set_input_files({'name': 'raum.svg', 'mimeType': 'image/svg+xml', 'buffer': SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Gezielt verbessern').click()
    page.get_by_role('button', name='Raum neu denken').click()
    page.get_by_label('Was soll besser werden?').fill('Der Raum ist dunkel, wirkt niedrig und die Möbel stehen chaotisch.')
    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    page.get_by_text('Licht zuerst lösen').wait_for()
    page.get_by_text('Proportionen optisch strecken').wait_for()
    page.get_by_text('Volumen bündeln').wait_for()

with sync_playwright() as p:
    local_chromium = Path('/usr/bin/chromium')
    launch_args = {'headless': True, 'args': ['--no-sandbox']}
    if local_chromium.exists() and not os.getenv('GITHUB_ACTIONS'):
        launch_args['executable_path'] = str(local_chromium)
    browser = p.chromium.launch(**launch_args)
    desktop = browser.new_context(viewport={'width': 1280, 'height': 900})
    inspiration = desktop.new_page()
    run_flow(inspiration)
    inspiration.close()
    targeted = desktop.new_page()
    run_targeted(targeted)
    targeted.close()
    desktop.close()

    mobile_ctx = browser.new_context(**p.devices['Pixel 7'])
    mobile = mobile_ctx.new_page()
    run_flow(mobile, mobile=True)
    mobile.screenshot(path=str(ROOT / 'test-results-mobile.png'), full_page=True)
    mobile_ctx.close()
    browser.close()

print('Browser tests passed: desktop inspiration, desktop targeted improvement, mobile inspiration + overflow check.')
