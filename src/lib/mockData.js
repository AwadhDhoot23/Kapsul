
import { Timestamp } from 'firebase/firestore';

export const MOCK_ITEMS = [
    {
        id: 'mock-video-1',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=9HqS4jN2Wp4',
        thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
        title: 'Japan in 8K 60fps',
        channel: 'Jacob & Katie Schwarz',
        duration: 1800,
        tags: ['Travel', 'Nature', '4K'],
        isPinned: true,
        isCompleted: false,
        createdAt: Timestamp.now(),
        userId: 'guest'
    },
    {
        id: 'mock-video-2',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', // Lofi Girl - Valid ID (Stream)
        title: 'lofi hip hop radio - beats to relax/study to',
        channel: 'Lofi Girl',
        duration: 0,
        tags: ['Music', 'Study', 'Lofi'],
        isPinned: false,
        isCompleted: false,
        createdAt: Timestamp.now(),
        userId: 'guest'
    },
    {
        id: 'mock-video-3',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', // Next.js 14 - Valid ID
        title: 'Next.js 14 Course',
        channel: 'Web Dev Simplified',
        duration: 3600, // 1 hour
        tags: ['Coding', 'React', 'Next.js'],
        isPinned: false,
        isCompleted: true,
        createdAt: Timestamp.now(),
        userId: 'guest'
    },
    {
        id: 'mock-link-1',
        type: 'link',
        url: 'https://vercel.com',
        title: 'Vercel - Develop. Preview. Ship.',
        description: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.',
        image: 'https://avatars.githubusercontent.com/u/14985020?s=200&v=4',
        tags: ['DevTools', 'Deployment'],
        isPinned: true,
        isCompleted: false,
        createdAt: Timestamp.now(),
        userId: 'guest'
    },
    {
        id: 'mock-note-1',
        type: 'note',
        title: 'Project Ideas 2024',
        content: '1. AI-powered recipe generator\n   - Use OpenAI API for recipes\n   - Image generation for food preview\n\n2. Personal finance tracker\n   - Voice input for expenses\n   - Monthly budget visualization\n\n3. Mood tracker\n   - Based on Spotify listening history\n   - Daily emotion check-ins',
        tags: ['Ideas', 'Planning'],
        isPinned: false,
        isCompleted: false,
        createdAt: Timestamp.now(),
        userId: 'guest'
    },
    {
        id: 'mock-playlist-1',
        type: 'playlist',
        title: 'Frontend Mastery',
        itemCount: 12,
        thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg', // JS video thumbnail
        tags: ['Learning', 'Dev'],
        isPinned: false,
        isCompleted: false,
        createdAt: Timestamp.now(),
        userId: 'guest'
    }
];
