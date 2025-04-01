"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GripVertical, Eye, EyeOff, Plus, Trash2, Lock } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export interface Section {
  id: string
  name: string
  visible: boolean
  type?: string
  requiresPro?: boolean
}

interface SectionReorderProps {
  onReorder: (sections: Section[]) => void
  currentPlan?: "starter" | "pro" | "enterprise"
  onUpgradeClick?: () => void
}

export function SectionReorder({ onReorder, currentPlan = "starter", onUpgradeClick }: SectionReorderProps) {
  // Default sections that would be in the website
  const [sections, setSections] = useState<Section[]>([
    { id: "hero", name: "Hero Section", visible: true, type: "hero" },
    { id: "about", name: "About Us", visible: true, type: "about" },
    { id: "services", name: "Services/Products", visible: true, type: "services" },
    { id: "gallery", name: "Gallery", visible: true, type: "gallery" },
    { id: "testimonials", name: "Testimonials", visible: true, type: "testimonials" },
    { id: "contact", name: "Contact Form", visible: true, type: "contact" },
  ])

  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [selectedSectionType, setSelectedSectionType] = useState<string>("custom")
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  const predefinedSections = [
    {
      id: "custom",
      name: "Custom Section",
      description: "Create a custom section with your own content",
      requiresPro: false,
    },
    { id: "team", name: "Team Members", description: "Showcase your team with photos and bios", requiresPro: false },
    { id: "faq", name: "FAQ", description: "Frequently asked questions in an accordion format", requiresPro: false },
    { id: "pricing", name: "Pricing Table", description: "Display your pricing plans", requiresPro: false },
    {
      id: "advanced-gallery",
      name: "Advanced Gallery/Slideshow",
      description: "Interactive image gallery with slideshow",
      requiresPro: true,
    },
    {
      id: "contact-form",
      name: "Advanced Contact Form",
      description: "Multi-field contact form with validation",
      requiresPro: true,
    },
    { id: "newsletter", name: "Newsletter Signup", description: "Email subscription form", requiresPro: true },
    { id: "map", name: "Location Map", description: "Interactive map showing your location", requiresPro: true },
  ]

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null) return

    const newSections = [...sections]
    const draggedSection = newSections[draggedItem]

    // Remove the dragged item
    newSections.splice(draggedItem, 1)
    // Insert it at the new position
    newSections.splice(index, 0, draggedSection)

    setSections(newSections)
    setDraggedItem(index)
    onReorder(newSections) // Update UI immediately during drag
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    onReorder(sections) // Ensure final state is passed to parent
  }

  const toggleSectionVisibility = (index: number) => {
    const newSections = [...sections]
    newSections[index].visible = !newSections[index].visible
    setSections(newSections)
    onReorder(newSections)
  }

  const handleAddSection = () => {
    const selectedPredefined = predefinedSections.find((s) => s.id === selectedSectionType)

    // Check if this is a pro feature
    if (selectedPredefined?.requiresPro && currentPlan === "starter") {
      setShowUpgradeDialog(true)
      setShowAddDialog(false)
      return
    }

    // For custom sections, require a name
    if (selectedSectionType === "custom" && !newSectionName.trim()) return

    const sectionName = selectedSectionType === "custom" ? newSectionName : selectedPredefined?.name || "New Section"

    const newSection: Section = {
      id: `${selectedSectionType}-${Date.now()}`,
      name: sectionName,
      visible: true,
      type: selectedSectionType,
      requiresPro: selectedPredefined?.requiresPro,
    }

    const newSections = [...sections, newSection]
    setSections(newSections)
    onReorder(newSections)
    setNewSectionName("")
    setSelectedSectionType("custom")
    setShowAddDialog(false)
  }

  const handleDeleteSection = (index: number) => {
    setSectionToDelete(index)
  }

  const confirmDeleteSection = () => {
    if (sectionToDelete === null) return

    const newSections = [...sections]
    newSections.splice(sectionToDelete, 1)
    setSections(newSections)
    onReorder(newSections)
    setSectionToDelete(null)
  }

  const handleUpgrade = () => {
    setShowUpgradeDialog(false)
    if (onUpgradeClick) {
      onUpgradeClick()
    }
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <GripVertical className="h-4 w-4" />
            <span className="hidden sm:inline">Arrange Sections</span>
            <span className="sm:hidden">Arrange</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90%] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Arrange Website Sections</SheetTitle>
            <SheetDescription>Drag and drop sections to reorder them or toggle their visibility.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2 max-h-[60vh] overflow-y-auto">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  section.visible ? "bg-background" : "bg-muted/50"
                } ${draggedItem === index ? "opacity-50 border-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab touch-manipulation" />
                  <div>
                    <span className={section.visible ? "" : "text-muted-foreground"}>{section.name}</span>
                    {section.requiresPro && (
                      <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary">
                        Pro
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={section.visible ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleSectionVisibility(index)}
                    className="h-8"
                  >
                    {section.visible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Show</span>
                      </>
                    )}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSection(index)} className="h-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Section
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Section Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>Choose a section type or create a custom section.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={selectedSectionType}
              onValueChange={setSelectedSectionType}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {predefinedSections.map((section) => (
                <div key={section.id} className="relative">
                  <RadioGroupItem value={section.id} id={section.id} className="peer sr-only" />
                  <Label
                    htmlFor={section.id}
                    className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{section.name}</span>
                      {section.requiresPro && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{section.description}</span>
                    {section.requiresPro && currentPlan === "starter" && (
                      <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedSectionType === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Custom Section Name</Label>
                <Input
                  id="name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Team Members, FAQ, Pricing"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={sectionToDelete !== null} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>This feature is only available on the Pro and Enterprise plans.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro Plan Features</CardTitle>
                <CardDescription>Unlock premium sections and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                  <span>Advanced galleries and slideshows</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                  <span>Advanced contact forms</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                  <span>Newsletter signup forms</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                  <span>Interactive maps</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpgrade} className="w-full">
                  Upgrade Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

