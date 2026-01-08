import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MinutesSelect from "@/components/MinutesSelect";
import { toast } from "@/hooks/use-toast";
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from "@/lib/storage";
import { generateTemplateId } from "@/lib/timeUtils";
import type { TaskTemplate } from "@/types/morning";

const Templates = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>(getTemplates());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMinutes, setEditMinutes] = useState(5);
  
  const [newName, setNewName] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);
  const [showAdd, setShowAdd] = useState(false);

  const refreshTemplates = () => {
    setTemplates(getTemplates());
  };

  const handleAdd = () => {
    if (!newName.trim()) {
      toast({ title: "タスク名を入力してください", variant: "destructive" });
      return;
    }

    const template: TaskTemplate = {
      id: generateTemplateId(),
      name: newName.trim(),
      defaultMinutes: Math.max(1, newMinutes),
    };

    addTemplate(template);
    refreshTemplates();
    setNewName("");
    setNewMinutes(5);
    setShowAdd(false);
    toast({ title: "タスクを追加しました" });
  };

  const handleStartEdit = (template: TaskTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditMinutes(template.defaultMinutes);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editName.trim()) {
      toast({ title: "タスク名を入力してください", variant: "destructive" });
      return;
    }

    updateTemplate(editingId, {
      name: editName.trim(),
      defaultMinutes: Math.max(1, editMinutes),
    });
    
    refreshTemplates();
    setEditingId(null);
    toast({ title: "更新しました" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    refreshTemplates();
    toast({ title: "削除しました" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold flex-1">タスク管理</h1>
          <Button 
            size="sm" 
            onClick={() => setShowAdd(!showAdd)}
          >
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 新規追加フォーム */}
        {showAdd && (
          <Card className="bg-card border-primary">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">新しいタスクを追加</p>
              <div className="flex gap-2">
                <Input
                  placeholder="タスク名"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                />
                <MinutesSelect
                  value={newMinutes}
                  onChange={setNewMinutes}
                  className="w-24 h-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} size="sm">
                  <Check className="w-4 h-4 mr-1" />
                  追加
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAdd(false)}
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* テンプレート一覧 */}
        <div className="space-y-2">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card">
              <CardContent className="p-4">
                {editingId === template.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                      <MinutesSelect
                        value={editMinutes}
                        onChange={setEditMinutes}
                        className="w-24 h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        保存
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-1" />
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">
                        デフォルト: {template.defaultMinutes}分
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(template)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>タスクがありません</p>
            <p className="text-sm mt-1">上の「追加」ボタンから作成してください</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Templates;
