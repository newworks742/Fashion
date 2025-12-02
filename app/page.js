//import Image from "next/image";//
import Hero from "../components/Hero";
import {CountdownBanner} from "../components/CountdownBanner"
// import GenderCategories from "../components/GenderCategories";
import {LatestDrops} from "../components/LatestDrops";




export default function Home() {
  return (
    <div className="items-center justify-center bg-zinc-50 font-sans">
      <Hero />

        <CountdownBanner />
     <LatestDrops />
     
    </div>
    
  );

}
