# WriteAlive: Snapshot Management User Guide

**Version**: 0.1.0 (Phase 3)
**Last Updated**: 2025-11-01

---

## Overview

WriteAlive's **Snapshot Management** feature lets you save point-in-time versions of your documents, track changes over time, and restore previous versions easily.

Think of snapshots as "save points" in your writing journey - you can always go back to any saved version without losing your current work.

---

## Quick Start

### Creating Your First Snapshot

1. Open any document in Obsidian
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac) to open command palette
3. Type "snapshot"
4. Select **"WriteAlive: Create Snapshot"**
5. You'll see a success message: "Snapshot created - Snapshot MM/DD/YYYY HH:MM:SS"

That's it! Your document's current state is now saved.

---

## Features

### 1. Create Snapshots

Save the current state of your document with a single command.

**How to Use**:
- Open command palette (`Ctrl+P` / `Cmd+P`)
- Select **"WriteAlive: Create Snapshot"**
- Snapshot created automatically with timestamp

**When to Create Snapshots**:
- Before major edits or rewrites
- After completing a significant section
- Before using AI features (auto-snapshot)
- When you want to experiment without losing current version

**Snapshot Naming**:
- Currently: Auto-generated names with timestamp
- Format: "Snapshot MM/DD/YYYY HH:MM:SS"
- Future: Custom naming will be added

---

### 2. View All Snapshots

See all saved versions of your document in one place.

**How to Use**:
- Open command palette
- Select **"WriteAlive: List Snapshots"**
- Modal window opens showing all snapshots

**What You'll See**:
```
📷 Snapshot 11/01/2025 10:30:00
   Nov 1, 2025 10:30 AM
   500 words, 5 paragraphs
   3 centers, Wholeness: 7.5/10
   👤 Manual
   [Restore] [Delete]
```

**Snapshot Information**:
- **Name**: Auto-generated or custom
- **Timestamp**: When snapshot was created
- **Word Count**: Number of words at that time
- **Paragraph Count**: Number of paragraphs
- **Centers**: Number of identified structural centers (if analyzed)
- **Wholeness Score**: Document quality score (if analyzed)
- **Source**: Manual (you created it) or Auto (AI created it)

**Sorting**:
- Snapshots are always sorted by newest first
- Most recent snapshot at the top

---

### 3. Restore Snapshots

Go back to any previous version of your document.

**How to Use**:

**Option A: From Snapshot List**
1. Open **"List Snapshots"** from command palette
2. Find the snapshot you want to restore
3. Click **[Restore]** button
4. Confirm in the dialog
5. Done! Your document is restored

**Option B: Quick Restore Latest**
1. Open command palette
2. Select **"WriteAlive: Restore Latest Snapshot"**
3. Most recent snapshot is restored immediately

**Important Notes**:
- ⚠️ Restoring replaces your current content
- ✅ A backup snapshot is created automatically before restore
- ✅ You can always undo by restoring the backup
- ✅ Nothing is permanently lost

**Example Workflow**:
```
1. Original content → Create snapshot "A"
2. Edit content → Create snapshot "B"
3. Edit more → Unhappy with changes
4. Restore snapshot "A"
   → Backup "Backup before restore to A" created automatically
   → Content reverts to "A"
5. If you want the edits back: Restore snapshot "B"
```

---

### 4. Delete Snapshots

Remove old snapshots you no longer need.

**How to Use**:
1. Open **"List Snapshots"**
2. Find snapshot to delete
3. Click **[Delete]** button
4. Confirm in the dialog
5. Snapshot is permanently removed

**When to Delete**:
- When you have too many snapshots (>10)
- When a snapshot is no longer useful
- To free up storage space

**Important Notes**:
- ⚠️ Deletion is permanent - cannot be undone
- ⚠️ Confirmation dialog will warn you
- ✅ Other snapshots remain safe

**Performance Tip**:
- WriteAlive will warn you if you have >10 snapshots
- Consider deleting old snapshots periodically
- Too many snapshots can slow down document loading

---

## Commands Reference

All commands accessible via command palette (`Ctrl+P` / `Cmd+P`):

| Command | Description | Shortcut |
|---------|-------------|----------|
| **WriteAlive: Create Snapshot** | Save current document state | None (yet) |
| **WriteAlive: List Snapshots** | View all snapshots in modal | None (yet) |
| **WriteAlive: Restore Latest Snapshot** | Restore most recent snapshot | None (yet) |

*Future versions will add keyboard shortcuts for these commands.*

---

## Storage Details

