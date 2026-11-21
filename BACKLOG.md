# Backlog

Follow-up requests (completed items checked):

- [x] Add album-page links to record-level dashboard components. Record of the day and Upgrade candidates now link to the owned copy's album page (`#copy-N`), like latest acquisitions.
- [ ] Decide whether aggregate dashboard widgets (labels, months, years, source/condition, top artists) should link anywhere, e.g. a filtered album index.
- [x] Add an alphabet picker for easier navigation on the all-albums index. A QWERTY-shaped picker hides artist groups whose initial doesn't match the bracketed letter; none is selected by default, and clicking the selected letter clears it.
- [x] Match new widget and page text sizes to the existing dashboard. Latest acquisitions, shared navigation, album index, and album details now use browser-default monospace sizing and normal line spacing.
- [ ] Enlarge the font for iPhone viewing.
- [ ] Avoid horizontal scrollbars for long artist/title headings and framed rules; truncating displayed fields is acceptable if needed. Revisit after curating artist groups, which may shorten long credits. Leave current behavior unchanged for now.
  Measured on the Nov 16 export (78 columns is the design width; phones now size the font to fit it): 92 of 980 album-index dividers exceed it (max 161), 19 album-index rows (max 140), 119 album-page headings (max 253), and the homepage monthly bars (max 83). Plan: wrap album-page headings inside the frame, truncate divider and row titles with `…` (the full credit stays in the copy's Artist credit row), and cap the monthly bars. Over-wide items currently scroll inside their own box.
