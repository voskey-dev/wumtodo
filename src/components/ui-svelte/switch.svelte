<script lang="ts">
  import { Switch as SwitchPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";

  type Props = SwitchPrimitive.RootProps & {
    className?: string;
  };

  let {
    checked = false,
    onCheckedChange = undefined,
    disabled = false,
    name = undefined,
    required = false,
    value = "on",
    className,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let switchClass = $derived(cn(
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
    className,
    additionalClass
  ));

  let thumbClass = $derived(cn(
    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  ));
</script>

<SwitchPrimitive.Root
  bind:checked
  {onCheckedChange}
  {disabled}
  {name}
  {required}
  {value}
  class={switchClass}
  {...restProps}
>
  <SwitchPrimitive.Thumb class={thumbClass} />
</SwitchPrimitive.Root>