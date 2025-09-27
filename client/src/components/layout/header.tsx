import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onNewItem?: () => void;
  newItemLabel?: string;
  showSearch?: boolean;
  showNewButton?: boolean;
}

export default function Header({
  title,
  description,
  searchPlaceholder = "Search...",
  onSearch,
  onNewItem,
  newItemLabel = "New Item",
  showSearch = true,
  showNewButton = true,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-64 pl-10"
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
          )}
          {showNewButton && (
            <Button onClick={onNewItem} className="bg-brand-primary hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              {newItemLabel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
