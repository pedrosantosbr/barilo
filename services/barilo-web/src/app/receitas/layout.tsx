export default function RecipesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <aside className="w-[250px] fixed border-r h-[100vh]"></aside>
      <div className="lg:pl-[250px]">{children}</div>
    </div>
  );
}
