## Backstory
I like listening to well-known stories when I fall asleep, and one of
my favorite collections is the Sherlock Holmes stories as read by
David Clarke on Librivox.  I used to listen to them on the Librivox
app on iOS and then Android, but I ran into several problems:
- I wanted a random story, which the app couldn't od.
- I would often leave it on all night, and wake up to a different
story. However there are some Holmes stories I find disturbing for
bedtime, like "The Five Orange Pips" or "The Speckled Band".
- The Librivox app on Android in particular requires too many clicks.


## This app
This app has a list of stories from the Adventures, Memoirs, and
Return of Sherlock Holmes, with my few nonfavorites separated off
towards the bottom.  I can click on any story title to play it
directly from Librivox, or press the + button next to the title to add
it to the playlist.  I can also press the "Random" button to select a
random story from the list, or "Shuffle" to add a shuffled list of all
the stories to the playlist.

There are a few stories, like "The Priory School", that come in two
parts; the player should combine them and play Part II directly after
Part I.  The two-part stories are marked with an * at the end.

## Modifying the code
I have aspirations of making this a bit more generic, usable for other
collections of stories.  If you'd like to adapt it, here is a bit of
an explainer of the structure:
- `index.js` is the main code.  It should largely stay the same, except
for the first line.
- `Holmes/holmes.js defines a class called `Source` which is used to
define a particular list of stories.  It returns a list `of `Source`'
called `sources`.  It parses Holmes/list.js to produce this.
- `Holmes/list.js` is the list of stories imported by
`Holmes/holmes.js`.  It exports one list for each collection,
starting with the URL pattern pointing to the stories (with an `@` in
them which is replaced by the number of story), followed by the titles
of the stories.  The first character in each name is either a `*` if
it is a normal story, a `-` if it is a "disturbing" story, and `^` if
it is the second part of the story listed above it.

Anyway, hope you like it.  Drop me a line if you have suggestions, if 
you'd like a version for a different story collection, or just
generally if you find this interesting at all. :) 

