# Developing Quiet Signal

How to run, test, edit and publish the site, plus the privacy and security choices behind it. Back to the [README](../README.md).

## 1. Run it on your computer

You need **Node.js 22.12 or newer** (`node -v` to check; install from nodejs.org if needed).

```bash
npm install            # once, downloads dependencies into node_modules/
npm run dev            # starts the site at http://localhost:4321
```

Edit any file and the browser updates by itself. Press `Ctrl+C` to stop.

Astro collects anonymous usage statistics by default. Turn that off once:

```bash
npx astro telemetry disable
```

## 2. Test it

```bash
npm test               # unit tests (about 40, runs in under a second)
npm run build          # builds the real site into dist/
npm run preview        # serves dist/ at http://localhost:4321 to check the built version
npm run check:privacy  # scans everything for personal info and secrets
npm run verify         # all of the above checks in one go; run before every push
```

### What the tests check

| File | What it protects |
| --- | --- |
| `tests/alerts.test.ts` | Dashboard filtering, sorting and input cleaning; that the synthetic data only uses documentation IP ranges and example domains |
| `tests/explore.test.ts` | Search and filters on the Projects and Research pages |
| `tests/content.test.ts` | Honesty rules: every skill states its basis, the degree can't show as completed unless you say so, planned pages say they aren't built, no contact details in the site config |

If a test fails, the message names the file and what was expected. Fix the content or code, not the test, unless the rule itself should change.

## 3. How the project is laid out

```
src/
  config/site.ts          Site name, navigation, footer text. No personal details live anywhere else.
  data/
    skills.ts             Skills, each with a level (applied/explored/learning) and its basis
    experience.ts         Work history
    education.ts          Degree and its status setting
    alerts.ts             The 18 synthetic alerts for the SOC lab
  content/
    projects/*.md         One Markdown file per project
    research/*.md         One Markdown file per write-up
  lib/
    alerts.ts             Dashboard logic (filter, sort, clean input)
    explore.ts            Search and filter logic for project and research lists
    evidence.ts           The evidence labels and what each one means
  components/             Reusable pieces: dashboard, explorer, diagrams, evidence tag
  layouts/Base.astro      Page shell: header, footer, security policy
  pages/                  One file per page; the file path is the URL
  styles/global.css       Colors, fonts and base styles
tests/                    Automated tests
scripts/privacy-scan.mjs  The privacy scanner
```

## 4. Common edits

**Add a project.** Copy a file in `src/content/projects/`, rename it (the name becomes the URL), and edit the top section:

```yaml
---
title: My new project
summary: One or two sentences.
status: in-progress    # completed | in-progress | explored | planned | simulated
order: 6               # position in lists
tags: [SIEM, detection]
tools: [Wazuh]
---
```

The build stops with a clear error if a field is missing or misspelled. Write-ups in `src/content/research/` work the same way, with `kind` and `date` (`YYYY-MM`) instead of `order` and `tools`.

**Promote a skill.** In `src/data/skills.ts`, change `level` from `'learning'` to `'applied'` only when you've used it for real, and update `basis` to say where.

**Update the degree.** In `src/data/education.ts`, set `degreeStatus` to `'completed'` and `conferredYear` to the year only once the degree is conferred. Use `'in-progress'` if you're still enrolled. Right now it's `'unconfirmed'`, which shows the program and dates without claiming either.

**Screenshots.** Put them in `public/images/`. Before adding one:

1. Blur or crop hostnames, IP addresses, usernames, file paths, browser tabs and taskbars.
2. Strip metadata: on Windows, Properties > Details > "Remove properties and personal information"; on macOS, export a copy from Preview. The privacy scan fails on images that still carry metadata.

## 5. Privacy checks

The site's `.gitignore` keeps these out of git: `node_modules/`, `dist/`, `.env` files, keys, every `.pdf`, and `privacy-denylist.txt`.

**Set up your private denylist (once):**

```bash
cp privacy-denylist.example.txt privacy-denylist.txt
```

Then fill it with your real name, phone number in every format, personal emails, street and usernames from other sites. The scanner checks every file, the built site and every commit ever made for those terms. The list itself is ignored by git, so it can't leak.

**What the scanner flags:**

- Email addresses, except GitHub noreply and `example` domains
- Phone numbers
- API keys and tokens
- `.env` files
- Image metadata
- PDFs
- Commit emails that aren't GitHub noreply addresses
- Any denylisted term, in current files or in history

## 6. Source control: set this up before your first commit

Commits permanently record a name and email. Get this right before the first one.

1. **Create a separate GitHub account** for the project name. Use an email address that isn't your main personal one.
2. In GitHub, go to **Settings > Emails** and turn on both **Keep my email addresses private** and **Block command line pushes that expose my email**. Copy the address shown, which looks like `12345678+quietsignal@users.noreply.github.com`.
3. In the project folder:

   ```bash
   git init
   git config user.name "Quiet Signal"
   git config user.email "12345678+quietsignal@users.noreply.github.com"   # yours from step 2
   git config user.name && git config user.email                             # double-check
   npm run verify
   git add .
   git status            # read the list: no PDFs, no denylist, no .env
   git commit -m "Initial site"
   ```

   `git config` without `--global` applies only to this folder, so your other projects keep their own settings.