### Where Are Snapshots Stored?

Snapshots are stored in two places:

1. **Metadata** (in document frontmatter):
   ```yaml
   ---
   title: My Document
   writeAlive:
     snapshots:
       - id: snap-1730476200000-abc123
         name: Snapshot 11/01/2025 10:30:00
         timestamp: 2025-11-01T10:30:00.000Z
         wordCount: 500
         paragraphCount: 5
         wholenessScore: 7.5
         centerCount: 3
         source: manual
   ---
   ```

2. **Content** (in `.writealive/` folder):
   ```
   .writealive/
   └── snapshots/
       └── My Document/
           ├── snap-1730476200000-abc123.md
           ├── snap-1730479800000-def456.md
           └── ...
   ```

### Why Two Places?

- **Frontmatter**: Lightweight metadata for quick access
- **Separate files**: Full content to avoid bloating frontmatter
- **Benefits**: Fast loading + complete history

### Backup Strategy

**What's Backed Up**:
- Full document content (including frontmatter)
- All metadata (centers, wholeness analysis, etc.)
- Document statistics at that point in time

**What's NOT Backed Up**:
- Embedded images (only image links)
- Attachments (only attachment links)
- Plugin settings

**Recommendation**:
- Use snapshots for version control within documents
- Use git/Obsidian Sync for full vault backup
- Snapshots complement, not replace, vault backup

---

## Use Cases

### 1. Experiment Safely

**Scenario**: You want to try a major rewrite but aren't sure it'll work.

**Workflow**:
1. Create snapshot before changes
2. Experiment freely
3. If it works: Keep changes, create new snapshot
4. If it doesn't: Restore previous snapshot

### 2. Track Writing Progress

**Scenario**: You want to see how your writing evolved over time.

**Workflow**:
1. Create snapshot at each major milestone
2. Review snapshots to see progression
3. Compare word counts and wholeness scores
4. Identify what worked and what didn't

### 3. Recover from Mistakes

**Scenario**: You accidentally deleted important paragraphs.

**Workflow**:
1. Open "List Snapshots"
2. Find last good snapshot
3. Restore it
4. Your work is back!

### 4. A/B Testing

**Scenario**: You have two different approaches to a section.

**Workflow**:
1. Write approach A
2. Create snapshot "Approach A"
3. Replace with approach B
4. Create snapshot "Approach B"
5. Get feedback on both
6. Restore the better one

### 5. Before AI Operations

**Scenario**: You're about to use AI to expand a section.

**Workflow**:
1. Plugin creates auto-snapshot (before AI operation)
2. AI makes changes
3. If you like it: Keep changes
4. If not: Restore auto-snapshot

---

## Tips & Best Practices

### When to Create Snapshots

✅ **Do create snapshots**:
- Before major edits or rewrites
- After completing a section
- Before experimenting with new ideas
- When you're happy with current state
- Before using AI features

❌ **Don't create snapshots**:
- After every tiny change (too many snapshots)
- When you're in the middle of editing
- Just for backup (use vault backup for that)

### Snapshot Management

**Good Practice**:
- Keep 5-10 meaningful snapshots per document
- Delete old snapshots when they're no longer useful
- Use descriptive names (future feature)
- Review snapshots periodically

**Warning Signs**:
- >10 snapshots: Consider cleanup
- >20 snapshots: Definitely cleanup
- Console warnings: Performance impact

### Naming Strategy (Future)

When custom naming is added:
- Use version numbers: "Draft v1", "Draft v2"
- Use milestones: "After intro", "Before revision"
- Use dates: "Nov 1 morning draft"
- Use purpose: "Before AI expansion"

---

## Troubleshooting

### "No active file" Error

**Problem**: Command shows "WriteAlive: No active file"

**Solution**:
- Make sure a document is open and active
- Click inside the editor pane
- Try command again

### "No snapshots available" Error

**Problem**: Restore Latest shows "No snapshots available"

**Solution**:
- Create a snapshot first
- Use "Create Snapshot" command
- Then try restore again

### Snapshots Not Showing in List

**Problem**: List Snapshots shows empty state

**Possible Causes**:
1. No snapshots created yet → Create one
2. Wrong file open → Open correct file
3. Corrupted frontmatter → Check YAML syntax

**Solution**:
- Check file's frontmatter for `writeAlive.snapshots`
- Verify `.writealive/snapshots/[filename]/` folder exists
- Check console for errors

### Restore Doesn't Work

**Problem**: Content doesn't change after restore

**Possible Causes**:
1. Snapshot content missing
2. File permissions issue
3. Obsidian cache issue

