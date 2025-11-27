import Image from "next/image";
import Hero from "../components/Hero";
import DataDisplay from "../components/DataDisplay";

export default function Home() {
  return (
    <div className="flex  items-center justify-center bg-zinc-50 font-sans">
      <Hero />
        <DataDisplay />
    </div>
  );
}
