# Advertisement Slots Documentation

This document lists all advertisement slots available across the website with their SEO-friendly IDs and image dimensions.

## Doctors Duty Page (`/doctors-duty`)

### Left Sidebar
- **ID:** `ad-doctors-left-tall-160x384`
  - **Size:** 160px width × 384px height
  - **Position:** Left sidebar, top slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-doctors-left-medium-160x256`
  - **Size:** 160px width × 256px height
  - **Position:** Left sidebar, middle slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-doctors-left-medium-160x256-2`
  - **Size:** 160px width × 256px height
  - **Position:** Left sidebar, bottom slot
  - **Visibility:** Large screens (lg breakpoint and above)

### Right Sidebar
- **ID:** `ad-doctors-right-tall-160x384`
  - **Size:** 160px width × 384px height
  - **Position:** Right sidebar, top slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-doctors-right-medium-160x256`
  - **Size:** 160px width × 256px height
  - **Position:** Right sidebar, middle slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-doctors-right-medium-160x256-2`
  - **Size:** 160px width × 256px height
  - **Position:** Right sidebar, bottom slot
  - **Visibility:** Large screens (lg breakpoint and above)

---

## Recipes Page (`/recipes`)

### Left Sidebar
- **ID:** `ad-recipes-left-tall-160x384`
  - **Size:** 160px width × 384px height
  - **Position:** Left sidebar, top slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-recipes-left-medium-160x256`
  - **Size:** 160px width × 256px height
  - **Position:** Left sidebar, middle slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-recipes-left-medium-160x256-2`
  - **Size:** 160px width × 256px height
  - **Position:** Left sidebar, bottom slot
  - **Visibility:** Large screens (lg breakpoint and above)

### Right Sidebar
- **ID:** `ad-recipes-right-tall-160x384`
  - **Size:** 160px width × 384px height
  - **Position:** Right sidebar, top slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-recipes-right-medium-160x256`
  - **Size:** 160px width × 256px height
  - **Position:** Right sidebar, middle slot
  - **Visibility:** Large screens (lg breakpoint and above)

- **ID:** `ad-recipes-right-medium-160x256-2`
  - **Size:** 160px width × 256px height
  - **Position:** Right sidebar, bottom slot
  - **Visibility:** Large screens (lg breakpoint and above)

---

## Implementation Notes

- All advertisement slots use sticky positioning to remain visible while scrolling
- Slots are hidden on smaller screens (below lg breakpoint) for better mobile experience
- IDs follow the pattern: `ad-{page}-{side}-{size}-{dimensions}`
- Dimensions are in pixels (width × height)
- All slots currently display placeholder content with dashed gray borders

## Adding Advertisements

To add an advertisement to a slot:
1. Select the slot by its ID using JavaScript: `document.getElementById('ad-doctors-left-tall-160x384')`
2. Replace the placeholder content with your advertisement image/code
3. Ensure the image matches the specified dimensions for best fit

## Future Pages

When adding advertisement slots to new pages, follow this naming convention:
- `ad-{page-name}-{side}-{size}-{dimensions}`
- Example: `ad-news-left-tall-160x384`
