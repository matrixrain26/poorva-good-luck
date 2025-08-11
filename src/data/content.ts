// Content data for the Good Luck web app

// Recipient information
export const recipientName = "Poorva Bhide";

// Homecoming date (ISO string format)
export const homecomingDate = "2026-08-14T00:00:00";

// Audio sources in priority order
// 1. Cloudinary hosted audio (most reliable for production)
export const audioSrc = "https://res.cloudinary.com/demo/video/upload/v1689333290/samples/sea-turtle.mp3";
// 2. Local file in public directory (backup for local development)
export const backupAudioSrc1 = "/Sounds/redventdigitalmedia.co.za - Coldplay - Hymn For The Weekend Instrumental (320 KBps).mp3";
// 3. Alternative Cloudinary sample audio (in case primary fails)
export const backupAudioSrc2 = "https://res.cloudinary.com/demo/video/upload/v1689333290/samples/cld-sample-video.mp4";
// Export backupAudioSrc for compatibility with existing code
export const backupAudioSrc = audioSrc;

// Photos with notes (inside jokes)
export const photos = [
  {
    id: "photo_4",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.37.16_1_j19hkj.jpg",
    alt: "Poorva at a special moment",
    note: "Your smile brightens everyone's day. Keep smiling!"
  },
  {
    id: "photo_5",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817005/WhatsApp_Image_2025-08-09_at_23.37.16_dw5kn9.jpg",
    alt: "Poorva laughing",
    note: "Never lose that infectious laugh of yours!"
  },
  {
    id: "photo_6",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817005/WhatsApp_Image_2025-08-09_at_23.37.17_1_iwd7bx.jpg",
    alt: "Poorva at a celebration",
    note: "Here's to many more celebrations in your future!"
  },
  {
    id: "photo_7",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.37.17_w1xkuh.jpg",
    alt: "Poorva with friends",
    note: "Cherish these moments and create new ones on your journey!"
  },
  {
    id: "photo_8",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817005/WhatsApp_Image_2025-08-09_at_23.37.18_1_zxuccy.jpg",
    alt: "Poorva at an event",
    note: "Always ready for new adventures and experiences!"
  },
  {
    id: "photo_9",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817005/WhatsApp_Image_2025-08-09_at_23.37.18_r0hw10.jpg",
    alt: "Poorva celebrating",
    note: "Your enthusiasm is contagious. Keep that spirit alive!"
  },
  {
    id: "photo_10",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817006/WhatsApp_Image_2025-08-09_at_23.38.18_dr1jrf.jpg",
    alt: "Poorva at a gathering",
    note: "You bring joy to every gathering. You'll do the same abroad!"
  },
  {
    id: "photo_11",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.38.19_1_ds5q0v.jpg",
    alt: "Poorva smiling",
    note: "That smile can light up any room. Share it with the world!"
  },
  {
    id: "photo_12",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.38.19_2_wv41hi.jpg",
    alt: "Poorva with friends",
    note: "True friendships last despite oceans between them."
  },
  {
    id: "photo_13",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.38.19_3_xi863e.jpg",
    alt: "Poorva outdoors",
    note: "May your MS journey be as beautiful as this moment."
  },
  {
    id: "photo_14",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1754817004/WhatsApp_Image_2025-08-09_at_23.38.19_l8wsmc.jpg",
    alt: "Poorva celebrating",
    note: "Here's to many more milestones and celebrations in your future!"
  }
];

// Messages for the carousel
export const messages = [
  {
    id: 1,
    author: "Friends",
    message: "We know you'll shine bright in your new adventure! Can't wait to hear all your stories."
  },
  {
    id: 2,
    author: "Sister",
    message: "So proud of you for taking this big step! You've always been brave and brilliant."
  },
  {
    id: 3,
    author: "Parents",
    message: "Our hearts go with you. Study hard but don't forget to enjoy the experience too!"
  },
  {
    id: 4,
    author: "Cousins",
    message: "You're going to absolutely crush it! We'll miss your laughter around here."
  }
];

// Default new message to show in the form
export const defaultNewMessage = {
  author: "",
  message: ""
};
