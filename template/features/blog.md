# Blog

Simple dated posts. News, stories, seasonal notes. **Off by default.**

> **Not built yet.** The flag exists, but the template has no blog pages or Markdown renderer yet: turning it on shows nothing. If the owner asks for it, say so plainly and offer to build it as its own change (a real piece of work, previewed like any other). Never tell the owner it's on.

## How to turn it on/off

Flag: `blog` in `site.config.json`. Posts are Markdown files in `content/blog/` (filename: `YYYY-MM-DD-slug.md`), rendered to `/blog/` pages at build time.

Turn it on only if the owner will actually write. A blog with three posts from 2024 is worse than no blog: it advertises neglect. Ask directly: "Will you publish at least monthly? If not, skip it."

## Writing posts

- Front matter: title, date, one-line description. The body is plain Markdown.
- Posts are the owner's voice, or ghostwritten from their dictation and approved by them. Never publish AI-written posts as the owner's words without their review.
- One good photo per post beats none. Same image rules as the gallery.

## What it costs

Nothing extra. It's files in the repo, built statically. No CMS, no database, no admin login to maintain.

## What can go wrong

- Stale blog (see above). If the owner stops writing for six months, suggest turning the feature off rather than displaying a graveyard. Frame it kindly: "Your site looks more alive without the blog link right now. We can bring it back in a minute whenever you want."
