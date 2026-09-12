from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
SVG = b'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="900" height="700" fill="#c8c0b5"/><rect x="80" y="80" width="300" height="420" fill="#f0d8a8"/><rect x="500" y="100" width="260" height="400" fill="#6c655f"/></svg>'''


def production_html():
    css = (PUBLIC / 'styles.css').read_text()
    js = (PUBLIC / 'bundle.js').read_text()
    return f'''<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body><main id="app" class="app-shell" aria-live="polite"></main><script>{js}</script></body></html>'''


def run_flow(page, mobile=False):
    page.set_content(production_html(), wait_until='load')
    page.locator('#room-photo-input').set_input_files({'name': 'raum.svg', 'mimeType': 'image/svg+xml', 'buffer': SVG})
    page.get_by_text('Erster Eindruck:').wait_for()
    page.get_by_role('button', name='Raum neu denken').click()

    page.get_by_text('Fensterausrichtung').wait_for()
    south = page.get_by_role('button', name='Süd', exact=True)
    south.click()
    assert south.get_attribute('aria-pressed') == 'true'

    # Normal brief re-renders keep the selected direction.
    page.get_by_role('button', name='Küche', exact=True).click()
    assert page.get_by_role('button', name='Süd', exact=True).get_attribute('aria-pressed') == 'true'

    page.get_by_role('button', name='Meine Raumvision erstellen').click()
    insight = page.locator('[data-orientation-insight]')
    insight.wait_for()
    text = insight.inner_text()
    assert 'Südausrichtung berücksichtigt' in text
    assert 'Blend- und Hitzeschutz' in text

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
    run_flow(desktop_ctx.new_page())
    desktop_ctx.close()

    mobile_ctx = browser.new_context(**p.devices['Pixel 7'])
    run_flow(mobile_ctx.new_page(), mobile=True)
    mobile_ctx.close()

    browser.close()

print('Window orientation browser tests passed on desktop and Pixel 7.')
