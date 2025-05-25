import Header from "@/components/Header";
import Main from "@/components/Main";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <Main />
      </div>
    </>
  );
}
