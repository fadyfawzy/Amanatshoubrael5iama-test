"use client"

// This is a placeholder for drag-and-drop functionality
// In a real implementation, you would use @hello-pangea/dnd or react-beautiful-dnd
export const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>
export const Droppable = ({ children, droppableId }: any) =>
  children({ innerRef: () => {}, droppableProps: {}, placeholder: null })
export const Draggable = ({ children, draggableId, index }: any) =>
  children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, { isDragging: false })
