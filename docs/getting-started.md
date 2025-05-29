# Getting Started with Realms & Reaches

> **Complete beginner's guide to creating your first realm data**

This guide will walk you through setting up Realms & Reaches and creating your first realm in just a few minutes.

## What You'll Learn

- How to install and enable the module
- Creating your first realm with drawing tools
- Adding tags to describe terrain and biome
- Basic realm management and organization
- Sharing and importing realm data

## Prerequisites

- Foundry VTT v13 or later
- GM permissions in your world
- A scene to work with (any size)

## Step 1: Installation

### Option A: From Foundry (Recommended)

1. **Open Foundry VTT** and navigate to your world
2. **Go to Add-on Modules** tab
3. **Click "Install Module"**
4. **Search for "Realms & Reaches"** or paste the manifest URL:
   ```
   https://github.com/rayners/fvtt-realms-and-reaches/releases/latest/download/module.json
   ```
5. **Click Install** and wait for download to complete
6. **Enable the module** in your world settings

### Option B: Manual Installation

1. **Download** the latest release from [GitHub](https://github.com/rayners/fvtt-realms-and-reaches/releases)
2. **Extract** the zip file to your `Data/modules/` directory
3. **Restart Foundry VTT**
4. **Enable the module** in your world settings

### Verification

After installation, you should see a new map icon in the left sidebar when viewing a scene. This is the Realms layer control.

## Step 2: Your First Realm

Let's create a simple forest region to get familiar with the tools.

### Open the Realms Layer

1. **Navigate to any scene** (the Canvas tab)
2. **Look for the map icon** in the left sidebar controls
3. **Click it** to activate the Realms layer

You should now see the Realms & Reaches toolbar with several drawing tools.

### Draw a Forest

1. **Select the Polygon tool** (first drawing tool)
2. **Click around the scene** to place points forming a rough forest shape
   - Start with 4-5 points for simplicity
   - Don't worry about precision - you can always edit later
3. **Right-click or press Enter** to complete the polygon
4. **You should see a blue-tinted region** appear on your map

Congratulations! You've drawn your first realm.

### Add Properties

Now let's make this region represent a forest:

1. **Double-click your realm** (or select it and click Properties)
2. **The Realm Properties dialog** opens
3. **Give it a name**: Type "Ancient Forest" in the name field
4. **Add forest tag**: 
   - Click in the tag input field
   - Type `biome:forest`
   - Press Enter or click the + button
5. **Add terrain tag**:
   - Type `terrain:dense`
   - Press Enter to add
6. **Add speed modifier**:
   - Type `travel_speed:0.75` (means 75% normal speed)
   - Press Enter to add
7. **Click Save**

Your realm now has meaningful game data! Notice how the tags are color-coded by type.

## Step 3: Understanding Tags

Tags are the heart of Realms & Reaches. They describe what makes each region unique.

### Tag Format

All tags follow the pattern `key:value`:
- `biome:forest` (the biome is forest)
- `terrain:dense` (the terrain is dense)
- `travel_speed:0.75` (travel speed is 75% of normal)

### Common Tag Types

| Tag Type | Purpose | Examples |
|----------|---------|----------|
| `biome:` | Ecosystem type | `forest`, `desert`, `mountain`, `swamp` |
| `terrain:` | Movement difficulty | `dense`, `sparse`, `rocky`, `smooth` |
| `climate:` | Weather patterns | `temperate`, `arctic`, `tropical` |
| `travel_speed:` | Speed modifier | `0.5` (slow), `1.0` (normal), `1.5` (fast) |
| `resources:` | Available materials | `timber`, `game`, `minerals`, `water` |
| `custom:` | Unique properties | `haunted`, `sacred`, `dangerous` |

### Tag Suggestions

The tag editor provides autocomplete suggestions:
- Start typing `bio` and see `biome:` suggestions
- Type `biome:` and see forest, desert, mountain options
- Common patterns are suggested based on what you type

## Step 4: More Drawing Tools

Try the other drawing tools to create different types of regions:

### Rectangle Tool

Perfect for:
- Urban districts
- Farmland areas  
- Structured zones

**How to use:**
1. Select Rectangle tool
2. Click one corner
3. Click the opposite corner
4. The rectangle is complete

### Circle Tool  

Great for:
- Points of interest
- Magical effect zones
- Blast areas
- Resource deposits

**How to use:**
1. Select Circle tool
2. Click the center point
3. Click where you want the edge
4. The circle is complete

### Advanced Polygon Shapes

For complex terrain:
- **Coastlines**: Follow the shore with many points
- **Mountain ranges**: Create jagged, irregular shapes
- **River valleys**: Long, curved regions following water

**Pro tip**: You can create overlapping realms! A mountain forest might have both `biome:forest` and `elevation:highland` tags.

## Step 5: Organizing Your Realms

As you create more realms, organization becomes important:

### Naming Convention

Use descriptive names that help you remember each region:
- "Northern Pine Forest"
- "Goblin Territory" 
- "Merchant Road - Safe"
- "Haunted Moor"

### Consistent Tagging

Develop patterns for your world:
- Always include a biome tag
- Use travel_speed consistently (0.5 = difficult, 1.0 = normal, 1.5 = easy)
- Add custom tags for story elements

### Layer Management

- **Select tool**: Click realms to select and view their properties
- **Properties button**: Edit the selected realm
- **Delete key**: Remove selected realms (with confirmation)

## Step 6: Practical Examples

Let's create a few different realm types to see the system in action:

### Desert Oasis

1. **Draw a small circle** in your scene
2. **Name it**: "Blessed Oasis"
3. **Add tags**:
   - `biome:oasis`
   - `climate:arid`
   - `resources:water`
   - `resources:food`
   - `travel_speed:1.25` (easy travel, good rest spot)

### Treacherous Mountains

1. **Draw an irregular polygon** with jagged edges
2. **Name it**: "Ironpeak Range"
3. **Add tags**:
   - `biome:mountain`
   - `terrain:rocky`
   - `elevation:highland`
   - `climate:arctic`
   - `travel_speed:0.4` (very slow)
   - `resources:minerals`
   - `custom:dangerous`

### Civilized Farmland

1. **Draw several rectangles** for field patterns
2. **Name them**: "Westbrook Farms", "Miller's Fields", etc.
3. **Add tags**:
   - `biome:cultivated`
   - `terrain:flat`
   - `travel_speed:1.2` (roads and clear paths)
   - `resources:food`
   - `custom:safe`

## Step 7: Saving and Sharing

### Automatic Saving

Realm data is automatically saved to your scene when you:
- Create new realms
- Modify existing realms
- Use the Properties dialog

No manual saving required!

### Export Your Work

1. **Click the Export button** in the Realms toolbar
2. **Choose your filename** (suggestion: `my-world-realms.json`)
3. **Save the file** somewhere safe

This creates a backup and allows sharing with others.

### Import Community Data

1. **Download realm data** from other creators
2. **Click the Import button** in the Realms toolbar
3. **Select the JSON file** to import
4. **Review the preview** and choose how to handle conflicts
5. **Click Import** to add the data to your scene

## Step 8: Next Steps

### Integration with Other Modules

If you have **Journeys & Jamborees** installed:
- Enable realm integration in J&J settings
- Your travel speeds and encounter tables will automatically use realm data
- Create biome-specific random encounter tables

### Advanced Tagging

Explore module-specific tags:
- `module:jj:encounter_chance:0.3` (30% encounter chance for J&J)
- `module:weather:storm_chance:high` (for weather modules)
- `module:magic:wild_magic:true` (for magic effect modules)

### Community Content

- Share your realm data on community forums
- Download pre-made realm sets for published adventures
- Contribute to shared tag vocabularies

### Performance Tips

For large worlds:
- Use fewer, larger realms rather than many tiny ones
- Simple shapes (rectangles, circles) are faster than complex polygons
- Consider realm density - not every square foot needs a tag

## Common Questions

### "My realm isn't showing up"

- Make sure the Realms layer is active (map icon highlighted)
- Check if you completed the drawing (right-click or Enter for polygons)
- Verify the polygon has at least 3 points

### "I can't edit realm properties"

- Make sure you have GM permissions
- Try double-clicking the realm directly
- Check that the realm is selected (highlighted border)

### "Tags aren't working"

- Verify the tag format: `key:value` with exactly one colon
- Check for typos in common tags (`biome:forrest` should be `biome:forest`)
- Invalid tags will show a red border with error message

### "How do I delete a realm?"

- Select the realm with the Select tool
- Press Delete or Backspace
- Confirm deletion in the dialog
- Or use the Delete button in the Properties dialog

### "Can I have overlapping realms?"

Yes! This is a feature:
- A region can be both `biome:forest` and `elevation:highland`
- Queries return the first match found
- Use this for layered environmental effects

## Troubleshooting

### Module Not Appearing

1. **Check module is enabled** in world settings
2. **Refresh your browser** after enabling
3. **Check console for errors** (F12 → Console tab)
4. **Verify Foundry VTT version** (v13+ required)

### Performance Issues

1. **Reduce polygon complexity** (fewer points)
2. **Use simpler shapes** where possible
3. **Check browser hardware acceleration** is enabled
4. **Close other applications** to free memory

### Data Loss Prevention

1. **Regular world backups** include realm data automatically
2. **Export realm data** periodically as additional backup
3. **Test imports** on a copy world before applying to main world

## Getting Help

### Documentation

- **User Guide**: Complete feature documentation
- **API Reference**: For module developers
- **GitHub Issues**: Bug reports and feature requests

### Community

- **Foundry VTT Discord**: #modules channel
- **GitHub Discussions**: Questions and community sharing
- **Reddit**: r/FoundryVTT community

### Reporting Issues

If you encounter bugs:
1. **Check the GitHub issues** to see if it's already reported
2. **Provide steps to reproduce** the problem
3. **Include your Foundry version** and browser info
4. **Attach error messages** from the console if possible

---

**Congratulations!** You now know the basics of Realms & Reaches. Start small, experiment with different tag combinations, and build up your world's environmental data over time. The system is designed to grow with your campaign and adapt to your unique storytelling needs.

Happy realm building! 🗺️