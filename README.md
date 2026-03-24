# Jathan Carr — Portfolio

A personal portfolio website built with Jekyll, featuring a black and gold aesthetic. Hosted on GitHub Pages.

## 🚀 Quick Setup Guide

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **+** icon → **New repository**
3. Name it exactly: `YOUR_USERNAME.github.io`  
   *(Replace YOUR_USERNAME with your actual GitHub username, e.g. `jathancarr.github.io`)*
4. Set it to **Public**
5. Click **Create repository**

### Step 2: Upload the Portfolio Files

**Option A — GitHub Desktop (Easiest):**
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Clone your new repository to your computer
3. Copy all these portfolio files into the cloned folder
4. In GitHub Desktop: add a commit message like "Initial portfolio" and click **Commit to main**
5. Click **Push origin**

**Option B — Command Line:**
```bash
cd portfolio  # navigate to this folder
git init
git add .
git commit -m "Initial portfolio"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow file (`.github/workflows/deploy.yml`) will handle everything automatically

### Step 4: Visit Your Site!

After the first push, your site will be live at:
```
https://YOUR_USERNAME.github.io
```

It takes about 1–3 minutes to build the first time. You can watch the progress under the **Actions** tab in your repo.

---

## ✏️ Customizing Your Site

### Change Your Info
Edit `_config.yml` to update your name, email, phone, location, and school.

### Update Content
Edit `index.html` to change any text in any section.

### Add a New Project
Create a new file in the `_projects/` folder:
```markdown
---
title: My New Project
tags: [Python, Hardware]
---

Description of my project goes here.
```

### Change Colors
Edit `assets/css/main.scss` and modify the `:root` variables at the top.

---

## 🛠️ Local Development (Optional)

If you want to preview changes before pushing:

```bash
# Install Ruby & Jekyll
gem install bundler jekyll

# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Open http://localhost:4000
```

---

Built with ❤️ using [Jekyll](https://jekyllrb.com/) and [GitHub Pages](https://pages.github.com/).
