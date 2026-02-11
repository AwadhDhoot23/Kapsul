// store/uiStore.js
import { create } from 'zustand';

export const useUIStore = create((set) => ({
    // Sidebar state
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    // Modals
    smartCaptureOpen: false,
    commandPaletteOpen: false,
    openSmartCapture: () => set({ smartCaptureOpen: true }),
    closeSmartCapture: () => set({ smartCaptureOpen: false }),
    openCommandPalette: () => set({ commandPaletteOpen: true }),
    closeCommandPalette: () => set({ commandPaletteOpen: false }),

    // Bulk selection
    selectedItems: [],
    toggleItemSelection: (itemId) => set((state) => {
        const isSelected = state.selectedItems.includes(itemId);
        return {
            selectedItems: isSelected
                ? state.selectedItems.filter(id => id !== itemId)
                : [...state.selectedItems, itemId]
        };
    }),
    clearSelection: () => set({ selectedItems: [] }),
    selectAll: (itemIds) => set({ selectedItems: itemIds }),
}));
