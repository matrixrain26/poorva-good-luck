# Good Luck, Poorva! 

A beautiful single-page web application to wish Poorva good luck on her MS journey abroad.

## Features

- **Hero Section**: Animated gradient title with music controls and message submission
- **Countdown Timer**: Shows days, hours, minutes, and seconds until homecoming date
- **Photo Mosaic**: Interactive grid of photos with notes that appear on hover/focus
- **Messages Carousel**: Auto-playing carousel of messages with shuffle functionality
- **Background Music**: Audio player with volume control and keyboard shortcuts

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/poorva-good-luck.git
cd poorva-good-luck
```

2. Install dependencies:
```
npm install
```

3. **Important**: Add image files to the `public/images` directory
   - See the `public/images/README.md` file for a list of required images
   - Refer to `IMAGE_HOSTING_GUIDE.md` for detailed instructions on image handling

4. Start the development server:
```
npm run dev
```

5. Build for production:
```
npm run build
```

## Deployment

### Option 1: Deploy with Vercel or Netlify

1. Optimize images before deployment (see `IMAGE_HOSTING_GUIDE.md`)
2. Connect your GitHub repository to Vercel or Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: `Vite`

### Option 2: Manual Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` directory to your hosting provider
3. Ensure all image files are properly uploaded to the `images` directory

## Customization

### Updating Content

All content is stored in `src/data/content.ts`. You can modify:

- `recipientName`: The name of the person going abroad
- `homecomingDate`: The expected return date (ISO format)
- `audioSrc`: Path to background music file
- `photos`: Array of photos with notes
- `messages`: Array of initial messages

### Adding Your Own Photos

1. Place your photos in the `Public/IMAGE` directory
2. Update the `photos` array in `src/data/content.ts` with the correct file paths and notes

### Changing the Music

1. Place your audio file in the `Public/Sounds` directory
2. Update the `audioSrc` in `src/data/content.ts` with the correct file path

## Accessibility Features

- Keyboard navigation support
- ARIA labels for interactive elements
- Focus indicators
- Reduced motion support
- Screen reader friendly structure

## Local Storage

The application uses localStorage to save:
- User-submitted messages
- Audio volume preferences

## Future Enhancements

- "Share your memory" upload functionality
- Light parallax in hero background
- Print-friendly "scrapbook" page

## License

This project is created with love for Poorva's MS journey.
