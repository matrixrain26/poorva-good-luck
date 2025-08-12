// Content data for the Good Luck web app

// Recipient information
export const recipientName = "Poorva Bhide";

// Homecoming date (ISO string format)
export const homecomingDate = "2026-08-14T00:00:00";

// Audio sources in priority order
// 1. Cloudinary hosted audio (most reliable for production)
export const audioSrc = "https://res.cloudinary.com/dn29d1f9i/video/upload/v1754913849/redventdigitalmedia.co.za_-_Coldplay_-_Hymn_For_The_Weekend_Instrumental_320_KBps_m5h9dq.mp3";
// 2. Local file in public directory (backup for local development)
export const backupAudioSrc1 = "/Sounds/redventdigitalmedia.co.za - Coldplay - Hymn For The Weekend Instrumental (320 KBps).mp3";
// 3. Alternative local audio path (in case primary fails)
export const backupAudioSrc2 = "/audio/coldplay-hymn-for-the-weekend.mp3";
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
  },
  // New images added August 13, 2025
  {
    id: "photo_15",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025342/WhatsApp_Image_2025-08-12_at_18.42.41_pjepmv.jpg",
    alt: "Poorva with friends",
    note: "Creating memories that will last a lifetime!"
  },
  {
    id: "photo_16",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025342/WhatsApp_Image_2025-08-12_at_18.42.42_a6lkb8.jpg",
    alt: "Poorva at an event",
    note: "Your positive energy is always infectious!"
  },
  {
    id: "photo_17",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025342/WhatsApp_Image_2025-08-12_at_18.42.40_vin653.jpg",
    alt: "Poorva with friends",
    note: "Friends who become family are the best kind!"
  },
  {
    id: "photo_18",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025341/WhatsApp_Image_2025-08-12_at_18.42.33_y0hfhq.jpg",
    alt: "Poorva celebrating",
    note: "Every moment with you becomes a celebration!"
  },
  {
    id: "photo_19",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.46_i8mwpd.jpg",
    alt: "Poorva smiling",
    note: "Your smile can brighten even the darkest days!"
  },
  {
    id: "photo_20",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.38_iniqns.jpg",
    alt: "Poorva with friends",
    note: "Distance can't diminish true friendship!"
  },
  {
    id: "photo_21",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025341/WhatsApp_Image_2025-08-12_at_18.42.43_nyrjcx.jpg",
    alt: "Poorva at a gathering",
    note: "You make every gathering special with your presence!"
  },
  {
    id: "photo_22",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.36_oryn0s.jpg",
    alt: "Poorva with friends",
    note: "The best memories are made with friends like you!"
  },
  {
    id: "photo_23",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025341/WhatsApp_Image_2025-08-12_at_18.42.35_ciiir3.jpg",
    alt: "Poorva celebrating",
    note: "Here's to new beginnings and exciting adventures!"
  },
  {
    id: "photo_24",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.34_pc5u4l.jpg",
    alt: "Poorva with friends",
    note: "Friends who laugh together stay together!"
  },
  {
    id: "photo_25",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.45_o7ys2n.jpg",
    alt: "Poorva at an event",
    note: "Your journey ahead will be as beautiful as these memories!"
  },
  {
    id: "photo_26",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.44_b7daiz.jpg",
    alt: "Poorva celebrating",
    note: "Wishing you endless joy and success in your new chapter!"
  },
  {
    id: "photo_27",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755025340/WhatsApp_Image_2025-08-12_at_18.42.29_bbdpz5.jpg",
    alt: "Poorva with friends",
    note: "These memories will keep us connected across continents!"
  },
  {
    id: "photo_28",
    src: "https://res.cloudinary.com/dn29d1f9i/image/upload/v1755029726/WhatsApp_Image_2025-08-13_at_01.43.20_tknc8e.jpg",
    alt: "Poorva's special moment",
    note: "Cherishing every moment before your new adventure begins!"
  }
];

// Messages for the carousel
export const messages = [
  {
    id: 1,
    author: "Abhijit",
    message: "Poorva, Pashchimela challis:) Try new things, meet awesome people, and remember — we're just a call away. Best Wishes :)"
  },
  {
    id: 2,
    author: "Parents",
    message: "Our hearts go with you. Study hard but don't forget to enjoy the experience too!"
  },
  {
    id: 3,
    author: "Cousins",
    message: "You're going to absolutely crush it! We'll miss you over here."
  },
  {
    id: 4,
    author: "Friends",
    message: "We know you'll shine bright in your new adventure! Can't wait to hear all your stories."
  }
];

// Default new message to show in the form
export const defaultNewMessage = {
  author: "",
  message: ""
};
