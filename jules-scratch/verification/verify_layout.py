from playwright.sync_api import sync_playwright, Page, expect

def verify_layout(page: Page):
    # Go to the page
    page.goto("http://localhost:5174/")

    # Wait for the main chat input to be visible, this indicates the app has loaded
    expect(page.get_by_placeholder("Talk to your custom AI... (Ctrl+/ to focus, Ctrl+K to search, Ctrl+T for templates)")).to_be_visible(timeout=10000)

    # Take a screenshot of the main chat view
    page.screenshot(path="jules-scratch/verification/screenshot-chat.png")

    # For now, we only take one screenshot.
    # We can add more later if needed.

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_layout(page)
        browser.close()