4. **Create the repository** on the alias account. Choose **Private**, and don't add a README or license (you already have them). Then push:

   ```bash
   git remote add origin https://github.com/<alias-account>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

5. Check the **Actions** tab: the **Checks** workflow runs tests, the build, the privacy scan and gitleaks on every push.

**If something personal does get committed,** deleting it in a new commit isn't enough, because the old commit still has it. Before the repo is ever public, the simplest fix is to delete the repository on GitHub, remove the `.git` folder locally, and start again from step 3. Rotate any password or key that was exposed.

## 7. Publishing safely

**Hosting and visibility facts (checked October 2026):**

- On a **free** GitHub account, Pages only works from a **public** repository, so anyone can read your source code and full commit history.
- **GitHub Pro** (paid) allows Pages from a **private** repository. The source stays hidden, but **the website itself is still public**.
- Only **GitHub Enterprise Cloud** can make a Pages site private, which doesn't fit a resume site you want employers to see.
- Either way, everything in `dist/` (HTML, CSS, JavaScript, the alert data) is readable by anyone who views the site.

So: keep the repo private while you build. When you're ready, either make it public on the free plan after a final audit, or pay for Pro to keep source private. A public repo is normal for portfolios, and recruiters often look at the code.

**Before you publish, check every item:**

- [ ] `npm run verify` passes with your denylist in place
- [ ] Read every page in `npm run preview`, including the footer and page titles
- [ ] `git log --format='%an <%ae>'` shows only the alias and noreply address
- [ ] No screenshots contain hostnames, IPs, usernames or other people's information
- [ ] Degree status in `src/data/education.ts` is correct
- [ ] Every "Explored" label is still accurate, and you can talk through each item in an interview

**Then publish:**

1. Repo **Settings > Pages > Build and deployment > Source**: choose **GitHub Actions**.
2. **Actions** tab > **Deploy** > **Run workflow**. Deploys only happen when you start them, never automatically.
3. The site appears at `https://<alias-account>.github.io/<repo-name>/`. If you name the repository `<alias-account>.github.io`, it's at the root URL instead. The workflow handles either case.

### Using your own domain

1. Buy the domain and turn on WHOIS privacy (often called domain privacy or redaction).
2. Verify it on GitHub first, to prevent takeover: profile **Settings > Pages > Add a domain**. Add the TXT record GitHub shows at your registrar and click Verify.
3. At your registrar, add DNS records:
   - Four `A` records for the bare domain (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record: `www` pointing to `<alias-account>.github.io`
   - No wildcard (`*`) records
4. Repo **Settings > Secrets and variables > Actions > Variables**: add `CUSTOM_DOMAIN` with your domain, e.g. `quietsignal.dev`. The deploy workflow then builds links for the domain.
5. Repo **Settings > Pages > Custom domain**: enter the domain and save. Once it shows as working, tick **Enforce HTTPS** (it can take up to 24 hours to become available).
6. Run the **Deploy** workflow again.

No `CNAME` file is needed, because this project publishes with GitHub Actions.

## 8. Remaining privacy risks

The project name keeps your contact details off the page. It does not make you anonymous. In particular:

- **Your résumé details narrow things down.** Employer, school, job titles and years together could identify you to someone who searches for them. That's the trade-off of an honest resume. To reduce it, you could show "A national electronics retailer's tech support team" instead of the company name, or the school's region instead of its name. Edit `src/data/experience.ts` and `src/data/education.ts`.
- **GitHub knows who you are.** The account's email, any payment details for Pro, and the IP addresses you push from are visible to GitHub, though not to the public.
- **GitHub Pages keeps visitor logs.** That's outside the site's control, and the site's "About" page says so.
- **Commit times show your time zone** and when you work.
- **Linking the site from job applications or LinkedIn connects it to you.** That's usually the point, but it's permanent once someone has seen both.
- **Writing style and project specifics** can be matched to your other accounts.
- **Search engines and archive sites** may keep copies after you change or remove something.

## 9. Adding a resume download (optional)

Only do this with a file you've approved:

1. Make a version with no phone number, personal email or street address, and remove the document's metadata (author name) when exporting.
2. Save it as `public/approved-resume.pdf`.
3. Add `'public/approved-resume.pdf'` to `APPROVED_FILES` in `scripts/privacy-scan.mjs`.
4. Set `resumeFile: 'approved-resume.pdf'` in `src/config/site.ts`, and update the matching test in `tests/content.test.ts`.
5. In `.gitignore`, add the line `!public/approved-resume.pdf` under `*.pdf` so this one file can be committed.

A download link then appears on the Education page.

## 10. Security choices, for interviews

These are worth being able to explain:

- **Content-Security-Policy** (`src/layouts/Base.astro`): only same-origin scripts, styles, fonts and images; no inline code; no outbound connections; no form submissions. This limits damage even if something malicious got into the content.
- **No `innerHTML`.** The dashboard builds every element with `textContent`, so data can never be interpreted as markup.
- **Input cleaning.** Search input is type-checked, stripped of control characters and length-capped (`sanitizeQuery` in `src/lib/alerts.ts`).
- **Self-hosted fonts and no external services**, so visitors' browsers never contact a third party.
- **`referrer` policy `no-referrer`**, so clicking an outside link doesn't tell that site where the visitor came from.
- **Synthetic data hygiene.** IPs come from RFC 5737 documentation ranges and domains from RFC 2606 example names, and a test enforces both.
