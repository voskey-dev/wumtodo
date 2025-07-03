<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import { tv, type VariantProps } from "tailwind-variants"
  import type { HTMLAttributes } from "svelte/elements"

  const badgeVariants = tv({
    base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  })

  type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants> & {
    variant?: VariantProps<typeof badgeVariants>["variant"]
    className?: string
  }

  let {
    variant = "default",
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let badgeClass = $derived(cn(badgeVariants({ variant }), className, additionalClass))
</script>

<div class={badgeClass} {...restProps}>
  {@render children?.()}
</div>