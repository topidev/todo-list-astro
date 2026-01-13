import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "../../lib/utils"

// ────────────────────────────────────────────────
// Avatar (contenedor principal)
// ────────────────────────────────────────────────
interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {}

function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

Avatar.displayName = "Avatar"

// ────────────────────────────────────────────────
// AvatarImage
// ────────────────────────────────────────────────
interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
}

AvatarImage.displayName = "AvatarImage"

// ────────────────────────────────────────────────
// AvatarFallback
// ────────────────────────────────────────────────
interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {}

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }


// import * as React from "react"
// import * as AvatarPrimitive from "@radix-ui/react-avatar"
// import { cn } from "../../lib/utils"

// // propiedades de un span click, classname, id, aria-...
// interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}


// const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
//   ({ className, ...props }, ref) => (
//     <AvatarPrimitive.Root
//       ref={ref}
//       className={cn(
//         "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
//         className
//       )}
//       {...props}
//     />
//   )
// )
// Avatar.displayName = "Avatar"

// interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

// const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
//   ({ className, ...props }, ref) => (
//     <AvatarPrimitive.Image
//       ref={ref}
//       className={cn("aspect-square h-full w-full", className)}
//       {...props}
//     />
//   )
// )
// AvatarImage.displayName = "AvatarImage"

// interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

// const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
//   ({ className, ...props }, ref) => (
//     <AvatarPrimitive.Fallback
//       ref={ref}
//       className={cn(
//         "flex h-full w-full items-center justify-center rounded-full bg-muted",
//         className
//       )}
//       {...props}
//     />
//   )
// )
// AvatarFallback.displayName = "AvatarFallback"

// export { Avatar, AvatarImage, AvatarFallback }