import { create } from "zustand";

export type EditorElement = {
  className: string;
  tagName: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  textTransform?: string;
  bgGradient?: string;
  borderWidth?: string;
  borderRadius?: string;
  shadow?: string;
  spacing?: string;
  width?: string;
  height?: string;
  display?: string;
  flexAlign?: string;
  fontFamily?: string;
  fontStyle?: string;
  // Add more as needed
};

export type EditorSnapshot = {
  elements: Record<string, EditorElement>;
};

export interface EditorState {
  isEditMode: boolean;
  selectedElementId: string | null;
  elements: Record<string, EditorElement>;
  history: EditorSnapshot[];
  future: EditorSnapshot[];
  setEditMode: (edit: boolean) => void;
  selectElement: (id: string | null) => void;
  setElementClass: (id: string, className: string) => void;
  appendElementClass: (id: string, className: string) => void;
  updateElement: (
    id: string,
    updater: (el: EditorElement) => EditorElement
  ) => void;
  makeTextBigger: (id: string) => void;
  pushHistory: (snapshot: EditorSnapshot) => void;
  undo: () => void;
  redo: () => void;
  /**
   * Remove all classes from a given group (e.g., all border-*, shadow-*, p-*, m-*, rounded-*, etc.)
   */
  removeClassGroup: (id: string, groupPrefix: string) => void;
  /**
   * Toggle a class in a group (removes all other group classes, adds the new one)
   */
  setClassGroup: (id: string, groupPrefix: string, newClass: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  isEditMode: false,
  selectedElementId: null,
  elements: {},
  history: [],
  future: [],
  setEditMode: (edit) => set({ isEditMode: edit }),
  selectElement: (id) =>
    set((state) => {
      if (!id) return { selectedElementId: null };
      if (!state.elements[id]) {
        return {
          selectedElementId: id,
          elements: {
            ...state.elements,
            [id]: { className: "", tagName: "" },
          },
        };
      }
      return { selectedElementId: id };
    }),
  setElementClass: (id, className) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: { ...state.elements[id], className },
      },
    })),
  appendElementClass: (id, className) =>
    set((state) => {
      const prev = state.elements[id]?.className || "";
      const newClass = Array.from(
        new Set((prev + " " + className).split(" ").filter(Boolean))
      ).join(" ");
      return {
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], className: newClass },
        },
      };
    }),
  updateElement: (id, updater) =>
    set((state) => {
      const prev = state.elements[id];
      if (!prev) return {};
      const updated = updater(prev);
      return {
        elements: {
          ...state.elements,
          [id]: { ...updated, tagName: prev.tagName },
        },
      };
    }),
  makeTextBigger: (id) =>
    set((state) => {
      const prev = state.elements[id]?.className || "";
      // Add text-4xl as an example for bigger text
      const newClass = Array.from(
        new Set((prev + " text-4xl").split(" ").filter(Boolean))
      ).join(" ");
      return {
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], className: newClass },
        },
      };
    }),
  pushHistory: (snapshot) =>
    set((state) => ({
      history: [...state.history, snapshot],
      future: [],
    })),
  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        history: state.history.slice(0, -1),
        future: [prev, ...state.future],
        elements: prev.elements,
      };
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        history: [...state.history, next],
        future: state.future.slice(1),
        elements: next.elements,
      };
    }),
  removeClassGroup: (id, groupPrefix) =>
    set((state) => {
      const prev = state.elements[id]?.className || "";
      const filtered = prev
        .split(" ")
        .filter((cls) => !cls.startsWith(groupPrefix))
        .filter(Boolean)
        .join(" ");
      return {
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], className: filtered },
        },
      };
    }),
  setClassGroup: (id, groupPrefix, newClass) =>
    set((state) => {
      const prev = state.elements[id]?.className || "";
      const filtered = prev
        .split(" ")
        .filter((cls) => !cls.startsWith(groupPrefix))
        .filter(Boolean);
      if (newClass) filtered.push(newClass);
      return {
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], className: filtered.join(" ") },
        },
      };
    }),
}));

// Add a helper to add a new element with tagName
export const addEditorElement = (id: string, tagName: string) => {
  useEditorStore.setState((state) => ({
    elements: {
      ...state.elements,
      [id]: { className: "", tagName },
    },
  }));
};

// Helper to build className from style fields
export function buildClassName(el: EditorElement): string {
  return [
    el.fontSize,
    el.fontWeight,
    el.textAlign,
    el.lineHeight,
    el.letterSpacing,
    el.textDecoration,
    el.textTransform,
    el.bgGradient,
    el.borderWidth,
    el.borderRadius,
    el.shadow,
    el.spacing,
    el.width,
    el.height,
    el.display,
    el.flexAlign,
  ]
    .filter(Boolean)
    .join(" ");
}
