# AI Instructions for Story Creation

This notebook contains story content that requires AI assistance for creation, editing, and refinement. Follow these guidelines when helping with story development.

## Story Names

### Guidelines for Creating Story Titles
- **Dhivehi Title**: Should be culturally appropriate and meaningful in Dhivehi language
- **English Title**: Should be a direct translation or adaptation that captures the essence of the story
- **URL Slug**: Auto-generated from English title (lowercase, hyphens instead of spaces, no special characters)

### When Creating New Stories
1. Ask user for the story concept/theme
2. Suggest both Dhivehi and English title options
3. Ensure titles are catchy but not misleading
4. Keep titles under 60 characters for better display

## Episodes

### Episode Structure
Each episode should follow this structure:
```markdown
## Episode {N}: {Title}
**Content:** {Story content in narrative format}
**Image Prompt:** {Detailed description for AI image generation}
```

### Content Guidelines
- **Length**: Each episode should be 200-500 words for optimal reading experience
- **Narrative Style**: First-person or third-person consistent throughout
- **Pacing**: Balance action, dialogue, and description
- **Cliffhangers**: End episodes with engaging hooks to encourage continued reading
- **Language**: Use clear, accessible language appropriate for the target audience

### Episode Organization
- Episodes should follow a logical narrative arc
- Each episode should advance the plot or develop characters
- Maintain continuity between episodes
- Reference previous events when relevant
- Foreshadow future developments subtly

### When Creating Episodes
1. Review previous episodes for continuity
2. Ask user about desired plot points for this episode
3. Draft content with clear beginning, middle, and end
4. Include dialogue that reveals character personality
5. Add sensory details to make scenes vivid
6. Ensure smooth transitions to/from adjacent episodes

## Images

### Image Types
1. **Cover Image**: Main story image displayed on story listing page
2. **Episode Images**: Individual images for each episode
3. **Promotional Images**: For social media sharing

### Image Specifications
- **Cover Image**: 16:9 aspect ratio, minimum 1920x1080px
- **Episode Images**: 16:9 aspect ratio, minimum 1280x720px
- **Format**: JPG or PNG
- **File Size**: Compressed to under 500KB for web optimization

### Image Style Guidelines
- Maintain consistent visual style across all story images
- Use appropriate color schemes that match story mood
- Include relevant characters or scenes from the story
- Avoid generic stock photo look - make images story-specific
- Ensure images are culturally appropriate for Maldivian audience

## Image Prompts

### Prompt Structure
Create detailed, specific prompts for AI image generation:

```
{Scene description}. {Characters and their actions}. {Setting and environment}. 
{Lighting and mood}. {Artistic style}. {Technical specifications}
```

### Prompt Elements

**Scene Description**
- What is happening in the image
- Key actions or moments
- Emotional tone

**Characters**
- Who is in the image
- Their appearance (age, clothing, expressions)
- Their positioning and interactions

**Setting**
- Location (indoor/outdoor, specific place)
- Time of day
- Weather conditions
- Background elements

**Lighting & Mood**
- Lighting type (natural, dramatic, soft)
- Color palette
- Atmosphere (tense, peaceful, romantic, etc.)

**Artistic Style**
- Art style reference (cinematic, anime, realistic, painterly)
- Composition guidelines
- Visual effects

**Technical Specifications**
- Aspect ratio
- Quality level
- Specific camera angles if relevant

### Example Prompts

**For Cover Image:**
```
A dramatic scene showing a young woman standing alone on a Maldivian beach at sunset. She wears a simple white dress and looks toward the horizon with determination. Golden hour lighting creates long shadows. The ocean waves gently lap at her feet. Cinematic photography style, warm color palette, emotional and hopeful atmosphere. Wide shot, 16:9 aspect ratio, high detail.
```

