import asyncio
import json
import os
import requests
import io
import re
import base64
from pypdf import PdfReader
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from supabase import create_client, Client
from openai import OpenAI

# --- 1. SECURE CONFIGURATION ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not GROQ_API_KEY:
    raise ValueError("❌ Missing API Keys in Environment Variables!")

# Connect
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)

# --- 2. TARGETS ---
TARGETS = [
    {"name": "Vintage Brewing Co", "urls": ["https://vintagebrewingcompany.com/madison/drink-specials/"]},
    {"name": "Jordan's Big Ten Pub", "urls": ["https://big10pub.com/"]},
    {"name": "The Coopers Tavern", "urls": ["https://www.thecooperstavern.com/"]},
    {"name": "Red Rock Saloon", "urls": ["https://redrockmadison.com/weekly-specials/"]},
    {"name": "The Nitty Gritty", "urls": ["https://www.thegritty.com/event/happy-hour/", "https://www.thegritty.com/event/power-hour/"]},
    {"name": "State Street Brats", "urls": ["https://statestreetbrats.com/specials/"]},
    {"name": "RED", "urls": ["https://red-madison.com/wp-content/uploads/2025/11/RED_HappyHourMenu_Digital.pdf"]},
    {"name": "Double Tap Beer Arcade", "urls": ["https://www.doubletapbeercade.com/location/madison/"]},
    {"name": "Canteen", "urls": ["https://www.canteentaco.com/event/happy-hour/"]},
    {"name": "Cento", "urls": ["https://www.centomadison.com/menus/#happy-hour"]},
    # --- WEARY TRAVELER IMAGE URL ---
    {"name": "Weary Traveler Freehouse", "urls": ["https://wearytravelerfreehouse.com/wp-content/uploads/2025/10/Magic-Hour-Fall-2025-768x593.jpg"]}
]

# --- 3. HELPER FUNCTION (The Surgical Fix) ---
def clean_ai_response(raw_text):
    start_index = raw_text.find('[')
    if start_index == -1:
        return "[]" 

    bracket_count = 0
    for i in range(start_index, len(raw_text)):
        char = raw_text[i]
        if char == '[':
            bracket_count += 1
        elif char == ']':
            bracket_count -= 1
            
        if bracket_count == 0:
            potential_json = raw_text[start_index : i+1]
            return potential_json

    return "[]" 

# --- 4. SCRAPER LOGIC ---
async def scrape_bar(target):
    print(f"\n1. 🕵️‍♀️ Visiting {target['name']}...")
    try:
        supabase.table('specials').delete().eq('bar_name', target['name']).execute()
    except Exception as e:
        print(f"   ⚠️ Database error: {e}")

    for url in target['urls']:
        raw_text = ""
        is_image = url.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
        image_data_url = None
        
        # IMAGE HANDLING
        if is_image:
            print(f"   🖼️ Downloading Image: {url}")
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                base64_image = base64.b64encode(response.content).decode('utf-8')
                content_type = response.headers.get('Content-Type', 'image/jpeg')
                image_data_url = f"data:{content_type};base64,{base64_image}"
            except Exception as e:
                print(f"      ❌ Image Error: {e}")
                continue

        # PDF HANDLING
        elif url.lower().endswith('.pdf'):
            print(f"   📄 Downloading PDF: {url}")
            try:
                response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                with io.BytesIO(response.content) as f:
                    reader = PdfReader(f)
                    for page in reader.pages:
                        raw_text += page.extract_text() + "\n"
            except Exception as e:
                print(f"      ❌ PDF Error: {e}")
                continue

        # WEB HANDLING
        else:
            print(f"   🔎 Scraping Web: {url}")
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                try:
                    await page.goto(url, timeout=60000)
                    await page.wait_for_timeout(4000) 
                    content = await page.content()
                    soup = BeautifulSoup(content, 'html.parser')
                    raw_text = soup.get_text(separator=' ', strip=True)[:25000]
                except Exception as e:
                    print(f"      ❌ Browser Error: {e}")
                    await browser.close()
                    continue 
                await browser.close()

        # AI PROCESSING
        prompt_instructions = """
        You are a data extraction robot. Extract 'Daily Specials' from the provided menu information into JSON.
        INSTRUCTIONS:
        1. Extract all daily deals and Happy Hours.
        2. CRITICAL: For 'special_details', include specific times and exact discounts (e.g. "$1 off taps, 4pm-5:30pm").
        3. Schema: [{"day_of_week": "Monday", "special_details": "...", "price": "..."}]
        4. RULES: Price like "4.00" if specific, else "Varies". 
        5. CRITICAL RULE: If a deal is multi-day (like "M-F" or "Monday-Friday"), you MUST split it into separate objects for EACH full day name ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday").
        """
        
        try:
            # Send to Vision Model if Image
            if is_image and image_data_url:
                completion = client.chat.completions.create(
                    model="llama-3.2-90b-vision-preview",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt_instructions},
                                {"type": "image_url", "image_url": {"url": image_data_url}}
                            ]
                        }
                    ],
                    temperature=0,
                )
            # Send to Text Model if Web/PDF
            else:
                prompt_text = prompt_instructions + f"\nRAW TEXT: {raw_text}"
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt_text}],
                    temperature=0,
                )
            
            ai_response = completion.choices[0].message.content
            
            clean_json = clean_ai_response(ai_response)
            specials_data = json.loads(clean_json)
            print(f"      Found {len(specials_data)} specials.")
            
            data_to_insert = []
            for item in specials_data:
                item['bar_name'] = target['name']
                item['source_url'] = url
                data_to_insert.append(item)
                
            if data_to_insert:
                supabase.table('specials').insert(data_to_insert).execute()
                print("      ✅ Database Updated!")
                
        except Exception as e:
            print(f"      ❌ Error processing AI: {e}")

# --- 5. MAIN LOOP ---
async def run_all():
    print(f"🚀 Starting Cloud Scraper Job...")
    for target in TARGETS:
        await scrape_bar(target)
    print("\n🏁 Job Complete!")

if __name__ == "__main__":
    asyncio.run(run_all())