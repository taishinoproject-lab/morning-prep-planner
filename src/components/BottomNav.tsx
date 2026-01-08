import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Sun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "ホーム", icon: Home },
  { path: "/plan", label: "プラン", icon: Calendar },
  { path: "/morning", label: "朝", icon: Sun },
  { path: "/templates", label: "タスク", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center py-3 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
