"use client"

import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search videos..."
        className="pl-8"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}

