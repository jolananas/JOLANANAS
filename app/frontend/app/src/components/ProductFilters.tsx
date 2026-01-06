"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { Separator } from "@/components/ui/Separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { Slider } from "@/components/ui/Slider"
import { Form } from "@/components/ui/Form"

interface ProductFiltersProps {
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onClearFilters: () => void
}

export function ProductFilters({
  availableTags,
  selectedTags,
  onTagsChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [open, setOpen] = useState(false)

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const hasActiveFilters = selectedTags.length > 0 || sortBy !== "featured"

  return (
    <div className="flex items-center gap-4">
      {/* Sort Dropdown - Desktop */}
      <div className="hidden md:block">
        <RadioGroup value={sortBy} onValueChange={onSortChange}>
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Trier par:</Label>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="featured" id="featured" />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                Recommandés
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-asc" id="price-asc" />
              <Label htmlFor="price-asc" className="text-sm cursor-pointer">
                Prix croissant
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-desc" id="price-desc" />
              <Label htmlFor="price-desc" className="text-sm cursor-pointer">
                Prix décroissant
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Filter Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Filtres</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <Accordion type="multiple" className="mt-6">
            {/* Sort - Mobile */}
            <AccordionItem value="sort" className="md:hidden">
              <AccordionTrigger>
                <Label className="text-sm font-semibold">Trier par</Label>
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={sortBy} onValueChange={onSortChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="featured" id="m-featured" />
                    <Label htmlFor="m-featured" className="text-sm cursor-pointer">
                      Recommandés
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-asc" id="m-price-asc" />
                    <Label htmlFor="m-price-asc" className="text-sm cursor-pointer">
                      Prix croissant
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-desc" id="m-price-desc" />
                    <Label htmlFor="m-price-desc" className="text-sm cursor-pointer">
                      Prix décroissant
                    </Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            {/* Tags Filter */}
            <AccordionItem value="categories">
              <AccordionTrigger>
                <Label className="text-sm font-semibold">Catégories</Label>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label htmlFor={tag} className="text-sm cursor-pointer capitalize">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </div>
  )
}
