import MainSidebar from "@/src/components/core/mainsidebar";
import { cn } from "@/src/lib/utils";

export default function RMVolumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto md:flex w-full min-h-screen flex-1 rounded-md border border-neutral-200 bg-gray-100 dark:border-dark3 dark:bg-dark2"
      )}
    >
     <aside className="lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:overflow-y-auto">
        <MainSidebar />
      </aside>
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
