# Chelsea Anichebe — Portfolio

Professional portfolio for Chelsea Anichebe  
**Executive Assistant | Administrative & Operations Support | Project Coordination**

## Stack

- Static HTML / CSS / JavaScript
- [Decap CMS](https://decapcms.org/) (Git-backed content management)
- Designed for deployment on **Netlify**

## Local preview

Serve the folder with any static server so `fetch()` can load JSON files, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the URL shown (do not open `index.html` as a `file://` URL).

## Content management (CMS)

After the site is deployed to Netlify:

1. Enable **Netlify Identity** (Invite only).
2. Enable **Git Gateway** under Identity → Services.
3. Invite your email under Identity → Invite users.
4. Visit `https://YOUR-SITE.netlify.app/admin/`
5. Log in with the invite link / password.
6. Edit collections and click **Publish**. Changes commit to GitHub and Netlify redeploys.

### Collections

| Collection | File | What you manage |
|---|---|---|
| Site Settings | `content/settings.json` | Hero, About, section headings, email, LinkedIn, Upwork, resume, footer |
| Service Strip | `content/service-strip.json` | Top bar items |
| Services | `content/services.json` | Service list |
| Projects | `content/projects.json` | Portfolio projects, images, descriptions |
| Testimonials | `content/testimonials.json` | Client testimonials (expandable cards) |
| Fun Facts | `content/funfacts.json` | Fun facts |
| Tools & Skills | `content/tools.json` | Tool tags |
| Certificates | `content/certificates.json` | Certificates, images, links |

Media uploads go to the `uploads/` folder.

## Notes

- Testimonials are fully CMS-driven. Add as many as you need; cards expand in place on click.
- One initial testimonial is marked **Placeholder / Demo** — replace it when you have a real quote.
- Do not hard-edit content in `index.html` for sections managed by the CMS; use `/admin/` instead.
