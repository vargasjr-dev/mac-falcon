import StarField from "~/components/StarField";

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarField count={140} />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