**For Episode Scene:**
```
A cozy living room interior at night. A family of four sits together on a comfortable rug - a father, mother, young boy, and little girl. The children are asleep in their parents' arms. City lights glow softly through the window in the background. Warm, intimate lighting from a nearby lamp. The parents look at each other with love and peace. Realistic style, soft focus, heartwarming family moment. Medium shot, 16:9 aspect ratio.
```

### Prompt Best Practices
- Be specific but leave room for creative interpretation
- Include cultural elements relevant to the story
- Specify emotional tone clearly
- Avoid contradictory instructions
- Use descriptive adjectives (warm, tense, mysterious, joyful)
- Reference art styles if you want a particular look

## Workflow for AI Assistance

### When User Requests Help with Stories

1. **Clarify the Request**
   - What specific aspect needs help? (title, episode, image, prompt)
   - What is the story about?
   - What is the current state of the story?

2. **Review Existing Content**
   - Read existing episodes for context
   - Check story description for themes
   - Note character names and traits
   - Understand the narrative arc

3. **Provide Suggestions**
   - Offer multiple options when appropriate
   - Explain reasoning for suggestions
   - Ask for feedback before implementing
   - Be willing to revise based on user input

4. **Implement Changes**
   - Make edits to markdown files
   - Maintain existing formatting
   - Preserve continuity with previous content
   - Update related files if needed

### Quality Checks

Before finalizing any content:
- [ ] Spelling and grammar correct
- [ ] Consistent with story tone and style
- [ ] No plot holes or contradictions
- [ ] Appropriate length for the medium
- [ ] Culturally sensitive and appropriate
- [ ] Engaging and well-paced

## File Organization

### Story Directory Structure
```
stories/
├── story-1/
│   ├── story-description.md      # Overall story info
│   ├── story-episodes.md         # English episodes
│   ├── story-episodes-maldivan.md # Dhivehi episodes
│   └── (additional assets)
├── story-2/
│   └── ...
└── AI_INSTRUCTIONS.md            # This file
```

### File Naming Conventions
- Use lowercase with hyphens: `story-description.md`
- Include language suffix for translations: `story-episodes-maldivan.md`
- Number stories sequentially: `story-1`, `story-2`, etc.

## Common Tasks

### Adding a New Episode
1. Determine episode number (next in sequence)
2. Create compelling title
3. Write 200-500 words of content
4. Generate detailed image prompt
5. Maintain narrative continuity
6. Add cliffhanger or resolution as appropriate

### Editing Existing Content
1. Read the full context before editing
2. Preserve author's voice and style
3. Make minimal, targeted changes
4. Explain reasons for significant edits
5. Check for ripple effects on other episodes

### Creating Image Prompts
1. Identify key scene or moment
2. Describe visual elements clearly
3. Specify mood and atmosphere
4. Include character details
5. Add artistic style preferences
6. Keep prompts under 200 words for clarity

## Tone and Style Guidelines

### Narrative Voice
- Consistent perspective (first/third person)
- Appropriate reading level for target audience
- Engaging but not overly complex
- Emotionally resonant without being melodramatic

### Cultural Considerations
- Respect Maldivian culture and values
- Use appropriate Dhivehi phrases when relevant
- Include local customs and traditions authentically
- Avoid stereotypes or misrepresentations

### Content Appropriateness
- Family-friendly content unless specified otherwise
- Avoid excessive violence or mature themes
- Handle sensitive topics with care
- Provide content warnings if necessary

## Feedback and Iteration

### When User Provides Feedback
- Listen carefully to specific concerns
- Ask clarifying questions if needed
- Revise content based on feedback
- Explain changes made and why
- Offer alternative approaches if initial revision doesn't work

### Continuous Improvement
- Learn from user preferences
- Note what works well for future reference
- Adapt guidelines based on project needs
- Stay open to new storytelling techniques

---

**Last Updated**: September 2026
**Purpose**: Guide AI assistants in helping with story creation, editing, and image generation for Hawa Daily stories.
