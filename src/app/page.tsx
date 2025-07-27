import Header from "@/components/Header";
import Main from "@/components/Main";
//import { DevTokenHelper } from "@/components/DevTokenHelper";
//import { TokenDebugger } from "@/components/TokenDebugger";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1">
        <Main />
        <div className="mt-8 w-full max-w-2xl">
          {/* <DevTokenHelper />
          <TokenDebugger /> */}
        </div>
      </div>
    </div>
  );
}
