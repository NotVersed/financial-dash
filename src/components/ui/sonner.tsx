/*

This component is a wrapper around the Sonner Toaster component, which provides a consistent 
styling and theming for toast notifications in the application. It uses the useTheme hook 
from next-themes to determine the current theme and applies it to the Sonner component. 
The icons for different toast types are also customized using lucide-react icons.

How to trigger notifications: import and call Sonner's API, for example:
  import { toast } from "sonner"
  toast.success("Saved"), 
  toast.error("Failed"), 
  toast("Hello"), 
  toast.loading("Saving...")

*/


"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
