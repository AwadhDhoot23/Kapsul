import { toast } from "sonner";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to parse ISO 8601 duration (PT15M33S) to seconds
const parseDuration = (isoDuration) => {
    if (!isoDuration) return 0;
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return hours * 3600 + minutes * 60 + seconds;
};

export const fetchVideoDetails = async (videoId) => {
    if (!API_KEY) {
        console.warn('YouTube API Key is missing');
        return null;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) return null;

        const item = data.items[0];
        const snippet = item.snippet;
        const contentDetails = item.contentDetails;

        return {
            title: snippet.title,
            description: snippet.description,
            thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            duration: parseDuration(contentDetails.duration), // Returns seconds
            tags: snippet.tags || []
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        toast.error('Failed to fetch video details via API');
        return null; // Fallback to manual entry
    }
};

export const fetchPlaylistDetails = async (playlistId) => {
    if (!API_KEY) {
        console.warn('YouTube API Key is missing');
        return null;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) return null;

        const item = data.items[0];
        const snippet = item.snippet;
        const contentDetails = item.contentDetails;

        return {
            title: snippet.title,
            description: snippet.description,
            thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            videoCount: contentDetails.itemCount,
            tags: snippet.tags || []
        };
    } catch (error) {
        console.error('Error fetching playlist details:', error);
        toast.error('Failed to fetch playlist details via API');
        return null;
    }
};
