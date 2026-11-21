# Backlog

Follow-up requests (completed items checked):

- [x] Add album-page links to record-level dashboard components. Record of the day and Upgrade candidates now link to the owned copy's album page (`#copy-N`), like latest acquisitions.
- [ ] Decide whether aggregate dashboard widgets (labels, months, years, source/condition, top artists) should link anywhere, e.g. a filtered album index.
- [x] Add an alphabet picker for easier navigation on the all-albums index. A QWERTY-shaped picker hides artist groups whose initial doesn't match the bracketed letter; none is selected by default, and clicking the selected letter clears it.
- [x] Match new widget and page text sizes to the existing dashboard. Latest acquisitions, shared navigation, album index, and album details now use browser-default monospace sizing and normal line spacing.
- [x] Year picker on the album index: a two-tier decade/year selector beside the QWERTY picker that regroups the list by year (README has the details).
- [ ] Make album-page prev/next follow the view you came from (artist order, a letter, or a year bin).
- [ ] Enlarge the font for iPhone viewing.
- [~] Avoid horizontal scrollbars for long artist/title headings and framed rules. Done: the 46 artist credits over 70 characters now have singleton entries in `data/artist-groups.json` (edit or merge them freely), and long titles and names are shortened at the first comma, slash or paren, or hard at the limit, in a 74-column slot (`shorten()` in `src/lib/text.js`): album-page headings (title first, then artist), album-index rows (66 columns) and dividers (70). A title may run past the slot when shortening would make it indistinguishable from a sibling (only the two Blackhawk Saturday volumes do today). Remaining: the homepage monthly bars (up to 83 columns) scroll inside their widget but could be capped at the frame width.
