export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-dark2 px-4">
      {children}
    </div>
  );
}
