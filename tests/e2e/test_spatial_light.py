from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
LIGHT_SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect x="0" y="0" width="300" height="600" fill="#222222"/><rect x="300" y="0" width="300" height="600" fill="#777777"/><rect x="600" y="0" width="300" height="600" fill="#eeeeee"/></svg>'''


def production_html():
    css = (PUBLIC / 'styles.css').read_text()
    js = (PUBLIC / 'bundle.js').read_text()
    return f'''<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body><main id="app" class="app-shell" aria-live="polite"></main><script>{js}</script></body></html>'''


def run_flow(page, mobile=False):
    page.set_content(production_html(), wait_until='load')
    page.locator('#room-photo-input').set_input_files({'name': 'lichtverteilung.svg', 'mimeType': 'image/svg+xml', 'buffer': LIGHT_SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Raum neu denken').click()
    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    page.get_by_text('Was dein Foto zeigt').wait_for()

    card = page.locator('[data-spatial-light]')
    card.wait_for()
    card_text = card.inner_text()
    assert card.get_attribute('data-spatial-light-direction') == 'right'
    assert 'lichtverteilung' in card_text.lower()
    assert 'Rechts heller' in card_text
    assert 'linke Seite' in card_text

    if mobile:
        assert page.evaluate('document.body.scrollWidth <= window.innerWidth')


with sync_playwright() as p:
    local_chromium = Path('/usr/bin/chromium')
    launch_args = {'headless': True, 'args': ['--no-sandbox']}
    if local_chromium.exists() and not os.getenv('GITHUB_ACTIONS'):
        launch_args['executable_path'] = str(local_chromium)
    browser = p.chromium.launch(**launch_args)

    desktop = browser.new_context(viewport={'width': 1280, 'height': 900})
    run_flow(desktop.new_page())
    desktop.close()

    mobile = browser.new_context(**p.devices['Pixel 7'])
    run_flow(mobile.new_page(), mobile=True)
    mobile.close()
    browser.close()

print('Browser tests passed: spatial light distribution is measured from the uploaded room photo on desktop and mobile.')
