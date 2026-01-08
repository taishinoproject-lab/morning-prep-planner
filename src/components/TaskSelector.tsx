import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, Minus } from "lucide-react";
import type { TaskTemplate, PlanTask } from "@/types/morning";
import { generateTaskId } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

interface TaskSelectorProps {
  templates: TaskTemplate[];
  selectedTasks: PlanTask[];
  onTasksChange: (tasks: PlanTask[]) => void;
}

const TaskSelector = ({ templates, selectedTasks, onTasksChange }: TaskSelectorProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isSelected = (templateId: string) => {
    return selectedTasks.some(t => t.templateId === templateId);
  };

  const toggleTask = (template: TaskTemplate) => {
    if (isSelected(template.id)) {
      // 削除
      const newTasks = selectedTasks
        .filter(t => t.templateId !== template.id)
        .map((t, i) => ({ ...t, order: i }));
      onTasksChange(newTasks);
    } else {
      // 追加
      const newTask: PlanTask = {
        id: generateTaskId(),
        templateId: template.id,
        name: template.name,
        minutes: template.defaultMinutes,
        order: selectedTasks.length,
      };
      onTasksChange([...selectedTasks, newTask]);
    }
  };

  const updateTaskMinutes = (taskId: string, minutes: number) => {
    const newMinutes = Math.max(1, minutes);
    onTasksChange(
      selectedTasks.map(t => 
        t.id === taskId ? { ...t, minutes: newMinutes } : t
      )
    );
  };

  const adjustMinutes = (taskId: string, delta: number) => {
    const task = selectedTasks.find(t => t.id === taskId);
    if (task) {
      updateTaskMinutes(taskId, task.minutes + delta);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTasks = [...selectedTasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, removed);
    
    // orderを更新
    const reordered = newTasks.map((t, i) => ({ ...t, order: i }));
    onTasksChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 選択済みタスクをorderでソート
  const sortedSelected = [...selectedTasks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* テンプレートから選択 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">タスクを選択</p>
        <div className="flex flex-wrap gap-2">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => toggleTask(template)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                isSelected(template.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground border border-border hover:bg-accent"
              )}
            >
              <Checkbox 
                checked={isSelected(template.id)} 
                className="pointer-events-none"
              />
              {template.name}
              <span className="opacity-70">{template.defaultMinutes}分</span>
            </button>
          ))}
        </div>
      </div>

      {/* 選択済みタスク（並べ替え・時間調整） */}
      {sortedSelected.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            順番と時間を調整（ドラッグで並べ替え）
          </p>
          <div className="space-y-2">
            {sortedSelected.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-2 p-3 bg-card rounded-lg border border-border",
                  draggedIndex === index && "opacity-50 ring-2 ring-primary"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="flex-1 font-medium">{task.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustMinutes(task.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={task.minutes}
                    onChange={(e) => updateTaskMinutes(task.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustMinutes(task.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-1">分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSelector;
