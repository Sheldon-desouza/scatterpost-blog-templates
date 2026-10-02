# Demo content image sources

All cover photos are free to use under the Unsplash Licence
(https://unsplash.com/license), confirmed by fetching each photo's own
page on unsplash.com and checking its "Free Photo on Unsplash" title
and licence line. No photo shows a person's face as the subject.

| Post slug | Photo page | Photographer | Image URL used |
|---|---|---|---|
| canonical-url-explained | https://unsplash.com/photos/person-using-macbook-pro-npxXWgQ33ZQ | Glenn Carstens-Peters (@glenncarstenspeters) | https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=70&auto=format&fit=crop |
| cross-posting-checklist | https://unsplash.com/photos/laptop-computer-on-glass-top-table-hpjSkU2UYSU | Carlos Muza (@kmuza) | https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=70&auto=format&fit=crop |
| writing-for-ai-assistants | https://unsplash.com/photos/white-spiral-notebook-on-brown-wooden-table-2q_frVRXWfQ | Kelly Sikkema (@kellysikkema) | https://images.unsplash.com/photo-1612367980327-7454a7276aa7?w=1600&q=70&auto=format&fit=crop |
| weekly-publishing-rhythm | https://unsplash.com/photos/macbook-pro-on-top-of-brown-table-1SAnrIxw5OY | Kari Shea (@karishea) | https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&q=70&auto=format&fit=crop |
| search-console-bing-setup | https://unsplash.com/photos/macbook-pro-near-white-open-book-FHnnjk1Yj7Y | Nick Morrison (@nickmorrison) | https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1600&q=70&auto=format&fit=crop |
| hello-from-scatterpost-demo | https://unsplash.com/photos/gray-and-black-laptop-computer-on-white-table-RaYjMmmaSCA | Alexa Williams (@glamorousplanning) | https://images.unsplash.com/photo-1558478551-1a378f63328e?w=1600&q=70&auto=format&fit=crop |

This same table applies to all three templates that use these six demo
posts (developer, magazine, minimal): the posts and their cover photos
are identical across the three, copied into each template's own
`demo-content/posts/`. Each post's body credits its photographer with a
link to their Unsplash profile and to the photo's own page, both opened
with `target="_blank"` (this template's `render-markdown.ts` forces
`rel="noopener noreferrer"` onto any link with a `target`).

The changelog template's demo entries carry no images (see its own
`demo-content/posts/`): they are derived from internal release notes
drafts, not photographed events, so an illustrative stock photo would
misrepresent them rather than describe them.
