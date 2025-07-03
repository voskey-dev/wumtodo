<script lang="ts">
  import { Calendar as CalendarPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";

  type Props = CalendarPrimitive.RootProps & {
    className?: string;
  };

  let {
    value = undefined,
    placeholder = undefined,
    onValueChange = undefined,
    className = undefined,
    class: additionalClass = "",
    weekdayFormat = "short",
    ...restProps
  }: Props = $props();

  let calendarClass = $derived(cn("p-3", className, additionalClass));
  
  const months = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];
</script>

<CalendarPrimitive.Root
  bind:value
  bind:placeholder
  {onValueChange}
  {weekdayFormat}
  class={calendarClass}
  let:months
  let:weekdays
  {...restProps}
>
  <CalendarPrimitive.Header>
    <CalendarPrimitive.PrevButton>
      <ChevronLeft class="h-4 w-4" />
    </CalendarPrimitive.PrevButton>
    <CalendarPrimitive.Heading />
    <CalendarPrimitive.NextButton>
      <ChevronRight class="h-4 w-4" />
    </CalendarPrimitive.NextButton>
  </CalendarPrimitive.Header>
  
  {#each months as month}
    <CalendarPrimitive.Grid>
      <CalendarPrimitive.GridHead>
        <CalendarPrimitive.GridRow class="flex">
          {#each weekdays as weekday}
            <CalendarPrimitive.HeadCell>
              {weekday.slice(0, 2)}
            </CalendarPrimitive.HeadCell>
          {/each}
        </CalendarPrimitive.GridRow>
      </CalendarPrimitive.GridHead>
      <CalendarPrimitive.GridBody>
        {#each month.weeks as weekDates}
          <CalendarPrimitive.GridRow class="flex w-full mt-2">
            {#each weekDates as date}
              <CalendarPrimitive.Cell {date}>
                <CalendarPrimitive.Day {date} month={month.value} />
              </CalendarPrimitive.Cell>
            {/each}
          </CalendarPrimitive.GridRow>
        {/each}
      </CalendarPrimitive.GridBody>
    </CalendarPrimitive.Grid>
  {/each}
</CalendarPrimitive.Root>

<style>
  :global([data-calendar-root]) {
    @apply w-auto;
  }

  :global([data-calendar-months]) {
    @apply flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 sm:gap-y-0;
  }

  :global([data-calendar-grid]) {
    @apply w-full border-collapse space-y-1;
  }

  :global([data-calendar-header]) {
    @apply relative flex w-full items-center justify-between pt-1;
  }

  :global([data-calendar-heading]) {
    @apply text-sm font-medium;
  }

  :global([data-calendar-grid-head]) {
    
  }

  :global([data-calendar-grid-row]) {
    @apply flex;
  }

  :global([data-calendar-head-cell]) {
    @apply w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground;
  }

  :global([data-calendar-prev-button]),
  :global([data-calendar-next-button]) {
    @apply inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
  }

  :global([data-calendar-prev-button]) {
    @apply absolute left-1;
  }

  :global([data-calendar-next-button]) {
    @apply absolute right-1;
  }

  :global([data-calendar-cell]) {
    @apply relative h-8 w-8 p-0 text-center text-sm;
  }

  :global([data-calendar-day]) {
    @apply inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }

  :global([data-calendar-day][data-disabled]) {
    @apply text-muted-foreground opacity-50;
  }

  :global([data-calendar-day][data-selected]) {
    @apply bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground;
  }

  :global([data-calendar-day][data-outside-month]) {
    @apply text-muted-foreground opacity-50;
  }

  :global([data-calendar-day][data-unavailable]) {
    @apply text-destructive-foreground line-through;
  }
</style>