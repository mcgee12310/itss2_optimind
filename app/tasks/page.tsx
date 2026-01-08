// "use client";

// import { useState, useEffect, useMemo, FC } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import {
//   Plus,
//   CalendarDays,
//   Clock,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";

// // --- DND-Kit Imports ---
// import {
//   DndContext,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragOverlay,
//   DragStartEvent,
//   DragEndEvent,
//   DragOverEvent,
//   closestCorners,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   arrayMove,
//   useSortable,
//   verticalListSortingStrategy,
//   horizontalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// // --- Types ---
// type Priority = "high" | "medium" | "low";

// interface Task {
//   id: string;
//   columnId: string;
//   title: string;
//   description?: string;
//   tags?: string[];
//   dueDate?: Date;
//   time?: string;
//   priority: Priority;
// }

// interface Column {
//   id: string;
//   title: string;
// }

// type Tasks = Record<string, Task[]>;

// // --- Constants ---
// const defaultColumns: Column[] = [
//   { id: "todo", title: "To Do" },
//   { id: "in_progress", title: "In Progress" },
//   { id: "completed", title: "Complete" },
// ];

// const statusToColumnId: Record<string, string> = {
//   todo: "todo",
//   in_progress: "in_progress",
//   completed: "completed",
// };

// const columnIdToStatus: Record<string, string> = {
//   todo: "todo",
//   in_progress: "in_progress",
//   completed: "completed",
// };

// // Định nghĩa Tags giống bên Calendar
// const taskTags: Record<string, { name: string; color: string }> = {
//   project: { name: "Project", color: "bg-blue-500" },
//   study: { name: "Học tập", color: "bg-green-500" },
//   meeting: { name: "Họp", color: "bg-yellow-500" },
//   personal: { name: "Cá nhân", color: "bg-purple-500" },
// };

// const defaultNewTask: Omit<Task, "id" | "columnId"> = {
//   title: "",
//   description: "",
//   tags: [taskTags.study.name], // Mặc định là Học tập
//   priority: "medium",
//   dueDate: undefined,
//   time: "09:00 - 10:00",
// };

// // --- Component: TaskCard ---
// interface TaskCardProps {
//   task: Task;
//   isOverlay?: boolean;
// }

// const TaskCard: FC<TaskCardProps> = ({ task, isOverlay = false }) => {
//   const {
//     setNodeRef,
//     attributes,
//     listeners,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({
//     id: task.id,
//     data: {
//       type: "Task",
//       task,
//     },
//   });

//   const style = {
//     transition,
//     transform: CSS.Transform.toString(transform),
//   };

//   const priorityColors: Record<Priority, string> = {
//     high: "bg-red-500",
//     medium: "bg-yellow-500",
//     low: "bg-green-500",
//   };

