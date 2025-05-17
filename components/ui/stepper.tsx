import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface StepProps {
  title: string
  description?: string
  isCompleted?: boolean
  isActive?: boolean
}

export function Step({ title, description, isCompleted, isActive }: StepProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2",
          isActive && "border-primary bg-primary text-primary-foreground",
          isCompleted && "border-green-500 bg-green-500 text-white",
          !isActive && !isCompleted && "border-gray-300 text-gray-400",
        )}
      >
        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span>{title.charAt(0)}</span>}
      </div>
      <div className="text-center">
        <div className={cn("text-sm font-medium", isActive && "text-primary", isCompleted && "text-green-600")}>
          {title}
        </div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </div>
    </div>
  )
}

interface StepperProps {
  currentStep: number
  children: React.ReactNode
  className?: string
}

export function Stepper({ currentStep, children, className }: StepperProps) {
  const steps = React.Children.toArray(children)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-start relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <React.Fragment key={index}>
              {React.isValidElement(step) &&
                React.cloneElement(step as React.ReactElement<StepProps>, {
                  isCompleted,
                  isActive,
                })}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mt-4 mx-2 relative">
                  <div className={cn("absolute inset-0 bg-gray-200", index < currentStep && "bg-green-500")} />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
