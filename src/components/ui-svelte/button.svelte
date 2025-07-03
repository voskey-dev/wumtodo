<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import { buttonVariants } from "./button-variants"
  import type { VariantProps } from "tailwind-variants"
  import type { HTMLButtonAttributes } from "svelte/elements"

  type Props = HTMLButtonAttributes & VariantProps<typeof buttonVariants> & {
    variant?: VariantProps<typeof buttonVariants>["variant"]
    size?: VariantProps<typeof buttonVariants>["size"]
    className?: string
  }

  let {
    variant = "default",
    size = "default",
    className,
    class: additionalClass = "",
    type = "button",
    children,
    onclick,
    onmouseenter,
    onmouseleave,
    onkeydown,
    ...restProps
  }: Props = $props()

  let buttonClass = $derived(cn(buttonVariants({ variant, size }), className, additionalClass))
</script>

<button
  {type}
  class={buttonClass}
  {onclick}
  {onmouseenter}
  {onmouseleave}
  {onkeydown}
  {...restProps}
>
  {@render children?.()}
</button>