**Solution**:
1. Check console for errors
2. Check `.writealive/snapshots/` folder exists
3. Restart Obsidian
4. Re-create snapshot

### Performance Issues

**Problem**: Modal opens slowly, document loads slowly

**Cause**: Too many snapshots (>10)

**Solution**:
1. Delete old snapshots
2. Keep only recent/important ones
3. Aim for <10 snapshots per document

---

## FAQ

### How many snapshots can I create?

**No hard limit**, but we recommend:
- **Optimal**: 5-10 snapshots per document
- **Warning**: >10 snapshots (console warning)
- **Maximum**: Unlimited (but performance impact)

### Do snapshots increase file size?

**Frontmatter**: Yes, slightly (metadata only, ~200 bytes per snapshot)
**Separate files**: Yes, in `.writealive/` folder (full content per snapshot)
**Overall**: About 2-5 KB per snapshot (depending on document size)

### Are snapshots synced?

**If using Obsidian Sync**: Yes
**If using iCloud/Dropbox/Git**: Yes (if you sync `.writealive/` folder)
**If using nothing**: No (local only)

**Recommendation**: Include `.writealive/` in your sync/backup

### Can I restore snapshots from other documents?

**No**: Each document's snapshots are independent
**Workaround**: Copy content manually between documents

### What happens if I rename my document?

**Frontmatter**: Stays with document (automatically)
**Snapshot files**: Remain in old folder name
**Fix**: Snapshots still work (loaded by ID, not filename)

### Can I edit snapshots manually?

**Not recommended**: Snapshots should be read-only
**If you must**: Edit `.writealive/snapshots/[filename]/[id].md` directly
**Risk**: May break snapshot integrity

### Do snapshots include images?

**Image links**: Yes (markdown links preserved)
**Image files**: No (only links, not actual images)
**Recommendation**: Use vault backup for full media backup

---

## Keyboard Shortcuts (Future)

These shortcuts will be added in a future version:

| Action | Shortcut (Windows/Linux) | Shortcut (Mac) |
|--------|-------------------------|----------------|
| Create Snapshot | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| List Snapshots | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Restore Latest | `Ctrl+Shift+R` | `Cmd+Shift+R` |

*Currently: Use command palette for all commands*

---

## Privacy & Security

### Data Storage

- ✅ **All local**: Snapshots stored in your vault only
- ✅ **No cloud**: No data sent to external servers
- ✅ **No telemetry**: No usage tracking
- ✅ **Your control**: You own all snapshot data

### Permissions

WriteAlive only accesses:
- Files you explicitly work with
- `.writealive/` folder (created automatically)
- YAML frontmatter (for metadata)

WriteAlive does NOT:
- Access other plugins' data
- Modify non-WriteAlive files without permission
- Send data externally
- Track your usage

---

## What's Next?

### Planned Features (Future Phases)

**Phase 4 - Enhanced UI**:
- [ ] Diff view (compare snapshots visually)
- [ ] Custom snapshot naming
- [ ] Snapshot search/filter
- [ ] Bulk operations (delete multiple)
- [ ] Keyboard shortcuts

**Phase 5 - AI Integration**:
- [ ] AI-suggested snapshot names
- [ ] Auto-snapshot before AI operations
- [ ] Snapshot recommendations

**Phase 6 - Analytics**:
- [ ] Writing progress visualization
- [ ] Snapshot timeline
- [ ] Wholeness score trends
- [ ] Export snapshot history

---

## Support

### Getting Help

**Documentation**:
- This user guide
- README.md
- PHASE3-IMPLEMENTATION-SUMMARY.md

**Issues**:
- GitHub Issues (if applicable)
- Obsidian community forums
- Plugin settings → Report Issue

**Logs**:
- Open Developer Console (`Ctrl+Shift+I`)
- Check for `[WriteAlive]` messages
- Include logs when reporting issues

---

## Credits

**WriteAlive Plugin**
- Developer: [Your Name]
- Version: 0.1.0
- License: MIT

**Powered by**:
- Obsidian Plugin API
- TypeScript
- esbuild

**Inspired by**:
- Christopher Alexander's "The Nature of Order"
- Saligo Writing methodology
- Bill Evans' step-by-step mastery philosophy

---

**Happy Writing!** 🎉

If you find this feature useful, consider:
- ⭐ Starring the repository
- 📝 Sharing feedback
- 🐛 Reporting bugs
- 💡 Suggesting features

*WriteAlive: Transform your writing through generative sequences.*
