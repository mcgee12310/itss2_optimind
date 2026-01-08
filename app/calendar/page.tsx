"use client";

import { useState, useEffect, FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Clock,
  Tag as TagIcon,
  X,
  Pencil,
  Trash2,
  Check,
  Calendar as CalendarIcon,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Định nghĩa Type ---
interface TaskTag {
  name: string;
  color: string;
}

type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm - HH:mm"
  tag: TaskTag;
  description: string;
  completed: boolean;
  priority: Priority;
}

// Tags definitions
const taskTags: Record<string, TaskTag> = {
  project: { name: "Project", color: "bg-blue-500" },
  study: { name: "Học tập", color: "bg-green-500" },
  meeting: { name: "Họp", color: "bg-yellow-500" },
  personal: { name: "Cá nhân", color: "bg-purple-500" },
};

const today = new Date();
const todayString = format(today, "yyyy-MM-dd");

// Default values khi mở form tạo mới
const defaultTaskValues: Omit<Task, "id" | "completed"> = {
  title: "",
  date: todayString,
  time: "09:00 - 10:00",
  tag: taskTags.study,
  description: "",
  priority: "medium",
};

const TaskCalendar: FC = () => {
  // === State quản lý giao diện ===

  const [loading, setLoading] = useState(true);
  
  // === State cho Lịch & Task ===
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<Date | undefined>(today);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // === State cho Filter Tag (Mới thêm) ===
  // Mặc định chọn tất cả các tag
  const [selectedTags, setSelectedTags] = useState<string[]>(Object.values(taskTags).map(t => t.name));

  // === State cho Dialog (Thêm/Sửa Task) ===
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState(defaultTaskValues);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        
        const apiTasks = data.tasks || data;

        const formattedTasks: Task[] = apiTasks.map((task: any) => {
          let timeDisplay = "09:00 - 10:00"; 
          if (task.timeSlot) {
             timeDisplay = task.timeSlot;
          } else if (task.startTime && task.endTime) {
             const start = new Date(task.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
             const end = new Date(task.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
             timeDisplay = `${start} - ${end}`;
          }

          let tagName = "Học tập";
          try {
            if (Array.isArray(task.tags) && task.tags.length > 0) {
               tagName = task.tags[0]; 
            } else if (typeof task.tags === 'string') {
               if(task.tags.startsWith("[")) {
                  const parsed = JSON.parse(task.tags);
                  tagName = parsed[0];
               } else {
                  tagName = task.tags;
               }
            }
          } catch (e) {
             console.error("Tag parse error", e);
          }
          
          const foundTag = Object.values(taskTags).find(t => t.name === tagName) || taskTags.study;

          return {
            id: task.id,
            title: task.title,
            date: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : todayString,
            time: timeDisplay,
            tag: foundTag,
            description: task.description || "",
            completed: task.status === "completed",
            priority: (task.priority as Priority) || "medium",
          };
        });
        
        setTasks(formattedTasks);
        
        const firstTask = formattedTasks.find((t) => t.date === todayString) || null;
        setSelectedTask(firstTask);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // --- Logic Lọc Task (Sửa lỗi) ---
  const selectedDateString = date ? format(date, "yyyy-MM-dd") : "";
  const tasksForSelectedDay = tasks.filter((task) => {
    // 1. Lọc theo ngày
    const isSameDate = task.date === selectedDateString;
    // 2. Lọc theo tag
    const isTagSelected = selectedTags.includes(task.tag.name);
    
    return isSameDate && isTagSelected;
  });

  // --- Handlers Filter Tag ---
  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) // Bỏ chọn
        : [...prev, tagName] // Chọn thêm
    );
  };

  const toggleAllTags = (checked: boolean) => {
    if (checked) {
      setSelectedTags(Object.values(taskTags).map(t => t.name));
    } else {
      setSelectedTags([]);
    }
  };

  const isAllTagsSelected = selectedTags.length === Object.values(taskTags).length;

  // Style Glassmorphism
  const glassEffect =
    "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg";

  const formattedDateHeader = date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(date)
    : "Vui lòng chọn một ngày";

  // --- Handlers ---

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    const newDateString = format(selectedDate, "yyyy-MM-dd");
    const firstTask = tasks.find((t) => t.date === newDateString) || null;
    setSelectedTask(firstTask);
  };

  const handleOpenAddDialog = () => {
    setCurrentTask(null);
    setFormData({
      ...defaultTaskValues,
      date: selectedDateString || todayString,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setCurrentTask(task);
    setFormData(task);
    setIsDialogOpen(true);
  };

  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Optimistic Update cho Toggle Task
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompletedState = !task.completed;
    const newStatus = newCompletedState ? "completed" : "todo";

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: newCompletedState } : t
      )
    );
    if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, completed: newCompletedState } : null));
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");
    } catch (err) {
      console.error("Failed to toggle task:", err);
      // Revert UI nếu lỗi
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !newCompletedState } : t
        )
      );
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, completed: !newCompletedState } : null));
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if(!confirm("Bạn có chắc chắn muốn xóa công việc này không?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleSaveTask = async () => {
    if (!formData.title) return;

    const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.date ? new Date(formData.date).toISOString() : undefined,
        timeSlot: formData.time,
        priority: formData.priority,
        tags: [formData.tag.name],
        status: "todo",
    };

    try {
      if (currentTask) {
        // UPDATE
        const response = await fetch(`/api/tasks/${currentTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to update task");

        const updatedTask = { ...currentTask, ...formData, completed: currentTask.completed };
        setTasks(tasks.map((t) => (t.id === currentTask.id ? updatedTask : t)));
        setSelectedTask(updatedTask);
      } else {
        // CREATE
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to create task");

        const newTaskData = await response.json();
        const apiTask = newTaskData.task || newTaskData;

        const newTask: Task = {
          id: apiTask.id,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          tag: formData.tag,
          description: formData.description,
          completed: false,
          priority: formData.priority,
        };
        setTasks([newTask, ...tasks]);
        if (newTask.date === selectedDateString) {
          setSelectedTask(newTask);
        }
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  if (loading) {
    return (
      <main className="h-screen w-screen text-white flex items-center justify-center bg-black">
        <p>Đang tải công việc...</p>
      </main>
    );
  }

  const getPriorityColor = (p: Priority) => {
    switch (p) {
        case "high": return "text-red-400 border-red-400 bg-red-400/10";
        case "low": return "text-green-400 border-green-400 bg-green-400/10";
        default: return "text-yellow-400 border-yellow-400 bg-yellow-400/10";
    }
  }

  return (
    <main className="h-screen w-screen text-white p-6 transition-all duration-500">
      <div className="relative w-full h-full">
        <div
          className={cn(
            "absolute top-20 bottom-6 left-24 right-24", 
            "flex divide-x divide-white/20",
            glassEffect
          )}
        >
          {/* --- Cột 1: Lịch & Filter --- */}
          <div className="flex-[0.25] p-4 flex flex-col gap-4 overflow-y-auto">
            <Button
              className="bg-white text-black hover:bg-gray-200 w-full shadow-md"
              onClick={handleOpenAddDialog}
            >
              <Plus size={18} className="mr-2" /> Thêm công việc
            </Button>
            
            <div className="mt-2">
              <h3 className="font-semibold mb-2">Lịch</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelectDate}
                className={cn(
                  "bg-transparent",
                  "p-0 m-0",
                  "[&_button[aria-selected]]:bg-white/30 text-white",
                  "[&_caption_button]:bg-white/10"
                )}
              />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tag-all"
                    checked={isAllTagsSelected} 
                    onCheckedChange={toggleAllTags} 
                    className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <Label htmlFor="tag-all" className="text-sm cursor-pointer">
                    Tất cả
                  </Label>
                </div>
                {Object.values(taskTags).map((tag) => (
                  <div className="flex items-center space-x-2" key={tag.name}>
                    <Checkbox
                      id={`tag-${tag.name}`}
                      checked={selectedTags.includes(tag.name)} // Binding state
                      onCheckedChange={() => toggleTag(tag.name)} // Handle change
                      className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <Label
                      htmlFor={`tag-${tag.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Cột 2: Danh sách Công việc --- */}
          <div className="flex-[0.45] p-4 flex flex-col">
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                size={18}
              />
              <Input
                placeholder="Tìm kiếm công việc..."
                className="bg-white/10 border-none pl-10 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/80"
              />
            </div>
            <h2 className="text-xl font-bold mb-3 truncate capitalize">
              {formattedDateHeader}
            </h2>
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-3">
                {tasksForSelectedDay.length > 0 ? (
                  tasksForSelectedDay.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer group",
                        "hover:bg-white/20",
                        selectedTask?.id === task.id
                          ? "bg-white/20 ring-1 ring-white/30"
                          : "",
                        task.completed && "opacity-50"
                      )}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                          className="border-white/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            task.completed && "line-through"
                          )}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-white/70">
                                {task.time}
                            </span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase", getPriorityColor(task.priority))}>
                                {task.priority}
                            </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full text-white shadow-sm bg-opacity-70",
                          task.tag.color
                        )}
                      >
                        {task.tag.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-white/50">
                    <p>Không có công việc nào.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* --- Cột 3: Chi tiết Công việc --- */}
          <div className="flex-[0.30] p-4 overflow-y-auto">
            {selectedTask ? (
              <div className="space-y-5 animate-in slide-in-from-right-5 fade-in duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Chi tiết</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/20 -mr-2"
                    onClick={() => setSelectedTask(null)}
                  >
                    <X size={20} />
                  </Button>
                </div>
                
                <h3 className="text-2xl font-semibold">{selectedTask.title}</h3>

                <div className="flex items-center gap-2 text-white/80">
                  <Clock size={16} />
                  <span>{selectedTask.time} ({selectedTask.date})</span>
                </div>

                <div className="flex items-center gap-2">
                  <TagIcon size={16} className="text-white/80" />
                  <span
                    className={cn(
                      "text-sm font-medium px-3 py-1 rounded-full shadow-sm text-white bg-opacity-70",
                      selectedTask.tag.color
                    )}
                  >
                    {selectedTask.tag.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                    <Flag size={16} className="text-white/80" />
                    <span className={cn("text-sm font-medium px-3 py-1 rounded-full border uppercase", getPriorityColor(selectedTask.priority))}>
                        {selectedTask.priority === 'high' ? 'Cao' : selectedTask.priority === 'low' ? 'Thấp' : 'Trung bình'}
                    </span>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Mô tả</h4>
                  <p className="text-sm text-white/90 bg-white/10 p-3 rounded-md min-h-[80px]">
                    {selectedTask.description || "Không có mô tả."}
                  </p>
                </div>

                {/* Các nút hành động */}
                <div className="flex gap-3 pt-4 border-t border-white/20">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleToggleTask(selectedTask.id)}
                  >
                    <Check size={18} className="mr-2" />
                    {selectedTask.completed ? "Đánh dấu Chưa làm" : "Hoàn thành"}
                  </Button>
                  <Button
                      variant="outline"
                      className="bg-transparent hover:bg-white/20 text-white"
                      onClick={() => handleOpenEditDialog(selectedTask)}
                  >
                      <Pencil size={16} />
                  </Button>
                  <Button
                      variant="destructive"
                      className="bg-red-600/80 hover:bg-red-600"
                      onClick={() => handleDeleteTask(selectedTask.id)}
                  >
                      <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                <p>Chọn một công việc để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* === Dialog Thêm/Sửa Task === */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-black/70 backdrop-blur-md border-white/20 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">
                {currentTask ? "Chỉnh sửa Công việc" : "Tạo Công việc mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-white">Tên Task (Bắt buộc)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Ví dụ: Hoàn thành Báo cáo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="text-white">Ngày</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white",
                                    !formData.date && "text-gray-300"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.date ? (
                                    format(new Date(formData.date), "dd/MM/yyyy")
                                ) : (
                                    <span>Chọn ngày</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-black/70 backdrop-blur-md border-white/20 text-white">
                            <Calendar
                                mode="single"
                                selected={formData.date ? new Date(formData.date) : undefined}
                                onSelect={(d) => handleFormChange("date", d ? format(d, 'yyyy-MM-dd') : '')}
                                initialFocus
                                className="text-white"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label className="text-white">Thời gian</Label>
                    <Input 
                        id="time"
                        value={formData.time}
                        onChange={(e) => handleFormChange("time", e.target.value)}
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                        placeholder="09:00 - 10:00"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label className="text-white">Độ ưu tiên</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(val) => handleFormChange("priority", val)}
                    >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                            <SelectValue placeholder="Chọn độ ưu tiên" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/70 backdrop-blur-md border-white/20 text-white">
                            <SelectItem value="high">Cao</SelectItem>
                            <SelectItem value="medium">Trung bình</SelectItem>
                            <SelectItem value="low">Thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="text-white">Tag</Label>
                    <Select
                    value={formData.tag.name}
                    onValueChange={(val) => {
                        const key = Object.keys(taskTags).find(
                        (k) => taskTags[k].name === val
                        );
                        if (key) handleFormChange("tag", taskTags[key]);
                    }}
                    >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
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

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-white">Nội dung (Ghi chú)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Ví dụ: Trang 1-5, cần 3 biểu đồ..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white">
                    Hủy
                </Button>
              </DialogClose>
              <Button onClick={handleSaveTask} className="bg-white text-black hover:bg-gray-200">
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default TaskCalendar;