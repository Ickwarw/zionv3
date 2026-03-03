"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getTextColorForBackground } from '@/lib/utils';

import { cn } from "@/lib/utils"

export function MultiTagSelect({ tags, value, className, addTag, removeTag, readOnly = false }) {
  const [open, setOpen] = useState(false);

  // const toggleValue = (id) => {
  //   if (value.includes(id)) {
  //     onChange(value.filter((t) => t !== id));
  //   } else {
  //     onChange([...value, id]);
  //   }
  // };

  // const removeTag = (id) => {
  //   onChange(value.filter((t) => t !== id));
  // };

  // Recupera objeto inteiro com base nos IDs selecionados
  const selectedTags = tags.filter((t) => value.includes(t.id));

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
                "flex min-h-10 w-full items-start justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                className
            )}
        >
            {selectedTags.length === 0 ? (
              <span className="text-muted-foreground text-white">Selecione tags...</span>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: tag.color,// + "22"
                      borderColor: tag.color + "22", 
                      color: getTextColorForBackground(tag.color),
                    }}
                  >
                    {tag.name}
                    {!readOnly && (
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag.id);
                        }}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </button>
        </PopoverTrigger>
        {!readOnly && (
          <PopoverContent className="w-[260px] p-0">
            <Command>
              <CommandInput placeholder="Buscar tag..." />
              <CommandList>
                <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>

                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => addTag(tag.id)} //toggleValue(tag.id)}
                    className="flex justify-between cursor-pointer"

                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>

                    {value.includes(tag.id) ? "✓" : ""}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
