from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#8f877d"/><rect x="70" y="80" width="320" height="430" fill="#716a63"/><rect x="470" y="100" width="350" height="260" fill="#d7cdbd"/></svg>'''


def production_html():
    css = (PUBLIC / 'styles.css').read_text()
    js = (PUBLIC / 'bundle.js').read_text()
    return f'''<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body><main id="app" class="app-shell" aria-live="polite"></main><script>{js}</script></body></html>'''


def run_flow(page, mobile=False):
    page.set_content(production_html(), wait_until='load')
    page.locator('#room-photo-input').set_input_files({'name': 'raum.svg', 'mimeType': 'image/svg+xml', 'buffer': SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Raum neu denken').click()

    page.get_by_text('Raummaße').wait_for()
    page.get_by_label('Breite in Metern').fill('2.2')
    page.get_by_label('Tiefe in Metern').fill('5')
    page.get_by_label('Höhe in Metern').fill('2.3')

    # A normal app re-render must keep the optional measurements.
    page.get_by_role('button', name='Küche', exact=True).click()
    assert page.get_by_label('Breite in Metern').input_value() == '2.2'
    assert page.get_by_label('Tiefe in Metern').input_value() == '5'
    assert page.get_by_label('Höhe in Metern').input_value() == '2.3'

    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    insight = page.locator('[data-measurement-insight]')
    insight.wait_for()
    text = insight.inner_text()
    assert 'Raummaße berücksichtigt' in text
    assert 'Decke ist eher niedrig' in text
    assert 'Grundriss ist deutlich länglich' in text
    assert 'Fläche ist kompakt' in text

    if mobile:
        assert page.evaluate('window.innerWidth') <= 430
        assert page.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth')


with sync_playwright() as p:
    local_chromium = Path('/usr/bin/chromium')
    launch_args = {'headless': True, 'args': ['--no-sandbox']}
    if local_chromium.exists() and not os.getenv('GITHUB_ACTIONS'):
        launch_args['executable_path'] = str(local_chromium)
    browser = p.chromium.launch(**launch_args)

    desktop_ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    desktop = desktop_ctx.new_page()
    run_flow(desktop)
    desktop_ctx.close()

    mobile_ctx = browser.new_context(**p.devices['Pixel 7'])
    mobile = mobile_ctx.new_page()
    run_flow(mobile, mobile=True)
    mobile_ctx.close()

    browser.close()

print('Room measurement browser tests passed: optional inputs persist and drive proportion guidance on desktop and Pixel 7.')