//   // Helper để lấy màu của tag
//   const getTagColor = (tagName: string) => {
//     const foundTag = Object.values(taskTags).find(t => t.name === tagName);
//     return foundTag ? foundTag.color : "bg-white/20"; // Fallback color
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className={cn(
//         "bg-black/40 p-3 rounded-lg shadow-md flex gap-2 cursor-grab active:cursor-grabbing",
//         isOverlay && "opacity-75 shadow-2xl scale-105",
//         isDragging && "opacity-30"
//       )}
//     >
//       <div
//         className={cn(
//           "w-1.5 rounded-full shrink-0",
//           priorityColors[task.priority]
//         )}
//       />

//       <div className="flex-1 space-y-2 overflow-hidden">
//         <p className="font-semibold text-white truncate">{task.title}</p>

//         {task.description && (
//           <p className="text-sm text-gray-300 line-clamp-2">{task.description}</p>
//         )}

//         <div className="flex flex-wrap gap-2 text-xs text-gray-300">
//             {task.dueDate && (
//             <div className={cn("flex items-center gap-1", task.columnId !== "completed" && task.dueDate < new Date() ? "text-red-400" : "")}>
//                 <CalendarDays className="w-3 h-3" />
//                 <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
//             </div>
//             )}
//             {task.time && (
//                 <div className="flex items-center gap-1">
//                     <Clock className="w-3 h-3" />
//                     <span>{task.time}</span>
//                 </div>
//             )}
//         </div>

//         {task.tags && task.tags.length > 0 && (
//           <div className="flex flex-wrap gap-1">
//             {task.tags.map((tag) => (
//               <Badge
//                 key={tag}
//                 variant="secondary"
//                 className={cn(
//                     "text-[10px] px-1.5 py-0 text-white border-0",
//                     getTagColor(tag) // Áp dụng màu tương ứng
//                 )}
//               >
//                 {tag}
//               </Badge>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Component: KanbanColumn ---
// interface KanbanColumnProps {
//   column: Column;
//   tasks: Task[];
//   onAddTask: (columnId: string) => void;
// }

// const KanbanColumn: FC<KanbanColumnProps> = ({ column, tasks, onAddTask }) => {
//   const {
//     setNodeRef,
//     attributes,
//     listeners,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({
//     id: column.id,
//     data: {
//       type: "Column",
//       column,
//     },
//   });

//   const style = {
//     transition,
//     transform: CSS.Transform.toString(transform),
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={cn(
//         "w-80 h-full flex flex-col shrink-0",
//         isDragging && "opacity-50"
//       )}
//     >
//       <div
//         {...attributes}
//         {...listeners}
//         className={cn(
//           "shrink-0 p-4 rounded-t-lg flex justify-between items-center cursor-grab",
//           "bg-black/20 backdrop-blur-sm"
//         )}
//       >
//         <div className="flex items-center gap-2">
//           <h3 className="font-semibold text-white">{column.title}</h3>
//           <Badge variant="outline" className="text-white border-white/20">
//             {tasks.length}
//           </Badge>
//         </div>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10"
//           onClick={(e) => {
//             e.stopPropagation();
//             onAddTask(column.id);
//           }}
//         >
//           <Plus size={16} />
//         </Button>
//       </div>

//       <ScrollArea
//         className={cn(
//           "flex-1 p-4 rounded-b-lg",
//           "bg-white/10 border-x border-b border-white/5"
//         )}
//       >
//         <SortableContext
//           items={tasks.map((t) => t.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <div className="flex flex-col gap-3">
//             {tasks.map((task) => (
//               <TaskCard key={task.id} task={task} />
//             ))}
//           </div>
//         </SortableContext>
//         <ScrollBar orientation="vertical" />
//       </ScrollArea>
//     </div>
//   );
// };

// // --- Main Page ---
// export default function TaskBoardPage() {
//   const [backgroundUrl, setBackgroundUrl] = useState<string>(
//     "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop"
//   );

//   const [columns, setColumns] = useState<Column[]>(defaultColumns);
//   const [tasks, setTasks] = useState<Tasks>({
//     todo: [],
//     in_progress: [],
//     completed: [],
//   });
//   const [loading, setLoading] = useState(true);

//   // Drag & Drop State
//   const [activeTask, setActiveTask] = useState<Task | null>(null);
//   const [activeColumn, setActiveColumn] = useState<Column | null>(null);

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [newTaskData, setNewTaskData] = useState<Omit<Task, "id" | "columnId">>(defaultNewTask);
//   const [newColumnId, setNewColumnId] = useState<string>("todo");

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 10,
//       },
//     })
//   );

//   const glassEffect = "bg-black/30 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";
//   const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/tasks");
//       if (!response.ok) throw new Error("Failed to fetch tasks");
      
//       const data = await response.json();
//       const apiTasks = data.tasks || [];

//       const tasksByColumn: Tasks = {
//         todo: [],
//         in_progress: [],
//         completed: [],
//       };

//       apiTasks.forEach((apiTask: any) => {
//         const columnId = statusToColumnId[apiTask.status] || "todo";
        
//         let tags: string[] = [];
//         if (Array.isArray(apiTask.tags)) {
//             tags = apiTask.tags;
//         } else if (typeof apiTask.tags === 'string') {
//             try { 
//                 const parsed = JSON.parse(apiTask.tags);
//                 tags = Array.isArray(parsed) ? parsed : [apiTask.tags];
//             } catch {
//                 tags = [apiTask.tags];
//             }
//         }

//         const timeDisplay = apiTask.timeSlot || "09:00 - 10:00";

//         const task: Task = {
//           id: apiTask.id,
//           columnId,
//           title: apiTask.title,
//           description: apiTask.description || "",
//           tags: tags,
//           dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
//           priority: (apiTask.priority || "medium") as Priority,
//           time: timeDisplay,
//         };

//         if(tasksByColumn[columnId]) {
//              tasksByColumn[columnId].push(task);
//         }
//       });

//       setTasks(tasksByColumn);
//     } catch (err) {
//       console.error("Failed to fetch tasks:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const findColumnForTask = (taskId: string): string | undefined => {
//     return Object.keys(tasks).find((colId) =>
//       tasks[colId].some((t) => t.id === taskId)
//     );
//   };

//   function onDragStart(event: DragStartEvent) {
//     const { active } = event;
//     if (active.data.current?.type === "Column") {
//       setActiveColumn(active.data.current.column as Column);
//       return;
//     }
//     if (active.data.current?.type === "Task") {
//       setActiveTask(active.data.current.task as Task);
//       return;
//     }
//   }

//   function onDragEnd(event: DragEndEvent) {
//     setActiveColumn(null);
//     setActiveTask(null);
//     const { active, over } = event;

//     if (!over) return;

//     if (active.data.current?.type === "Column") {
//       if (active.id === over.id) return;
//       setColumns((cols) => {
//         const activeIndex = cols.findIndex((c) => c.id === active.id);
//         const overIndex = cols.findIndex((c) => c.id === over.id);
//         return arrayMove(cols, activeIndex, overIndex);
//       });
//       return;
//     }

//     if (active.data.current?.type === "Task") {
//       const activeId = String(active.id);
//       const overId = String(over.id);

//       const activeColumnId = findColumnForTask(activeId);
//       const overColumnId = findColumnForTask(overId) || (columns.find((c) => c.id === overId) ? overId : undefined);

//       if (activeColumnId && overColumnId && activeColumnId === overColumnId) {
//         setTasks((currentTasks) => {
//           const tasksInColumn = currentTasks[activeColumnId];
//           const activeIndex = tasksInColumn.findIndex((t) => t.id === activeId);
//           const overIndex = tasksInColumn.findIndex((t) => t.id === overId);

//           if (activeIndex !== overIndex) {
//             return {
//               ...currentTasks,
//               [activeColumnId]: arrayMove(tasksInColumn, activeIndex, overIndex),
//             };
//           }
//           return currentTasks;
//         });
//       }
//     }
//   }

//   async function onDragOver(event: DragOverEvent) {
//     const { active, over } = event;
//     if (!over) return;

//     const activeId = String(active.id);
//     const overId = String(over.id);

//     if (active.data.current?.type !== "Task") return;

//     const activeColumnId = findColumnForTask(activeId);
//     const overColumnId = findColumnForTask(overId) || (columns.find((c) => c.id === overId) ? overId : undefined);

//     if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
//       return;
//     }

//     setTasks((prev) => {
//       const activeTask = prev[activeColumnId].find((t) => t.id === activeId);
//       if (!activeTask) return prev;

//       const newTasks = { ...prev };
//       newTasks[activeColumnId] = newTasks[activeColumnId].filter((t) => t.id !== activeId);
//       newTasks[overColumnId] = [
//         ...newTasks[overColumnId],
//         { ...activeTask, columnId: overColumnId },
//       ];

//       return newTasks;
//     });

//     try {
//       const newStatus = columnIdToStatus[overColumnId];
//       await fetch(`/api/tasks/${activeId}`, {
//         method: "PATCH", // Đồng bộ dùng PATCH
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });
//     } catch (err) {
//       console.error("Failed to update task status:", err);
//     }
//   }

//   const handleOpenModal = (columnId: string = "todo") => {
//     setNewColumnId(columnId);
//     setNewTaskData(defaultNewTask);
//     setIsModalOpen(true);
//   };

//   const handleAddTask = async () => {
//     if (!newTaskData.title) return;

//     try {
//       const status = columnIdToStatus[newColumnId] || "todo";
//       const response = await fetch("/api/tasks", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: newTaskData.title,
//           description: newTaskData.description || "",
//           status,
//           priority: newTaskData.priority,
//           tags: newTaskData.tags, // Gửi mảng tag đã chọn từ dropdown
//           dueDate: newTaskData.dueDate?.toISOString(),
//           timeSlot: newTaskData.time 
//         }),
//       });

//       if (!response.ok) throw new Error("Failed to create task");

//       const data = await response.json();
//       const apiTask = data.task;

//       const newTask: Task = {
//         id: apiTask.id,
//         columnId: newColumnId,
//         title: apiTask.title,
//         description: apiTask.description || "",
//         tags: newTaskData.tags, 
//         dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
//         priority: apiTask.priority as Priority,
//         time: newTaskData.time,
//       };

//       setTasks((prev) => ({
//         ...prev,
//         [newColumnId]: [newTask, ...prev[newColumnId]],
//       }));

//       setIsModalOpen(false);
//     } catch (err) {
//       console.error("Failed to create task:", err);
//     }
//   };

//   if (loading) {
//     return (
//       <main className="h-screen w-screen text-white flex items-center justify-center bg-black">
//         <p>Đang tải tasks...</p>
//       </main>
//     );
//   }

//   return (
//     <main
//       className="h-screen w-screen text-white p-6 transition-all duration-500 overflow-hidden"
//       style={{
//         backgroundImage: `url(${backgroundUrl})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       <div className="relative w-full h-full">
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCorners}
//           onDragStart={onDragStart}
//           onDragEnd={onDragEnd}
//           onDragOver={onDragOver}
//         >
//           <div
//             className={cn(
//               "absolute top-20 bottom-6 left-24 right-24",
//               "flex flex-col",
//               glassEffect
//             )}
//           >
//             <div className="flex justify-between items-center p-4 border-b border-white/20 shrink-0">
//               <h1 className="text-2xl font-bold">Tasks Board</h1>
//               <Button
//                 className="bg-white/90 text-black hover:bg-white"
//                 onClick={() => handleOpenModal("todo")}
//               >
//                 <Plus size={18} className="mr-2" /> Add Task
//               </Button>
//             </div>

//             <ScrollArea className="flex-1 w-full p-4">
//               <div className="flex gap-4 h-full min-w-max pb-4">
//                 <SortableContext
//                   items={columnsId}
//                   strategy={horizontalListSortingStrategy}
//                 >
//                   {columns.map((col) => (
//                     <KanbanColumn
//                       key={col.id}
//                       column={col}
//                       tasks={tasks[col.id] || []}
//                       onAddTask={handleOpenModal}
//                     />
//                   ))}
//                 </SortableContext>
//               </div>
//               <ScrollBar orientation="horizontal" />
//             </ScrollArea>
//           </div>

//           <DragOverlay>
//             {activeColumn && (
//               <KanbanColumn
//                 column={activeColumn}
//                 tasks={tasks[activeColumn.id] || []}
//                 onAddTask={handleOpenModal}
//               />
//             )}
//             {activeTask && <TaskCard task={activeTask} isOverlay />}
//           </DragOverlay>
//         </DndContext>

//         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//           <DialogContent className="bg-black/70 backdrop-blur-md border-white/20 text-white sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold">
//                 Tạo Task Mới
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title" className="text-white">Tiêu đề (Bắt buộc)</Label>
//                 <Input
//                   id="title"
//                   value={newTaskData.title}
//                   onChange={(e) => setNewTaskData(prev => ({...prev, title: e.target.value}))}
//                   className="bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
//                   placeholder="Nhập tiêu đề task..."
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="description" className="text-white">Mô tả</Label>
//                 <Input
//                   id="description"
//                   value={newTaskData.description}
//                   onChange={(e) => setNewTaskData(prev => ({...prev, description: e.target.value}))}
//                   className="bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
//                   placeholder="Nhập mô tả..."
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-white">Ngày</Label>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button
//                         variant={"outline"}
//                         className={cn(
//                           "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white",
//                           !newTaskData.dueDate && "text-gray-400"
//                         )}
//                       >
//                         <CalendarDays className="mr-2 h-4 w-4" />
//                         {newTaskData.dueDate ? format(newTaskData.dueDate, "dd/MM/yyyy") : "Chọn ngày"}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0 bg-black/70 backdrop-blur-md border-white/20 text-white">
//                       <Calendar
//                         mode="single"
//                         selected={newTaskData.dueDate}
//                         onSelect={(date) => setNewTaskData(prev => ({...prev, dueDate: date}))}
//                         className="text-white"
//                       />
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 <div className="space-y-2">
//                     <Label className="text-white">Thời gian</Label>
//                     <Input 
//                         value={newTaskData.time}
//                         onChange={(e) => setNewTaskData(prev => ({...prev, time: e.target.value}))}
//                         className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
//                         placeholder="09:00 - 10:00"
//                     />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label className="text-white">Độ ưu tiên</Label>
//                   <Select
//                     value={newTaskData.priority}
//                     onValueChange={(value: Priority) => setNewTaskData(prev => ({...prev, priority: value}))}
//                   >
//                     <SelectTrigger className="bg-white/10 border-white/20 text-white">
//                       <SelectValue placeholder="Chọn độ ưu tiên" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-black/70 backdrop-blur-md border-white/20 text-white">
//                       <SelectItem value="high">Cao</SelectItem>
//                       <SelectItem value="medium">Trung bình</SelectItem>
//                       <SelectItem value="low">Thấp</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                     <Label className="text-white">Tag</Label>
//                     {/* DROP DOWN SELECT CHO TAG */}
//                     <Select
//                         value={newTaskData.tags?.[0] || ""}
//                         onValueChange={(value) => setNewTaskData(prev => ({...prev, tags: [value]}))}
//                     >
//                         <SelectTrigger className="bg-white/10 border-white/20 text-white">
//                             <SelectValue placeholder="Chọn tag" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-black/70 backdrop-blur-md border-white/20 text-white">
//                             {Object.values(taskTags).map((tag) => (
//                                 <SelectItem key={tag.name} value={tag.name}>
//                                     {tag.name}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button variant="ghost" className="text-white hover:bg-white/10">Hủy</Button>
//               </DialogClose>
//               <Button onClick={handleAddTask} className="bg-white text-black hover:bg-gray-200">
//                 Tạo Task
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </main>
//   );
// }

"use client";

import { useState, useEffect, useMemo, FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Plus,
  CalendarDays,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- DND-Kit Imports ---
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Types ---
type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags?: string[];
  dueDate?: Date;
  time?: string;
  priority: Priority;
}

interface Column {
  id: string;
  title: string;
}

type Tasks = Record<string, Task[]>;

// --- Constants ---
const defaultColumns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "completed", title: "Complete" },
];

