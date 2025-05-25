import Header from "@/components/Header";
import Main from "@/components/Main";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1">
        <Main />
      </div>
    </div>
  );
}
