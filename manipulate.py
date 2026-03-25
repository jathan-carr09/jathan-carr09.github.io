import sys
import subprocess

def install_bs4():
    subprocess.check_call([sys.executable, "-m", "pip", "install", "beautifulsoup4"])

install_bs4()

import re
from bs4 import BeautifulSoup

file_path = "C:/Users/JathanCarr/OneDrive - Alabama School of Cyber Technology and Engineering/Documents/GitHub/jathan-carr09.github.io/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

parts = content.split('---', 2)
if len(parts) >= 3:
    frontmatter = f"---{parts[1]}---\n"
    html_content = parts[2]
else:
    frontmatter = ""
    html_content = content

soup = BeautifulSoup(html_content, "html.parser")

# 1. Remove Emojis from icons
for span in soup.find_all("span", class_=["skill-icon", "contact-icon"]):
    span.decompose()

# 2. Add Modal Attributes to Skills
for card in soup.find_all("div", class_="skill-card"):
    title_el = card.find("div", class_="skill-name")
    desc_el = card.find("div", class_="skill-desc")
    if title_el and desc_el:
        title = title_el.text.strip()
        desc = desc_el.text.strip()
        card["data-title"] = title
        card["data-meta"] = "Skill Acquired & Refined at ASCTE"
        card["data-details"] = f"{desc} \n\nI initially learned this through hands-on coursework and later expanded my knowledge through independent projects and problem-solving assignments. I ensure best practices and a continuous deep understanding of the underlying principles."
        classes = card.get("class", [])
        if "modal-trigger" not in classes:
            classes.append("modal-trigger")
        card["class"] = classes

# 3. Add Modal Attributes to Projects
projects_meta = [
    ("Fall 2024", "Built over 3 months as part of an advanced robotics initiative..."),
    ("Spring 2024", "Modeled over 50 hours in CAD before committing to a 3D print..."),
    ("Winter 2023", "Tested rigorously using flow-dynamics simulations..."),
    ("Fall 2023", "Evaluated environmental constraints over 6 weeks..."),
    ("Spring 2025", "Used locally at ASCTE to verify network integrity..."),
    ("Summer 2024", "Implemented during the peak sales season to handle daily multi-thousand dollar inventory flow..."),
    ("Winter 2024", "Soldered and assembled by hand in the hardware lab..."),
    ("Fall 2024", "Conducted A/B testing with a focus group of students..."),
    ("Ongoing", "Continually updated to reflect my latest learning and aesthetic preferences..."),
    ("Spring 2024", "Utilized distributed processing concepts learned in cyber class..."),
    ("Fall 2023", "Wired with custom C++ logic for interrupt handling..."),
    ("Summer 2024", "Sourced individual keyboard switches and learned advanced PCB soldering techniques...")
]

for idx, card in enumerate(soup.find_all("div", class_="project-card")):
    title_el = card.find("div", class_="project-title")
    desc_el = card.find("p", class_="project-desc")
    if title_el and desc_el:
        title = title_el.text.strip()
        desc = desc_el.text.strip()
        meta = projects_meta[idx][0] if idx < len(projects_meta) else "2024"
        detail_extra = projects_meta[idx][1] if idx < len(projects_meta) else "A highly demanding project showcasing analytical skills."
        
        card["data-title"] = title
        card["data-meta"] = meta
        card["data-details"] = f"{desc}\n\nProject Context:\n{detail_extra} I tackled various implementation challenges, requiring deep focus and iterative problem solving. I successfully delivered the project ahead of schedule, ensuring robust functionality and maintainability."
        classes = card.get("class", [])
        if "modal-trigger" not in classes:
            classes.append("modal-trigger")
        card["class"] = classes

# 4. Add modal HTML right before the <script>
modal_html = """
<!-- ═══════════════ MODAL ═══════════════ -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal-content" id="modalContent">
    <button class="modal-close" id="modalClose">✕</button>
    <div class="modal-body" id="modalBody">
      <h3 class="modal-title" id="mTitle"></h3>
      <div class="modal-meta" id="mMeta"></div>
      <div class="modal-desc" id="mDesc"></div>
    </div>
  </div>
</div>
"""
script_tag = soup.find("script")
if script_tag:
    mb = BeautifulSoup(modal_html, "html.parser")
    script_tag.insert_before(mb)

# Write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(frontmatter + str(soup))