const statusToColumnId: Record<string, string> = {
  todo: "todo",
  in_progress: "in_progress",
  completed: "completed",
};

const columnIdToStatus: Record<string, string> = {
  todo: "todo",
  in_progress: "in_progress",
  completed: "completed",
};

// Định nghĩa Tags giống bên Calendar
const taskTags: Record<string, { name: string; color: string }> = {
  project: { name: "Project", color: "bg-blue-500" },
  study: { name: "Học tập", color: "bg-green-500" },
  meeting: { name: "Họp", color: "bg-yellow-500" },
  personal: { name: "Cá nhân", color: "bg-purple-500" },
};

const defaultNewTask: Omit<Task, "id" | "columnId"> = {
  title: "",
  description: "",
  tags: [taskTags.study.name], // Mặc định là Học tập
  priority: "medium",
  dueDate: undefined,
  time: "09:00 - 10:00",
};

// --- Component: TaskCard ---
interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

const TaskCard: FC<TaskCardProps> = ({ task, isOverlay = false }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityColors: Record<Priority, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  // Helper để lấy màu của tag
  const getTagColor = (tagName: string) => {
    const foundTag = Object.values(taskTags).find(t => t.name === tagName);
    return foundTag ? foundTag.color : "bg-white/20"; // Fallback color
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-black/40 p-3 rounded-lg shadow-md flex gap-2 cursor-grab active:cursor-grabbing",
        isOverlay && "opacity-75 shadow-2xl scale-105",
        isDragging && "opacity-30"
      )}
    >
      <div
        className={cn(
          "w-1.5 rounded-full shrink-0",
          priorityColors[task.priority]
        )}
      />

      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="font-semibold text-white truncate">{task.title}</p>

        {task.description && (
          <p className="text-sm text-gray-300 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-300">
            {task.dueDate && (
            <div className={cn("flex items-center gap-1", task.columnId !== "completed" && task.dueDate < new Date() ? "text-red-400" : "")}>
                <CalendarDays className="w-3 h-3" />
                <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
            </div>
            )}
            {task.time && (
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.time}</span>
                </div>
            )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                    "text-[10px] px-1.5 py-0 text-white border-0",
                    getTagColor(tag) // Áp dụng màu tương ứng
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: KanbanColumn ---
interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
}

const KanbanColumn: FC<KanbanColumnProps> = ({ column, tasks, onAddTask }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-80 h-full flex flex-col shrink-0",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "shrink-0 p-4 rounded-t-lg flex justify-between items-center cursor-grab",
          "bg-black/20 backdrop-blur-sm"
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{column.title}</h3>
          <Badge variant="outline" className="text-white border-white/20">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onAddTask(column.id);
          }}
        >
          <Plus size={16} />
        </Button>
      </div>

      <ScrollArea
        className={cn(
          "h-[calc(100vh-300px)] p-4 rounded-b-lg", // Đã sửa: Điều chỉnh chiều cao cho vừa vặn hơn
          "bg-white/10 border-x border-b border-white/5"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

// --- Main Page ---
export default function TaskBoardPage() {
  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop"
  );

  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [tasks, setTasks] = useState<Tasks>({
    todo: [],
    in_progress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);

  // Drag & Drop State
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTaskData, setNewTaskData] = useState<Omit<Task, "id" | "columnId">>(defaultNewTask);
  const [newColumnId, setNewColumnId] = useState<string>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const glassEffect = "bg-black/30 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const data = await response.json();
      const apiTasks = data.tasks || [];

      const tasksByColumn: Tasks = {
        todo: [],
        in_progress: [],
        completed: [],
      };

      apiTasks.forEach((apiTask: any) => {
        const columnId = statusToColumnId[apiTask.status] || "todo";
        
        let tags: string[] = [];
        if (Array.isArray(apiTask.tags)) {
            tags = apiTask.tags;
        } else if (typeof apiTask.tags === 'string') {
            try { 
                const parsed = JSON.parse(apiTask.tags);
                tags = Array.isArray(parsed) ? parsed : [apiTask.tags];
            } catch {
                tags = [apiTask.tags];
            }
        }

        const timeDisplay = apiTask.timeSlot || "09:00 - 10:00";

        const task: Task = {
          id: apiTask.id,
          columnId,
          title: apiTask.title,
          description: apiTask.description || "",
          tags: tags,
          dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
          priority: (apiTask.priority || "medium") as Priority,
          time: timeDisplay,
        };

        if(tasksByColumn[columnId]) {
             tasksByColumn[columnId].push(task);
        }
      });

      setTasks(tasksByColumn);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const findColumnForTask = (taskId: string): string | undefined => {
    return Object.keys(tasks).find((colId) =>
      tasks[colId].some((t) => t.id === taskId)
    );
  };

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column as Column);
      return;
    }
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task as Task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    if (active.data.current?.type === "Column") {
      if (active.id === over.id) return;
      setColumns((cols) => {
        const activeIndex = cols.findIndex((c) => c.id === active.id);
        const overIndex = cols.findIndex((c) => c.id === over.id);
        return arrayMove(cols, activeIndex, overIndex);
      });
      return;
    }

    if (active.data.current?.type === "Task") {
      const activeId = String(active.id);
      const overId = String(over.id);

      const activeColumnId = findColumnForTask(activeId);
      const overColumnId = findColumnForTask(overId) || (columns.find((c) => c.id === overId) ? overId : undefined);

      if (activeColumnId && overColumnId && activeColumnId === overColumnId) {
        setTasks((currentTasks) => {
          const tasksInColumn = currentTasks[activeColumnId];
          const activeIndex = tasksInColumn.findIndex((t) => t.id === activeId);
          const overIndex = tasksInColumn.findIndex((t) => t.id === overId);

          if (activeIndex !== overIndex) {
            return {
              ...currentTasks,
              [activeColumnId]: arrayMove(tasksInColumn, activeIndex, overIndex),
            };
          }
          return currentTasks;
        });
      }
    }
  }

  async function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (active.data.current?.type !== "Task") return;

    const activeColumnId = findColumnForTask(activeId);
    const overColumnId = findColumnForTask(overId) || (columns.find((c) => c.id === overId) ? overId : undefined);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setTasks((prev) => {
      const activeTask = prev[activeColumnId].find((t) => t.id === activeId);
      if (!activeTask) return prev;

      const newTasks = { ...prev };
      newTasks[activeColumnId] = newTasks[activeColumnId].filter((t) => t.id !== activeId);
      newTasks[overColumnId] = [
        ...newTasks[overColumnId],
        { ...activeTask, columnId: overColumnId },
      ];

      return newTasks;
    });

    try {
      const newStatus = columnIdToStatus[overColumnId];
      await fetch(`/api/tasks/${activeId}`, {
        method: "PATCH", // Đồng bộ dùng PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  }

  const handleOpenModal = (columnId: string = "todo") => {
    setNewColumnId(columnId);
    setNewTaskData(defaultNewTask);
    setIsModalOpen(true);
  };

  const handleAddTask = async () => {
    if (!newTaskData.title) return;

    try {
      const status = columnIdToStatus[newColumnId] || "todo";
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskData.title,
          description: newTaskData.description || "",
          status,
          priority: newTaskData.priority,
          tags: newTaskData.tags, // Gửi mảng tag đã chọn từ dropdown
          dueDate: newTaskData.dueDate?.toISOString(),
          timeSlot: newTaskData.time 
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      const data = await response.json();
      const apiTask = data.task;

      const newTask: Task = {
        id: apiTask.id,
        columnId: newColumnId,
        title: apiTask.title,
        description: apiTask.description || "",
        tags: newTaskData.tags, 
        dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
        priority: apiTask.priority as Priority,
        time: newTaskData.time,
      };

      setTasks((prev) => ({
        ...prev,
        [newColumnId]: [newTask, ...prev[newColumnId]],
      }));

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  if (loading) {
    return (
      <main className="h-screen w-screen text-white flex items-center justify-center bg-black">
        <p>Đang tải tasks...</p>
      </main>
    );
  }

  return (
    <main
      className="h-screen w-screen text-white p-6 transition-all duration-500 overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full h-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div
            className={cn(
              "absolute top-20 bottom-2 left-24 right-24", // Đã sửa: bottom-6 -> bottom-2 để kéo dài khung
              "flex flex-col",
              glassEffect
            )}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/20 shrink-0">
              <h1 className="text-2xl font-bold">Tasks Board</h1>
              <Button
                className="bg-white/90 text-black hover:bg-white"
                onClick={() => handleOpenModal("todo")}
              >
                <Plus size={18} className="mr-2" /> Add Task
              </Button>
            </div>

            <ScrollArea className="flex-1 w-full p-4">
              <div className="flex gap-4 h-full min-w-max pb-4">
                <SortableContext
                  items={columnsId}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((col) => (
                    <KanbanColumn
                      key={col.id}
                      column={col}
                      tasks={tasks[col.id] || []}
                      onAddTask={handleOpenModal}
                    />
                  ))}
                </SortableContext>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks[activeColumn.id] || []}
                onAddTask={handleOpenModal}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>
        </DndContext>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-black/70 backdrop-blur-md border-white/20 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Tạo Task Mới
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Tiêu đề (Bắt buộc)</Label>
                <Input
                  id="title"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData(prev => ({...prev, title: e.target.value}))}
                  className="bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
                  placeholder="Nhập tiêu đề task..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Mô tả</Label>
                <Input
                  id="description"
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData(prev => ({...prev, description: e.target.value}))}
                  className="bg-white/10 border-white/20 focus:bg-white/20 text-white placeholder:text-white/50"
                  placeholder="Nhập mô tả..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white",
                          !newTaskData.dueDate && "text-gray-400"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newTaskData.dueDate ? format(newTaskData.dueDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black/70 backdrop-blur-md border-white/20 text-white">
                      <Calendar
                        mode="single"
                        selected={newTaskData.dueDate}
                        onSelect={(date) => setNewTaskData(prev => ({...prev, dueDate: date}))}
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Thời gian</Label>
                    <Input 
                        value={newTaskData.time}
                        onChange={(e) => setNewTaskData(prev => ({...prev, time: e.target.value}))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        placeholder="09:00 - 10:00"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Độ ưu tiên</Label>
                  <Select
                    value={newTaskData.priority}
                    onValueChange={(value: Priority) => setNewTaskData(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/70 backdrop-blur-md border-white/20 text-white">
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Tag</Label>
                    {/* DROP DOWN SELECT CHO TAG */}
                    <Select
                        value={newTaskData.tags?.[0] || ""}
                        onValueChange={(value) => setNewTaskData(prev => ({...prev, tags: [value]}))}
                    >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Chọn tag" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/70 backdrop-blur-md border-white/20 text-white">
                            {Object.values(taskTags).map((tag) => (
                                <SelectItem key={tag.name} value={tag.name}>
                                    {tag.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10">Hủy</Button>
              </DialogClose>
              <Button onClick={handleAddTask} className="bg-white text-black hover:bg-gray-200">
                Tạo Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}